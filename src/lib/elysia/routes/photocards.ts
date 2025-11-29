import { Elysia, t } from "elysia";
import { authGuard } from "@/lib/elysia/auth";
import { photocardService, galmangPocaService } from "@/lib/services/photocard";

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
				limit: query.limit ? Number.parseInt(query.limit) : 20,
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
				limit: query.limit ? Number.parseInt(query.limit) : 20,
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
											? { id: pc.artist.group.agency.id, name: pc.artist.group.agency.name }
											: null,
									}
								: null,
						}
					: null,
			};
		},
		{ params: t.Object({ id: t.String() }) },
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
		{ params: t.Object({ id: t.String() }) },
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
										? { id: gp.photocard.artist.group.id, name: gp.photocard.artist.group.name }
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
		{ params: t.Object({ id: t.String() }) },
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

			const gp = await galmangPocaService.updateQuantity(params.id, body.quantity);
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
		{ params: t.Object({ id: t.String() }) },
	);
