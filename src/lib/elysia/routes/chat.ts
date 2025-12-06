import { Elysia, t } from "elysia";
import { authGuard } from "@/lib/elysia/auth";
import {
	chatMessageService,
	chatRoomMemberService,
	chatRoomService,
} from "@/lib/services/chat";
import { userService } from "@/lib/services/user";

// 공통 스키마
const UserSchema = t.Object({
	id: t.String(),
	nickname: t.String(),
	profileImage: t.Nullable(t.String()),
});

const MemberSchema = t.Object({
	id: t.String(),
	nickname: t.String(),
	profileImage: t.Nullable(t.String()),
	joinedAt: t.String(),
});

const MessageSchema = t.Object({
	id: t.String(),
	content: t.String(),
	createdAt: t.String(),
	user: UserSchema,
});

const SimpleUserSchema = t.Object({
	id: t.String(),
	nickname: t.String(),
});

const LastMessageSchema = t.Object({
	content: t.String(),
	createdAt: t.String(),
	user: SimpleUserSchema,
});

const MarketInfoSchema = t.Object({
	id: t.String(),
	title: t.String(),
	price: t.Nullable(t.Number()),
	status: t.String(),
	userId: t.String(),
	thumbnail: t.Nullable(t.String()),
});

const RoomItemSchema = t.Object({
	id: t.String(),
	name: t.Nullable(t.String()),
	createdAt: t.String(),
	members: t.Array(UserSchema),
	lastMessage: t.Nullable(LastMessageSchema),
	messageCount: t.Number(),
	market: t.Nullable(MarketInfoSchema),
});

const RoomDetailSchema = t.Object({
	id: t.String(),
	name: t.Nullable(t.String()),
	createdAt: t.String(),
	members: t.Array(MemberSchema),
	messageCount: t.Number(),
	market: t.Nullable(MarketInfoSchema),
});

const PaginatedMessagesSchema = t.Object({
	messages: t.Array(MessageSchema),
	nextCursor: t.Nullable(t.String()),
	hasMore: t.Boolean(),
});

const ErrorSchema = t.Object({
	error: t.String(),
});

const SuccessMessageSchema = t.Object({
	message: t.String(),
});

/**
 * Chat Routes (모두 인증 필수)
 */
export const chatRoutes = new Elysia({ prefix: "/chat" })
	.use(authGuard)

	// ==========================================
	// ChatRoom Routes
	// ==========================================

	// GET /api/chat/rooms - 내 채팅방 목록 (필터, 검색, 페이지네이션 지원)
	.get(
		"/rooms",
		async ({ auth, query }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				return { rooms: [], nextCursor: null, hasMore: false };
			}

			const result = await chatRoomService.findByUserId(user.id, {
				search: query.search,
				filter: query.filter as "all" | "trading" | "general" | undefined,
				cursor: query.cursor,
				limit: query.limit ? Number.parseInt(query.limit) : 20,
			});

			return {
				rooms: result.items.map((room) => ({
					id: room.id,
					name: room.name,
					createdAt: room.createdAt.toISOString(),
					members: room.members.map((m) => m.user),
					lastMessage: room.messages[0]
						? {
								content: room.messages[0].content,
								createdAt: room.messages[0].createdAt.toISOString(),
								user: {
									id: room.messages[0].user.id,
									nickname: room.messages[0].user.nickname,
								},
							}
						: null,
					messageCount: room._count.messages,
					market: room.market
						? {
								id: room.market.id,
								title: room.market.title,
								price: room.market.price,
								status: room.market.status,
								userId: room.market.userId,
								thumbnail: room.market.images[0]?.imageUrl ?? null,
							}
						: null,
				})),
				nextCursor: result.nextCursor,
				hasMore: result.hasMore,
			};
		},
		{
			query: t.Object({
				search: t.Optional(t.String()),
				filter: t.Optional(t.String()),
				cursor: t.Optional(t.String()),
				limit: t.Optional(t.String()),
			}),
			response: t.Object({
				rooms: t.Array(RoomItemSchema),
				nextCursor: t.Nullable(t.String()),
				hasMore: t.Boolean(),
			}),
			detail: {
				tags: ["Chat"],
				summary: "내 채팅방 목록 조회",
				description:
					"현재 사용자가 참여중인 채팅방 목록을 조회합니다. 검색, 필터, 페이지네이션을 지원합니다.",
			},
		},
	)

	// POST /api/chat/rooms - 채팅방 생성
	.post(
		"/rooms",
		async ({ auth, body, set }) => {
			const user = await userService.findOrCreate(
				auth.user.id,
				auth.user.email,
				auth.user.user_metadata?.full_name,
				auth.user.user_metadata?.avatar_url,
			);

			// 자기 자신을 멤버에 포함
			const memberIds = Array.from(new Set([user.id, ...body.memberIds]));

			if (memberIds.length < 2) {
				set.status = 400;
				return { error: "At least 2 members required" };
			}

			const room = await chatRoomService.create({
				name: body.name,
				memberIds,
			});

			set.status = 201;
			return {
				id: room.id,
				name: room.name,
				createdAt: room.createdAt.toISOString(),
				members: room.members.map((m) => m.user),
			};
		},
		{
			body: t.Object({
				name: t.Optional(t.String()),
				memberIds: t.Array(t.String(), { minItems: 1 }),
			}),
			response: {
				201: t.Object({
					id: t.String(),
					name: t.Nullable(t.String()),
					createdAt: t.String(),
					members: t.Array(UserSchema),
				}),
				400: ErrorSchema,
			},
			detail: {
				tags: ["Chat"],
				summary: "채팅방 생성",
				description: "새 채팅방을 생성합니다.",
			},
		},
	)

	// POST /api/chat/rooms/direct - 1:1 채팅방 조회/생성
	.post(
		"/rooms/direct",
		async ({ auth, body, set }) => {
			const user = await userService.findOrCreate(
				auth.user.id,
				auth.user.email,
				auth.user.user_metadata?.full_name,
				auth.user.user_metadata?.avatar_url,
			);

			if (user.id === body.targetUserId) {
				set.status = 400;
				return { error: "Cannot create chat room with yourself" };
			}

			const room = await chatRoomService.findOrCreateDirect(
				user.id,
				body.targetUserId,
			);

			return {
				id: room.id,
				name: room.name,
				createdAt: room.createdAt.toISOString(),
				members: room.members.map((m) => m.user),
			};
		},
		{
			body: t.Object({
				targetUserId: t.String(),
			}),
			response: {
				200: t.Object({
					id: t.String(),
					name: t.Nullable(t.String()),
					createdAt: t.String(),
					members: t.Array(UserSchema),
				}),
				400: ErrorSchema,
			},
			detail: {
				tags: ["Chat"],
				summary: "1:1 채팅방 조회/생성",
				description:
					"대상 사용자와의 1:1 채팅방을 조회하거나, 없으면 새로 생성합니다.",
			},
		},
	)

	// GET /api/chat/rooms/:id - 채팅방 상세
	.get(
		"/rooms/:id",
		async ({ auth, params, set }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				set.status = 401;
				return { error: "User not found" };
			}

			const room = await chatRoomService.findById(params.id);
			if (!room) {
				set.status = 404;
				return { error: "Chat room not found" };
			}

			// 멤버 확인
			const isMember = await chatRoomService.isMember(params.id, user.id);
			if (!isMember) {
				set.status = 403;
				return { error: "Not a member of this chat room" };
			}

			return {
				id: room.id,
				name: room.name,
				createdAt: room.createdAt.toISOString(),
				members: room.members.map((m) => ({
					...m.user,
					joinedAt: m.joinedAt.toISOString(),
				})),
				messageCount: room._count.messages,
				market: room.market
					? {
							id: room.market.id,
							title: room.market.title,
							price: room.market.price,
							status: room.market.status,
							userId: room.market.userId,
							thumbnail: room.market.images[0]?.imageUrl ?? null,
						}
					: null,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: RoomDetailSchema,
				401: ErrorSchema,
				403: ErrorSchema,
				404: ErrorSchema,
			},
			detail: {
				tags: ["Chat"],
				summary: "채팅방 상세 조회",
				description: "채팅방의 상세 정보를 조회합니다.",
			},
		},
	)

	// PATCH /api/chat/rooms/:id - 채팅방 이름 수정
	.patch(
		"/rooms/:id",
		async ({ auth, params, body, set }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				set.status = 401;
				return { error: "User not found" };
			}

			const isMember = await chatRoomService.isMember(params.id, user.id);
			if (!isMember) {
				set.status = 403;
				return { error: "Not a member of this chat room" };
			}

			const room = await chatRoomService.updateName(params.id, body.name);

			return {
				id: room.id,
				name: room.name,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				name: t.String({ minLength: 1 }),
			}),
			response: {
				200: t.Object({
					id: t.String(),
					name: t.Nullable(t.String()),
				}),
				401: ErrorSchema,
				403: ErrorSchema,
			},
			detail: {
				tags: ["Chat"],
				summary: "채팅방 이름 수정",
				description: "채팅방 이름을 수정합니다.",
			},
		},
	)

	// DELETE /api/chat/rooms/:id/leave - 채팅방 나가기
	.delete(
		"/rooms/:id/leave",
		async ({ auth, params, set }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				set.status = 401;
				return { error: "User not found" };
			}

			const isMember = await chatRoomService.isMember(params.id, user.id);
			if (!isMember) {
				set.status = 403;
				return { error: "Not a member of this chat room" };
			}

			await chatRoomMemberService.removeMember(params.id, user.id);

			return { message: "Left chat room successfully" };
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: SuccessMessageSchema,
				401: ErrorSchema,
				403: ErrorSchema,
			},
			detail: {
				tags: ["Chat"],
				summary: "채팅방 나가기",
				description: "채팅방에서 나갑니다.",
			},
		},
	)

	// ==========================================
	// ChatRoomMember Routes
	// ==========================================

	// POST /api/chat/rooms/:id/members - 멤버 추가
	.post(
		"/rooms/:id/members",
		async ({ auth, params, body, set }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				set.status = 401;
				return { error: "User not found" };
			}

			const isMember = await chatRoomService.isMember(params.id, user.id);
			if (!isMember) {
				set.status = 403;
				return { error: "Not a member of this chat room" };
			}

			// 이미 멤버인지 확인
			const isAlreadyMember = await chatRoomService.isMember(
				params.id,
				body.userId,
			);
			if (isAlreadyMember) {
				set.status = 400;
				return { error: "User is already a member" };
			}

			const member = await chatRoomMemberService.addMember(
				params.id,
				body.userId,
			);

			set.status = 201;
			return {
				user: member.user,
				joinedAt: member.joinedAt.toISOString(),
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				userId: t.String(),
			}),
			response: {
				201: t.Object({
					user: UserSchema,
					joinedAt: t.String(),
				}),
				400: ErrorSchema,
				401: ErrorSchema,
				403: ErrorSchema,
			},
			detail: {
				tags: ["Chat"],
				summary: "채팅방 멤버 추가",
				description: "채팅방에 새 멤버를 추가합니다.",
			},
		},
	)

	// GET /api/chat/rooms/:id/members - 멤버 목록
	.get(
		"/rooms/:id/members",
		async ({ auth, params, set }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				set.status = 401;
				return { error: "User not found" };
			}

			const isMember = await chatRoomService.isMember(params.id, user.id);
			if (!isMember) {
				set.status = 403;
				return { error: "Not a member of this chat room" };
			}

			const members = await chatRoomMemberService.findByRoomId(params.id);

			return {
				members: members.map((m) => ({
					...m.user,
					joinedAt: m.joinedAt.toISOString(),
				})),
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: t.Object({
					members: t.Array(MemberSchema),
				}),
				401: ErrorSchema,
				403: ErrorSchema,
			},
			detail: {
				tags: ["Chat"],
				summary: "채팅방 멤버 목록 조회",
				description: "채팅방의 멤버 목록을 조회합니다.",
			},
		},
	)

	// ==========================================
	// ChatMessage Routes
	// ==========================================

	// GET /api/chat/rooms/:id/messages - 메시지 목록
	.get(
		"/rooms/:id/messages",
		async ({ auth, params, query, set }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				set.status = 401;
				return { error: "User not found" };
			}

			const isMember = await chatRoomService.isMember(params.id, user.id);
			if (!isMember) {
				set.status = 403;
				return { error: "Not a member of this chat room" };
			}

			const result = await chatMessageService.findByRoomId(params.id, {
				cursor: query.cursor,
				limit: query.limit ? Number.parseInt(query.limit) : 50,
			});

			return {
				messages: result.items.map((msg) => ({
					id: msg.id,
					content: msg.content,
					createdAt: msg.createdAt.toISOString(),
					user: msg.user,
				})),
				nextCursor: result.nextCursor,
				hasMore: result.hasMore,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			query: t.Object({
				cursor: t.Optional(t.String()),
				limit: t.Optional(t.String()),
			}),
			response: {
				200: PaginatedMessagesSchema,
				401: ErrorSchema,
				403: ErrorSchema,
			},
			detail: {
				tags: ["Chat"],
				summary: "채팅 메시지 목록 조회",
				description: "채팅방의 메시지 목록을 페이지네이션하여 조회합니다.",
			},
		},
	)

	// POST /api/chat/rooms/:id/messages - 메시지 전송
	.post(
		"/rooms/:id/messages",
		async ({ auth, params, body, set }) => {
			const user = await userService.findOrCreate(
				auth.user.id,
				auth.user.email,
				auth.user.user_metadata?.full_name,
				auth.user.user_metadata?.avatar_url,
			);

			const isMember = await chatRoomService.isMember(params.id, user.id);
			if (!isMember) {
				set.status = 403;
				return { error: "Not a member of this chat room" };
			}

			const message = await chatMessageService.create({
				content: body.content,
				roomId: params.id,
				userId: user.id,
			});

			set.status = 201;
			return {
				id: message.id,
				content: message.content,
				createdAt: message.createdAt.toISOString(),
				user: message.user,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				content: t.String({ minLength: 1 }),
			}),
			response: {
				201: MessageSchema,
				403: ErrorSchema,
			},
			detail: {
				tags: ["Chat"],
				summary: "메시지 전송",
				description: "채팅방에 새 메시지를 전송합니다.",
			},
		},
	)

	// DELETE /api/chat/messages/:id - 메시지 삭제
	.delete(
		"/messages/:id",
		async ({ auth, params, set }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				set.status = 401;
				return { error: "User not found" };
			}

			const isOwner = await chatMessageService.isOwner(params.id, user.id);
			if (!isOwner) {
				set.status = 403;
				return { error: "Forbidden" };
			}

			await chatMessageService.delete(params.id);

			return { message: "Message deleted successfully" };
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: SuccessMessageSchema,
				401: ErrorSchema,
				403: ErrorSchema,
			},
			detail: {
				tags: ["Chat"],
				summary: "메시지 삭제",
				description: "메시지를 삭제합니다.",
			},
		},
	)

	// ==========================================
	// Market Chat Routes
	// ==========================================

	// POST /api/chat/rooms/market - 마켓용 채팅방 조회/생성 (구매자용)
	.post(
		"/rooms/market",
		async ({ auth, body, set }) => {
			const user = await userService.findOrCreate(
				auth.user.id,
				auth.user.email,
				auth.user.user_metadata?.full_name,
				auth.user.user_metadata?.avatar_url,
			);

			// 자기 자신과의 채팅방 생성 방지
			if (user.id === body.sellerId) {
				set.status = 400;
				return { error: "Cannot create chat room with yourself" };
			}

			const room = await chatRoomService.findOrCreateForMarket(
				user.id,
				body.sellerId,
				body.marketId,
			);

			return {
				id: room.id,
				name: room.name,
				createdAt: room.createdAt.toISOString(),
				members: room.members.map((m) => m.user),
				market: room.market
					? {
							id: room.market.id,
							title: room.market.title,
							price: room.market.price,
							status: room.market.status,
							userId: room.market.userId,
							thumbnail: room.market.images[0]?.imageUrl ?? null,
						}
					: null,
			};
		},
		{
			body: t.Object({
				marketId: t.String(),
				sellerId: t.String(),
			}),
			response: {
				200: t.Object({
					id: t.String(),
					name: t.Nullable(t.String()),
					createdAt: t.String(),
					members: t.Array(UserSchema),
					market: t.Nullable(MarketInfoSchema),
				}),
				400: ErrorSchema,
			},
			detail: {
				tags: ["Chat"],
				summary: "마켓 채팅방 조회/생성",
				description:
					"특정 마켓에 대한 판매자와의 채팅방을 조회하거나, 없으면 새로 생성합니다.",
			},
		},
	)

	// GET /api/chat/rooms/market/:marketId - 특정 마켓의 채팅방 목록 (판매자용)
	.get(
		"/rooms/market/:marketId",
		async ({ auth, params, set }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				set.status = 401;
				return { error: "User not found" };
			}

			const rooms = await chatRoomService.findByMarketId(params.marketId);

			return {
				rooms: rooms.map((room) => ({
					id: room.id,
					name: room.name,
					createdAt: room.createdAt.toISOString(),
					members: room.members.map((m) => m.user),
					lastMessage: room.messages[0]
						? {
								content: room.messages[0].content,
								createdAt: room.messages[0].createdAt.toISOString(),
								user: {
									id: room.messages[0].user.id,
									nickname: room.messages[0].user.nickname,
								},
							}
						: null,
					messageCount: room._count.messages,
					market: room.market
						? {
								id: room.market.id,
								title: room.market.title,
								price: room.market.price,
								status: room.market.status,
								userId: room.market.userId,
								thumbnail: room.market.images[0]?.imageUrl ?? null,
							}
						: null,
				})),
			};
		},
		{
			params: t.Object({
				marketId: t.String(),
			}),
			response: {
				200: t.Object({
					rooms: t.Array(RoomItemSchema),
				}),
				401: ErrorSchema,
			},
			detail: {
				tags: ["Chat"],
				summary: "마켓 채팅방 목록 조회",
				description: "특정 마켓에 대한 채팅방 목록을 조회합니다.",
			},
		},
	);
