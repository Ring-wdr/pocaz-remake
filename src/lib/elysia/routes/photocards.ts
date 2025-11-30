import { Elysia, t } from "elysia";
import { authGuard } from "@/lib/elysia/auth";
import { galmangPocaService, photocardService } from "@/lib/services/photocard";

// 공통 스키마
const GroupSchema = t.Object({
	id: t.String(),
	name: t.String(),
});

const ArtistSchema = t.Object({
	id: t.String(),
	name: t.String(),
	group: t.Nullable(GroupSchema),
});

const ArtistWithAgencySchema = t.Object({
	id: t.String(),
	name: t.String(),
	group: t.Nullable(
		t.Object({
			id: t.String(),
			name: t.String(),
			agency: t.Nullable(
				t.Object({
					id: t.String(),
					name: t.String(),
				}),
			),
		}),
	),
});

const PhotocardItemSchema = t.Object({
	id: t.String(),
	name: t.String(),
	description: t.Nullable(t.String()),
	imageUrl: t.Nullable(t.String()),
	createdAt: t.String(),
	artist: t.Nullable(ArtistSchema),
});

const PhotocardDetailSchema = t.Object({
	id: t.String(),
	name: t.String(),
	description: t.Nullable(t.String()),
	imageUrl: t.Nullable(t.String()),
	createdAt: t.String(),
	artist: t.Nullable(ArtistWithAgencySchema),
});

const SimplePhotocardItemSchema = t.Object({
	id: t.String(),
	name: t.String(),
	description: t.Nullable(t.String()),
	imageUrl: t.Nullable(t.String()),
	createdAt: t.String(),
});

const PaginatedPhotocardsSchema = t.Object({
	items: t.Array(PhotocardItemSchema),
	nextCursor: t.Nullable(t.String()),
	hasMore: t.Boolean(),
});

const SimplePaginatedPhotocardsSchema = t.Object({
	items: t.Array(SimplePhotocardItemSchema),
	nextCursor: t.Nullable(t.String()),
	hasMore: t.Boolean(),
});

const SimpleArtistSchema = t.Object({
	id: t.String(),
	name: t.String(),
});

const GalmangPocaPhotocardSchema = t.Object({
	id: t.String(),
	name: t.String(),
	imageUrl: t.Nullable(t.String()),
	artist: t.Nullable(ArtistSchema),
});

const GalmangPocaItemSchema = t.Object({
	id: t.String(),
	quantity: t.Number(),
	createdAt: t.String(),
	photocard: GalmangPocaPhotocardSchema,
});

const PaginatedGalmangPocaSchema = t.Object({
	items: t.Array(GalmangPocaItemSchema),
	nextCursor: t.Nullable(t.String()),
	hasMore: t.Boolean(),
});

const ErrorSchema = t.Object({
	error: t.String(),
});

const MessageSchema = t.Object({
	message: t.String(),
});

/**
 * Public Photocard Routes (인증 불필요 - 조회)
 */
export const publicPhotocardRoutes = new Elysia({ prefix: "/photocards" })
	// GET /api/photocards - 포토카드 목록
	.get(
		"/",
		async ({ query }) => {
			const result = await photocardService.findAll({
				cursor: query.cursor,
				limit: query.limit ? Number.parseInt(query.limit, 10) : 20,
			});

			return {
				items: result.items.map((pc) => ({
					id: pc.id,
					name: pc.name,
					description: pc.description,
					imageUrl: pc.imageUrl,
					createdAt: pc.createdAt.toISOString(),
					artist: pc.artist
						? {
								id: pc.artist.id,
								name: pc.artist.name,
								group: pc.artist.group
									? { id: pc.artist.group.id, name: pc.artist.group.name }
									: null,
							}
						: null,
				})),
				nextCursor: result.nextCursor,
				hasMore: result.hasMore,
			};
		},
		{
			query: t.Object({
				cursor: t.Optional(t.String()),
				limit: t.Optional(t.String()),
			}),
			response: PaginatedPhotocardsSchema,
			detail: {
				tags: ["Photocards"],
				summary: "포토카드 목록 조회",
				description: "포토카드 목록을 페이지네이션하여 조회합니다.",
			},
		},
	)
	// GET /api/photocards/search - 포토카드 검색
	.get(
		"/search",
		async ({ query }) => {
			if (!query.keyword) {
				return { items: [], nextCursor: null, hasMore: false };
			}

			const result = await photocardService.search(query.keyword, {
				cursor: query.cursor,
				limit: query.limit ? Number.parseInt(query.limit, 10) : 20,
			});

			return {
				items: result.items.map((pc) => ({
					id: pc.id,
					name: pc.name,
					description: pc.description,
					imageUrl: pc.imageUrl,
					createdAt: pc.createdAt.toISOString(),
					artist: pc.artist
						? {
								id: pc.artist.id,
								name: pc.artist.name,
								group: pc.artist.group
									? { id: pc.artist.group.id, name: pc.artist.group.name }
									: null,
							}
						: null,
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
			}),
			response: PaginatedPhotocardsSchema,
			detail: {
				tags: ["Photocards"],
				summary: "포토카드 검색",
				description: "키워드로 포토카드를 검색합니다.",
			},
		},
	)
	// GET /api/photocards/:id - 포토카드 상세
	.get(
		"/:id",
		async ({ params, set }) => {
			const pc = await photocardService.findById(params.id);
			if (!pc) {
				set.status = 404;
				return { error: "Photocard not found" };
			}
			return {
				id: pc.id,
				name: pc.name,
				description: pc.description,
				imageUrl: pc.imageUrl,
				createdAt: pc.createdAt.toISOString(),
				artist: pc.artist
					? {
							id: pc.artist.id,
							name: pc.artist.name,
							group: pc.artist.group
								? {
										id: pc.artist.group.id,
										name: pc.artist.group.name,
										agency: pc.artist.group.agency
											? {
													id: pc.artist.group.agency.id,
													name: pc.artist.group.agency.name,
												}
											: null,
									}
								: null,
						}
					: null,
			};
		},
		{
			params: t.Object({ id: t.String() }),
			response: {
				200: PhotocardDetailSchema,
				404: ErrorSchema,
			},
			detail: {
				tags: ["Photocards"],
				summary: "포토카드 상세 조회",
				description: "포토카드의 상세 정보를 조회합니다.",
			},
		},
	)
	// GET /api/photocards/artist/:artistId - 아티스트별 포토카드
	.get(
		"/artist/:artistId",
		async ({ params, query }) => {
			const result = await photocardService.findByArtistId(params.artistId, {
				cursor: query.cursor,
				limit: query.limit ? Number.parseInt(query.limit) : 20,
			});

			return {
				items: result.items.map((pc) => ({
					id: pc.id,
					name: pc.name,
					description: pc.description,
					imageUrl: pc.imageUrl,
					createdAt: pc.createdAt.toISOString(),
				})),
				nextCursor: result.nextCursor,
				hasMore: result.hasMore,
			};
		},
		{
			params: t.Object({ artistId: t.String() }),
			query: t.Object({
				cursor: t.Optional(t.String()),
				limit: t.Optional(t.String()),
			}),
			response: SimplePaginatedPhotocardsSchema,
			detail: {
				tags: ["Photocards"],
				summary: "아티스트별 포토카드 조회",
				description: "특정 아티스트의 포토카드 목록을 조회합니다.",
			},
		},
	);

/**
 * Protected Photocard Routes (인증 필수 - 생성/수정/삭제)
 */
export const photocardRoutes = new Elysia({ prefix: "/photocards" })
	.use(authGuard)
	// POST /api/photocards - 포토카드 생성
	.post(
		"/",
		async ({ body, set }) => {
			const pc = await photocardService.create({
				name: body.name,
				description: body.description,
				imageUrl: body.imageUrl,
				artistId: body.artistId,
			});

			set.status = 201;
			return {
				id: pc.id,
				name: pc.name,
				description: pc.description,
				imageUrl: pc.imageUrl,
				createdAt: pc.createdAt.toISOString(),
				artist: pc.artist ? { id: pc.artist.id, name: pc.artist.name } : null,
			};
		},
		{
			body: t.Object({
				name: t.String({ minLength: 1 }),
				description: t.Optional(t.String()),
				imageUrl: t.Optional(t.String()),
				artistId: t.Optional(t.String()),
			}),
			response: t.Object({
				id: t.String(),
				name: t.String(),
				description: t.Nullable(t.String()),
				imageUrl: t.Nullable(t.String()),
				createdAt: t.String(),
				artist: t.Nullable(SimpleArtistSchema),
			}),
			detail: {
				tags: ["Photocards"],
				summary: "포토카드 생성",
				description: "새 포토카드를 생성합니다.",
			},
		},
	)
	// PUT /api/photocards/:id - 포토카드 수정
	.put(
		"/:id",
		async ({ params, body, set }) => {
			const existing = await photocardService.findById(params.id);
			if (!existing) {
				set.status = 404;
				return { error: "Photocard not found" };
			}

			const pc = await photocardService.update(params.id, {
				name: body.name,
				description: body.description ?? undefined,
				imageUrl: body.imageUrl ?? undefined,
				artistId: body.artistId ?? undefined,
			});

			return {
				id: pc.id,
				name: pc.name,
				description: pc.description,
				imageUrl: pc.imageUrl,
				artist: pc.artist ? { id: pc.artist.id, name: pc.artist.name } : null,
			};
		},
		{
			params: t.Object({ id: t.String() }),
			body: t.Object({
				name: t.Optional(t.String({ minLength: 1 })),
				description: t.Optional(t.Nullable(t.String())),
				imageUrl: t.Optional(t.Nullable(t.String())),
				artistId: t.Optional(t.Nullable(t.String())),
			}),
			response: {
				200: t.Object({
					id: t.String(),
					name: t.String(),
					description: t.Nullable(t.String()),
					imageUrl: t.Nullable(t.String()),
					artist: t.Nullable(SimpleArtistSchema),
				}),
				404: ErrorSchema,
			},
			detail: {
				tags: ["Photocards"],
				summary: "포토카드 수정",
				description: "포토카드 정보를 수정합니다.",
			},
		},
	)
	// DELETE /api/photocards/:id - 포토카드 삭제
	.delete(
		"/:id",
		async ({ params, set }) => {
			const existing = await photocardService.findById(params.id);
			if (!existing) {
				set.status = 404;
				return { error: "Photocard not found" };
			}

			await photocardService.delete(params.id);
			return { message: "Photocard deleted successfully" };
		},
		{
			params: t.Object({ id: t.String() }),
			response: {
				200: MessageSchema,
				404: ErrorSchema,
			},
			detail: {
				tags: ["Photocards"],
				summary: "포토카드 삭제",
				description: "포토카드를 삭제합니다.",
			},
		},
	);

/**
 * Public GalmangPoca Routes
 */
export const publicGalmangPocaRoutes = new Elysia({ prefix: "/galmang-poca" })
	// GET /api/galmang-poca - 갈망포카 목록
	.get(
		"/",
		async ({ query }) => {
			const result = await galmangPocaService.findAll({
				cursor: query.cursor,
				limit: query.limit ? Number.parseInt(query.limit) : 20,
			});

			return {
				items: result.items.map((gp) => ({
					id: gp.id,
					quantity: gp.quantity,
					createdAt: gp.createdAt.toISOString(),
					photocard: {
						id: gp.photocard.id,
						name: gp.photocard.name,
						imageUrl: gp.photocard.imageUrl,
						artist: gp.photocard.artist
							? {
									id: gp.photocard.artist.id,
									name: gp.photocard.artist.name,
									group: gp.photocard.artist.group
										? {
												id: gp.photocard.artist.group.id,
												name: gp.photocard.artist.group.name,
											}
										: null,
								}
							: null,
					},
				})),
				nextCursor: result.nextCursor,
				hasMore: result.hasMore,
			};
		},
		{
			query: t.Object({
				cursor: t.Optional(t.String()),
				limit: t.Optional(t.String()),
			}),
			response: PaginatedGalmangPocaSchema,
			detail: {
				tags: ["GalmangPoca"],
				summary: "갈망포카 목록 조회",
				description: "갈망포카 목록을 페이지네이션하여 조회합니다.",
			},
		},
	)
	// GET /api/galmang-poca/:id - 갈망포카 상세
	.get(
		"/:id",
		async ({ params, set }) => {
			const gp = await galmangPocaService.findById(params.id);
			if (!gp) {
				set.status = 404;
				return { error: "GalmangPoca not found" };
			}
			return {
				id: gp.id,
				quantity: gp.quantity,
				createdAt: gp.createdAt.toISOString(),
				photocard: {
					id: gp.photocard.id,
					name: gp.photocard.name,
					imageUrl: gp.photocard.imageUrl,
				},
			};
		},
		{
			params: t.Object({ id: t.String() }),
			response: {
				200: t.Object({
					id: t.String(),
					quantity: t.Number(),
					createdAt: t.String(),
					photocard: t.Object({
						id: t.String(),
						name: t.String(),
						imageUrl: t.Nullable(t.String()),
					}),
				}),
				404: ErrorSchema,
			},
			detail: {
				tags: ["GalmangPoca"],
				summary: "갈망포카 상세 조회",
				description: "갈망포카의 상세 정보를 조회합니다.",
			},
		},
	);

/**
 * Protected GalmangPoca Routes
 */
export const galmangPocaRoutes = new Elysia({ prefix: "/galmang-poca" })
	.use(authGuard)
	// POST /api/galmang-poca - 갈망포카 추가
	.post(
		"/",
		async ({ body, set }) => {
			const gp = await galmangPocaService.create({
				photocardId: body.photocardId,
				quantity: body.quantity,
			});

			set.status = 201;
			return {
				id: gp.id,
				quantity: gp.quantity,
				createdAt: gp.createdAt.toISOString(),
				photocard: {
					id: gp.photocard.id,
					name: gp.photocard.name,
				},
			};
		},
		{
			body: t.Object({
				photocardId: t.String(),
				quantity: t.Optional(t.Number({ minimum: 1 })),
			}),
			response: t.Object({
				id: t.String(),
				quantity: t.Number(),
				createdAt: t.String(),
				photocard: t.Object({
					id: t.String(),
					name: t.String(),
				}),
			}),
			detail: {
				tags: ["GalmangPoca"],
				summary: "갈망포카 추가",
				description: "새 갈망포카를 추가합니다.",
			},
		},
	)
	// PUT /api/galmang-poca/:id - 갈망포카 수량 수정
	.put(
		"/:id",
		async ({ params, body, set }) => {
			const existing = await galmangPocaService.findById(params.id);
			if (!existing) {
				set.status = 404;
				return { error: "GalmangPoca not found" };
			}

			const gp = await galmangPocaService.updateQuantity(
				params.id,
				body.quantity,
			);
			return {
				id: gp.id,
				quantity: gp.quantity,
			};
		},
		{
			params: t.Object({ id: t.String() }),
			body: t.Object({
				quantity: t.Number({ minimum: 1 }),
			}),
			response: {
				200: t.Object({
					id: t.String(),
					quantity: t.Number(),
				}),
				404: ErrorSchema,
			},
			detail: {
				tags: ["GalmangPoca"],
				summary: "갈망포카 수량 수정",
				description: "갈망포카 수량을 수정합니다.",
			},
		},
	)
	// DELETE /api/galmang-poca/:id - 갈망포카 삭제
	.delete(
		"/:id",
		async ({ params, set }) => {
			const existing = await galmangPocaService.findById(params.id);
			if (!existing) {
				set.status = 404;
				return { error: "GalmangPoca not found" };
			}

			await galmangPocaService.delete(params.id);
			return { message: "GalmangPoca deleted successfully" };
		},
		{
			params: t.Object({ id: t.String() }),
			response: {
				200: MessageSchema,
				404: ErrorSchema,
			},
			detail: {
				tags: ["GalmangPoca"],
				summary: "갈망포카 삭제",
				description: "갈망포카를 삭제합니다.",
			},
		},
	);
