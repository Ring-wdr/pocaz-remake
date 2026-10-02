import { Elysia, t } from "elysia";
import { authGuard } from "@/lib/elysia/auth";
import { LimitQuery } from "@/lib/elysia/schemas";
import {
	MarketError,
	marketImageService,
	marketService,
	toMarketCondition,
} from "@/lib/services/market";
import { notificationService } from "@/lib/services/notification";
import { TradeError, transactionService } from "@/lib/services/transaction";
import { userService } from "@/lib/services/user";

// 공통 스키마
const UserSchema = t.Object({
	id: t.String(),
	nickname: t.String(),
	profileImage: t.Nullable(t.String()),
});

const ImageSchema = t.Object({
	id: t.String(),
	imageUrl: t.String(),
});

// 상품에 붙인 그룹·멤버 태그
const ArtistTagSchema = t.Object({
	id: t.String(),
	name: t.String(),
});

// 상품 상태. 등록 폼의 선택지 id와 같다
const ConditionEnum = t.Union([
	t.Literal("new"),
	t.Literal("like-new"),
	t.Literal("good"),
	t.Literal("used"),
]);

const MarketItemSchema = t.Object({
	id: t.String(),
	title: t.String(),
	description: t.Nullable(t.String()),
	price: t.Nullable(t.Number()),
	condition: t.Nullable(ConditionEnum),
	isNegotiable: t.Boolean(),
	group: t.Nullable(ArtistTagSchema),
	artist: t.Nullable(ArtistTagSchema),
	status: t.String(),
	createdAt: t.String(),
	user: UserSchema,
	images: t.Array(ImageSchema),
});

const PaginatedMarketsSchema = t.Object({
	items: t.Array(MarketItemSchema),
	nextCursor: t.Nullable(t.String()),
	hasMore: t.Boolean(),
});

const SortEnum = t.Union([
	t.Literal("latest"),
	t.Literal("priceAsc"),
	t.Literal("priceDesc"),
]);

const StatusEnum = t.Union([
	t.Literal("available"),
	t.Literal("reserved"),
	t.Literal("sold"),
]);

// 목록·검색·상태별 조회가 함께 쓰는 필터. negotiable이 true면 협상 가능한 상품만, false면 협상 불가인 상품만.
// groupId·artistId는 그 그룹·멤버로 태그한 상품만 돌려준다
const FilterQuery = {
	condition: t.Optional(ConditionEnum),
	negotiable: t.Optional(t.Boolean()),
	groupId: t.Optional(t.String()),
	artistId: t.Optional(t.String()),
};

const ErrorSchema = t.Object({
	error: t.String(),
});

const MessageSchema = t.Object({
	message: t.String(),
});

const TradeSchema = t.Object({
	id: t.String(),
	marketId: t.String(),
	buyerId: t.String(),
	sellerId: t.String(),
	price: t.Number(),
	completedAt: t.String(),
});

// 이미 완료된 거래가 있을 때 그 거래의 id를 함께 돌려준다
const TradeConflictSchema = t.Object({
	error: t.String(),
	transactionId: t.String(),
});

type MarketWithRelations = NonNullable<
	Awaited<ReturnType<typeof marketService.findById>>
>;

// 목록·상세·작성 응답이 함께 쓰는 상품 항목 모양
function toMarketItem(market: MarketWithRelations) {
	return {
		id: market.id,
		title: market.title,
		description: market.description,
		price: market.price,
		condition: toMarketCondition(market.condition),
		isNegotiable: market.isNegotiable,
		group: market.group,
		artist: market.artist,
		status: market.status,
		createdAt: market.createdAt.toISOString(),
		user: market.user,
		images: market.images,
	};
}

/**
 * Public Market Routes (인증 불필요)
 */
export const publicMarketRoutes = new Elysia({ prefix: "/markets" })
	// GET /api/markets - 장터 목록
	.get(
		"/",
		async ({ query }) => {
			const result = await marketService.findMany({
				cursor: query.cursor,
				limit: query.limit ?? 20,
				sort: query.sort,
				condition: query.condition,
				negotiable: query.negotiable,
				groupId: query.groupId,
				artistId: query.artistId,
			});

			return {
				items: result.items.map(toMarketItem),
				nextCursor: result.nextCursor,
				hasMore: result.hasMore,
			};
		},
		{
			query: t.Object({
				cursor: t.Optional(t.String()),
				limit: LimitQuery,
				sort: t.Optional(SortEnum),
				...FilterQuery,
			}),
			response: PaginatedMarketsSchema,
			detail: {
				tags: ["Markets"],
				summary: "장터 목록 조회",
				description:
					"장터 목록을 페이지네이션하여 조회합니다. 상품 상태(condition), 협상 가능 여부(negotiable), 그룹(groupId)·멤버(artistId) 태그로 거를 수 있습니다.",
			},
		},
	)
	// GET /api/markets/search - 장터 검색
	.get(
		"/search",
		async ({ query }) => {
			if (!query.keyword) {
				return { items: [], nextCursor: null, hasMore: false };
			}

			const result = await marketService.findMany({
				keyword: query.keyword,
				cursor: query.cursor,
				limit: query.limit ?? 20,
				status: query.status,
				sort: query.sort,
				condition: query.condition,
				negotiable: query.negotiable,
				groupId: query.groupId,
				artistId: query.artistId,
			});

			return {
				items: result.items.map(toMarketItem),
				nextCursor: result.nextCursor,
				hasMore: result.hasMore,
			};
		},
		{
			query: t.Object({
				keyword: t.Optional(t.String()),
				cursor: t.Optional(t.String()),
				limit: LimitQuery,
				sort: t.Optional(SortEnum),
				status: t.Optional(StatusEnum),
				...FilterQuery,
			}),
			response: PaginatedMarketsSchema,
			detail: {
				tags: ["Markets"],
				summary: "장터 검색",
				description:
					"키워드로 장터를 검색합니다. 키워드는 제목, 설명, 그룹 이름, 멤버 이름에서 찾습니다. 판매 상태, 상품 상태(condition), 협상 가능 여부(negotiable), 그룹(groupId)·멤버(artistId) 태그로 함께 거를 수 있습니다.",
			},
		},
	)
	// GET /api/markets/status/:status - 상태별 조회
	.get(
		"/status/:status",
		async ({ params, query }) => {
			const validStatuses = ["available", "sold", "reserved"];
			if (!validStatuses.includes(params.status)) {
				return { items: [], nextCursor: null, hasMore: false };
			}

			const result = await marketService.findMany({
				status: params.status as "available" | "sold" | "reserved",
				cursor: query.cursor,
				limit: query.limit ?? 20,
				sort: query.sort,
				condition: query.condition,
				negotiable: query.negotiable,
				groupId: query.groupId,
				artistId: query.artistId,
			});

			return {
				items: result.items.map(toMarketItem),
				nextCursor: result.nextCursor,
				hasMore: result.hasMore,
			};
		},
		{
			params: t.Object({
				status: t.String(),
			}),
			query: t.Object({
				cursor: t.Optional(t.String()),
				limit: LimitQuery,
				sort: t.Optional(SortEnum),
				...FilterQuery,
			}),
			response: PaginatedMarketsSchema,
			detail: {
				tags: ["Markets"],
				summary: "상태별 장터 조회",
				description:
					"장터 상태(available, sold, reserved)별로 목록을 조회합니다. 상품 상태(condition), 협상 가능 여부(negotiable), 그룹(groupId)·멤버(artistId) 태그로 거를 수 있습니다.",
			},
		},
	)
	// GET /api/markets/:id - 장터 상세
	.get(
		"/:id",
		async ({ params, set }) => {
			const market = await marketService.findById(params.id);

			if (!market) {
				set.status = 404;
				return { error: "Market not found" };
			}

			return {
				...toMarketItem(market),
				updatedAt: market.updatedAt.toISOString(),
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: t.Object({
					id: t.String(),
					title: t.String(),
					description: t.Nullable(t.String()),
					price: t.Nullable(t.Number()),
					condition: t.Nullable(ConditionEnum),
					isNegotiable: t.Boolean(),
					group: t.Nullable(ArtistTagSchema),
					artist: t.Nullable(ArtistTagSchema),
					status: t.String(),
					createdAt: t.String(),
					updatedAt: t.String(),
					user: UserSchema,
					images: t.Array(ImageSchema),
				}),
				404: ErrorSchema,
			},
			detail: {
				tags: ["Markets"],
				summary: "장터 상세 조회",
				description: "장터의 상세 정보를 조회합니다.",
			},
		},
	)
	// GET /api/markets/user/:userId - 특정 사용자의 장터 글
	.get(
		"/user/:userId",
		async ({ params, query }) => {
			const result = await marketService.findMany({
				userId: params.userId,
				cursor: query.cursor,
				limit: query.limit ?? 20,
				sort: query.sort,
			});

			return {
				items: result.items.map(toMarketItem),
				nextCursor: result.nextCursor,
				hasMore: result.hasMore,
			};
		},
		{
			params: t.Object({
				userId: t.String(),
			}),
			query: t.Object({
				cursor: t.Optional(t.String()),
				limit: LimitQuery,
				sort: t.Optional(SortEnum),
			}),
			response: PaginatedMarketsSchema,
			detail: {
				tags: ["Markets"],
				summary: "특정 사용자의 장터 조회",
				description: "특정 사용자가 작성한 장터 목록을 조회합니다.",
			},
		},
	);

/**
 * Protected Market Routes (인증 필수)
 */
export const marketRoutes = new Elysia({ prefix: "/markets" })
	.use(authGuard)
	// POST /api/markets - 장터 글 작성
	.post(
		"/",
		async ({ auth, body, status }) => {
			const user = await userService.findOrCreate(
				auth.user.id,
				auth.user.email,
				auth.user.user_metadata?.full_name,
				auth.user.user_metadata?.avatar_url,
			);

			try {
				const market = await marketService.create({
					title: body.title,
					description: body.description,
					price: body.price,
					condition: body.condition,
					isNegotiable: body.isNegotiable,
					groupId: body.groupId,
					artistId: body.artistId,
					userId: user.id,
					imageUrls: body.imageUrls,
				});

				return status(201, toMarketItem(market));
			} catch (error) {
				if (!(error instanceof MarketError)) throw error;
				return status(400, { error: error.message });
			}
		},
		{
			body: t.Object({
				title: t.String({ minLength: 1 }),
				description: t.Optional(t.String()),
				price: t.Optional(t.Number({ minimum: 0 })),
				condition: t.Optional(ConditionEnum),
				isNegotiable: t.Optional(t.Boolean()),
				// 그룹과 멤버를 함께 보내면 멤버가 그 그룹 소속이어야 한다
				groupId: t.Optional(t.String()),
				artistId: t.Optional(t.String()),
				imageUrls: t.Optional(t.Array(t.String())),
			}),
			response: {
				201: MarketItemSchema,
				400: ErrorSchema,
			},
			detail: {
				tags: ["Markets"],
				summary: "장터 글 작성",
				description:
					"새 장터 글을 작성합니다. 그룹(groupId)과 멤버(artistId)를 태그할 수 있고, 둘 다 보내면 멤버가 그 그룹 소속이어야 합니다. 없는 그룹·멤버나 짝이 맞지 않는 값은 400입니다.",
			},
		},
	)
	// PUT /api/markets/:id - 장터 글 수정
	.put(
		"/:id",
		async ({ auth, params, body, set, status }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				set.status = 401;
				return { error: "User not found" };
			}

			const isOwner = await marketService.isOwner(params.id, user.id);
			if (!isOwner) {
				set.status = 403;
				return { error: "Forbidden" };
			}

			// 상태가 바뀌었는지 알려면 바꾸기 전 값이 필요하다
			const previousStatus = body.status
				? await marketService.getStatus(params.id)
				: null;

			try {
				const market = await marketService.update(params.id, {
					title: body.title,
					description: body.description,
					price: body.price,
					condition: body.condition,
					isNegotiable: body.isNegotiable,
					groupId: body.groupId,
					artistId: body.artistId,
					status: body.status as "available" | "sold" | "reserved" | undefined,
				});

				// 상태가 바뀌면 이 상품을 찜한 사용자에게 알린다
				if (
					body.status &&
					previousStatus !== null &&
					previousStatus !== body.status
				) {
					await notificationService.createForMarketStatus({
						marketId: market.id,
						ownerId: user.id,
						status: body.status,
					});
				}

				return {
					id: market.id,
					title: market.title,
					description: market.description,
					price: market.price,
					condition: toMarketCondition(market.condition),
					isNegotiable: market.isNegotiable,
					group: market.group,
					artist: market.artist,
					status: market.status,
					updatedAt: market.updatedAt.toISOString(),
				};
			} catch (error) {
				if (!(error instanceof MarketError)) throw error;
				return status(400, { error: error.message });
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				title: t.Optional(t.String({ minLength: 1 })),
				description: t.Optional(t.String()),
				// null이면 가격을 비운다(가격협의). 생략하면 그대로 둔다
				price: t.Optional(t.Nullable(t.Number({ minimum: 0 }))),
				condition: t.Optional(ConditionEnum),
				isNegotiable: t.Optional(t.Boolean()),
				// null이면 태그를 푼다. 생략하면 그대로 둔다. 둘을 함께 보내면 멤버가 그 그룹 소속이어야 한다
				groupId: t.Optional(t.Nullable(t.String())),
				artistId: t.Optional(t.Nullable(t.String())),
				status: t.Optional(
					t.Union([
						t.Literal("available"),
						t.Literal("sold"),
						t.Literal("reserved"),
					]),
				),
			}),
			response: {
				200: t.Object({
					id: t.String(),
					title: t.String(),
					description: t.Nullable(t.String()),
					price: t.Nullable(t.Number()),
					condition: t.Nullable(ConditionEnum),
					isNegotiable: t.Boolean(),
					group: t.Nullable(ArtistTagSchema),
					artist: t.Nullable(ArtistTagSchema),
					status: t.String(),
					updatedAt: t.String(),
				}),
				400: ErrorSchema,
				401: ErrorSchema,
				403: ErrorSchema,
			},
			detail: {
				tags: ["Markets"],
				summary: "장터 글 수정",
				description:
					"장터 글을 수정합니다. 보내지 않은 필드는 그대로 두고, price에 null을 보내면 가격을 비웁니다(가격협의). groupId·artistId에 null을 보내면 태그를 풉니다. 없는 그룹·멤버나 짝이 맞지 않는 값은 400입니다.",
			},
		},
	)
	// DELETE /api/markets/:id - 장터 글 삭제
	.delete(
		"/:id",
		async ({ auth, params, set, status }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				set.status = 401;
				return { error: "User not found" };
			}

			const isOwner = await marketService.isOwner(params.id, user.id);
			if (!isOwner) {
				set.status = 403;
				return { error: "Forbidden" };
			}

			// 거래 기록이 있는 상품은 지울 수 없다. Transaction.marketId가 Restrict라 그냥 지우면 DB 오류(500)가 난다
			if (await marketService.hasTransactions(params.id)) {
				return status(409, { error: "Market has transactions" });
			}

			await marketService.delete(params.id);

			return { message: "Market deleted successfully" };
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: MessageSchema,
				401: ErrorSchema,
				403: ErrorSchema,
				409: ErrorSchema,
			},
			detail: {
				tags: ["Markets"],
				summary: "장터 글 삭제",
				description:
					"장터 글을 삭제합니다. 거래 기록이 있는 상품은 지울 수 없어 409를 돌려줍니다(판매완료 상태로 남겨 두세요).",
			},
		},
	)
	// POST /api/markets/:id/complete - 거래 완료 (구매자 지정)
	.post(
		"/:id/complete",
		async ({ auth, params, body, status }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				return status(401, { error: "User not found" });
			}

			// 이미 판매완료인 상품이면 찜한 사용자는 그때 알림을 받았으므로, 바꾸기 전 상태를 읽어 둔다
			const previousStatus = await marketService.getStatus(params.id);

			try {
				const trade = await transactionService.completeTrade({
					marketId: params.id,
					sellerId: user.id,
					buyerId: body.buyerId,
					price: body.price,
				});

				// 구매자에게는 거래 완료를, 판매완료로 바뀐 상품을 찜한 다른 사용자에게는 상태 변경을 알린다
				await notificationService.createForTrade({
					marketId: trade.marketId,
					sellerId: trade.sellerId,
					buyerId: trade.buyerId,
				});
				if (previousStatus !== "sold") {
					await notificationService.createForMarketStatus({
						marketId: trade.marketId,
						ownerId: trade.sellerId,
						status: "sold",
						excludeUserIds: [trade.buyerId],
					});
				}

				return status(201, {
					id: trade.id,
					marketId: trade.marketId,
					buyerId: trade.buyerId,
					sellerId: trade.sellerId,
					price: trade.price,
					completedAt: trade.completedAt.toISOString(),
				});
			} catch (error) {
				if (!(error instanceof TradeError)) throw error;
				if (error.status === 409 && error.transactionId) {
					return status(409, {
						error: error.message,
						transactionId: error.transactionId,
					});
				}
				return status(error.status, { error: error.message });
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				buyerId: t.String({ minLength: 1 }),
				// 생략하면 상품 가격. Transaction.price가 Int 컬럼이라 정수만 받는다
				price: t.Optional(t.Integer({ minimum: 0, maximum: 2_147_483_647 })),
			}),
			response: {
				201: TradeSchema,
				400: ErrorSchema,
				401: ErrorSchema,
				403: ErrorSchema,
				404: ErrorSchema,
				409: TradeConflictSchema,
			},
			detail: {
				tags: ["Markets"],
				summary: "거래 완료",
				description:
					"구매자를 지정해 거래를 완료합니다. 상품이 판매완료로 바뀌고 양쪽 거래 내역에 남습니다. 구매자는 이 상품의 채팅방 멤버여야 합니다.",
			},
		},
	)
	// POST /api/markets/:id/images - 이미지 추가
	.post(
		"/:id/images",
		async ({ auth, params, body, set }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				set.status = 401;
				return { error: "User not found" };
			}

			const isOwner = await marketService.isOwner(params.id, user.id);
			if (!isOwner) {
				set.status = 403;
				return { error: "Forbidden" };
			}

			const images = await marketImageService.addImages(
				params.id,
				body.imageUrls,
			);

			return {
				images: images.map((img) => ({
					id: img.id,
					imageUrl: img.imageUrl,
				})),
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				imageUrls: t.Array(t.String(), { minItems: 1 }),
			}),
			response: {
				201: t.Object({ images: t.Array(ImageSchema) }),
				401: ErrorSchema,
				403: ErrorSchema,
			},
			detail: {
				tags: ["Markets"],
				summary: "장터 이미지 추가",
				description: "장터 글에 이미지를 추가합니다.",
			},
		},
	)
	// DELETE /api/markets/:id/images/:imageId - 이미지 삭제
	.delete(
		"/:id/images/:imageId",
		async ({ auth, params, set }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				set.status = 401;
				return { error: "User not found" };
			}

			const isOwner = await marketService.isOwner(params.id, user.id);
			if (!isOwner) {
				set.status = 403;
				return { error: "Forbidden" };
			}

			const deleted = await marketImageService.deleteImage(
				params.id,
				params.imageId,
			);
			if (!deleted) {
				set.status = 404;
				return { error: "Image not found" };
			}

			return { message: "Image deleted successfully" };
		},
		{
			params: t.Object({
				id: t.String(),
				imageId: t.String(),
			}),
			response: {
				200: MessageSchema,
				401: ErrorSchema,
				403: ErrorSchema,
				404: ErrorSchema,
			},
			detail: {
				tags: ["Markets"],
				summary: "장터 이미지 삭제",
				description: "장터 글에서 이미지를 삭제합니다.",
			},
		},
	);
