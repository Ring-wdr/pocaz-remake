import { Elysia, t } from "elysia";
import { authGuard } from "@/lib/elysia/auth";
import {
	chatMessageService,
	chatRoomMemberService,
	chatRoomService,
} from "@/lib/services/chat";
import { userService } from "@/lib/services/user";

/**
 * Chat Routes (모두 인증 필수)
 */
export const chatRoutes = new Elysia({ prefix: "/chat" })
	.use(authGuard)

	// ==========================================
	// ChatRoom Routes
	// ==========================================

	// GET /api/chat/rooms - 내 채팅방 목록
	.get("/rooms", async ({ auth }) => {
		const user = await userService.findBySupabaseId(auth.user.id);
		if (!user) {
			return { rooms: [] };
		}

		const rooms = await chatRoomService.findByUserId(user.id);

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
							user: room.messages[0].user,
						}
					: null,
				messageCount: room._count.messages,
			})),
		};
	})

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
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
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
		},
	);
