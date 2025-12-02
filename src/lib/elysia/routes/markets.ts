import { Elysia, t } from "elysia";
import { authGuard } from "@/lib/elysia/auth";
import { marketImageService, marketService } from "@/lib/services/market";
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

const MarketItemSchema = t.Object({
	id: t.String(),
	title: t.String(),
	description: t.Nullable(t.String()),
	price: t.Nullable(t.Number()),
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

const ErrorSchema = t.Object({
	error: t.String(),
});

const MessageSchema = t.Object({
	message: t.String(),
});

/**
 * Public Market Routes (인증 불필요)
 */
export const publicMarketRoutes = new Elysia({ prefix: "/markets" })
	// GET /api/markets - 장터 목록
	.get(
		"/",
		async ({ query }) => {
			const result = await marketService.findAll({
				cursor: query.cursor,
				limit: query.limit ? Number.parseInt(query.limit) : 20,
				sort:
					(query.sort as "latest" | "priceAsc" | "priceDesc" | undefined) ??
					"latest",
			});

			return {
				items: result.items.map((market) => ({
					id: market.id,
					title: market.title,
					description: market.description,
					price: market.price,
					status: market.status,
					createdAt: market.createdAt.toISOString(),
					user: market.user,
					images: market.images,
				})),
				nextCursor: result.nextCursor,
				hasMore: result.hasMore,
			};
		},
		{
			query: t.Object({
				cursor: t.Optional(t.String()),
				limit: t.Optional(t.String()),
				sort: t.Optional(SortEnum),
			}),
			response: PaginatedMarketsSchema,
			detail: {
				tags: ["Markets"],
				summary: "장터 목록 조회",
				description: "장터 목록을 페이지네이션하여 조회합니다.",
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

			const result = await marketService.search(query.keyword, {
				cursor: query.cursor,
				limit: query.limit ? Number.parseInt(query.limit, 10) : 20,
				sort:
					(query.sort as "latest" | "priceAsc" | "priceDesc" | undefined) ??
					"latest",
			});

			return {
				items: result.items.map((market) => ({
					id: market.id,
					title: market.title,
					description: market.description,
					price: market.price,
					status: market.status,
					createdAt: market.createdAt.toISOString(),
					user: market.user,
					images: market.images,
				})),
				nextCursor: result.nextCursor,
				hasMore: result.hasMore,
			};
		},
		{
			query: t.Object({
				keyword: t.Optional(t.String()),
				cursor: t.Optional(t.String()),
				limit: t.Optional(t.String()),
				sort: t.Optional(SortEnum),
			}),
			response: PaginatedMarketsSchema,
			detail: {
				tags: ["Markets"],
				summary: "장터 검색",
				description: "키워드로 장터를 검색합니다.",
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

			const result = await marketService.findByStatus(
				params.status as "available" | "sold" | "reserved",
				{
					cursor: query.cursor,
					limit: query.limit ? Number.parseInt(query.limit) : 20,
					sort:
						(query.sort as "latest" | "priceAsc" | "priceDesc" | undefined) ??
						"latest",
				},
			);

			return {
				items: result.items.map((market) => ({
					id: market.id,
					title: market.title,
					description: market.description,
					price: market.price,
					status: market.status,
					createdAt: market.createdAt.toISOString(),
					user: market.user,
					images: market.images,
				})),
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
				limit: t.Optional(t.String()),
				sort: t.Optional(SortEnum),
			}),
			response: PaginatedMarketsSchema,
			detail: {
				tags: ["Markets"],
				summary: "상태별 장터 조회",
				description:
					"장터 상태(available, sold, reserved)별로 목록을 조회합니다.",
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
				id: market.id,
				title: market.title,
				description: market.description,
				price: market.price,
				status: market.status,
				createdAt: market.createdAt.toISOString(),
				updatedAt: market.updatedAt.toISOString(),
				user: market.user,
				images: market.images,
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
			const result = await marketService.findByUserId(params.userId, {
				cursor: query.cursor,
				limit: query.limit ? Number.parseInt(query.limit) : 20,
				sort:
					(query.sort as "latest" | "priceAsc" | "priceDesc" | undefined) ??
					"latest",
			});

			return {
				items: result.items.map((market) => ({
					id: market.id,
					title: market.title,
					description: market.description,
					price: market.price,
					status: market.status,
					createdAt: market.createdAt.toISOString(),
					user: market.user,
					images: market.images,
				})),
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
				limit: t.Optional(t.String()),
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
		async ({ auth, body, set }) => {
			const user = await userService.findOrCreate(
				auth.user.id,
				auth.user.email,
				auth.user.user_metadata?.full_name,
				auth.user.user_metadata?.avatar_url,
			);

			const market = await marketService.create({
				title: body.title,
				description: body.description,
				price: body.price,
				userId: user.id,
				imageUrls: body.imageUrls,
			});

			set.status = 201;
			return {
				id: market.id,
				title: market.title,
				description: market.description,
				price: market.price,
				status: market.status,
				createdAt: market.createdAt.toISOString(),
				user: market.user,
				images: market.images,
			};
		},
		{
			body: t.Object({
				title: t.String({ minLength: 1 }),
				description: t.Optional(t.String()),
				price: t.Optional(t.Number({ minimum: 0 })),
				imageUrls: t.Optional(t.Array(t.String())),
			}),
			response: MarketItemSchema,
			detail: {
				tags: ["Markets"],
				summary: "장터 글 작성",
				description: "새 장터 글을 작성합니다.",
			},
		},
	)
	// PUT /api/markets/:id - 장터 글 수정
	.put(
		"/:id",
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

			const market = await marketService.update(params.id, {
				title: body.title,
				description: body.description,
				price: body.price,
				status: body.status as "available" | "sold" | "reserved" | undefined,
			});

			return {
				id: market.id,
				title: market.title,
				description: market.description,
				price: market.price,
				status: market.status,
				updatedAt: market.updatedAt.toISOString(),
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				title: t.Optional(t.String({ minLength: 1 })),
				description: t.Optional(t.String()),
				price: t.Optional(t.Number({ minimum: 0 })),
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
					status: t.String(),
					updatedAt: t.String(),
				}),
				401: ErrorSchema,
				403: ErrorSchema,
			},
			detail: {
				tags: ["Markets"],
				summary: "장터 글 수정",
				description: "장터 글을 수정합니다.",
			},
		},
	)
	// DELETE /api/markets/:id - 장터 글 삭제
	.delete(
		"/:id",
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
			},
			detail: {
				tags: ["Markets"],
				summary: "장터 글 삭제",
				description: "장터 글을 삭제합니다.",
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

			await marketImageService.deleteImage(params.imageId);

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
			},
			detail: {
				tags: ["Markets"],
				summary: "장터 이미지 삭제",
				description: "장터 글에서 이미지를 삭제합니다.",
			},
		},
	);
