import { Elysia, t } from "elysia";
import { authGuard } from "@/lib/elysia/auth";
import { agencyService, artistGroupService, artistService } from "@/lib/services/artist";

/**
 * Public Artist Routes (인증 불필요 - 조회)
 */
export const publicArtistRoutes = new Elysia()
	// ============================================
	// Agency Routes
	// ============================================
	.get("/agencies", async () => {
		const agencies = await agencyService.findAll();
		return {
			items: agencies.map((agency) => ({
				id: agency.id,
				name: agency.name,
				groups: agency.groups.map((group) => ({
					id: group.id,
					name: group.name,
					artistCount: group.artists.length,
				})),
			})),
		};
	})
	.get(
		"/agencies/:id",
		async ({ params, set }) => {
			const agency = await agencyService.findById(params.id);
			if (!agency) {
				set.status = 404;
				return { error: "Agency not found" };
			}
			return {
				id: agency.id,
				name: agency.name,
				createdAt: agency.createdAt.toISOString(),
				groups: agency.groups.map((group) => ({
					id: group.id,
					name: group.name,
					artists: group.artists.map((artist) => ({
						id: artist.id,
						name: artist.name,
					})),
				})),
			};
		},
		{ params: t.Object({ id: t.String() }) },
	)
	// ============================================
	// ArtistGroup Routes
	// ============================================
	.get("/groups", async () => {
		const groups = await artistGroupService.findAll();
		return {
			items: groups.map((group) => ({
				id: group.id,
				name: group.name,
				agency: group.agency
					? { id: group.agency.id, name: group.agency.name }
					: null,
				artistCount: group.artists.length,
			})),
		};
	})
	.get(
		"/groups/:id",
		async ({ params, set }) => {
			const group = await artistGroupService.findById(params.id);
			if (!group) {
				set.status = 404;
				return { error: "Group not found" };
			}
			return {
				id: group.id,
				name: group.name,
				createdAt: group.createdAt.toISOString(),
				agency: group.agency
					? { id: group.agency.id, name: group.agency.name }
					: null,
				artists: group.artists.map((artist) => ({
					id: artist.id,
					name: artist.name,
				})),
			};
		},
		{ params: t.Object({ id: t.String() }) },
	)
	.get(
		"/agencies/:agencyId/groups",
		async ({ params }) => {
			const groups = await artistGroupService.findByAgencyId(params.agencyId);
			return {
				items: groups.map((group) => ({
					id: group.id,
					name: group.name,
					artistCount: group.artists.length,
				})),
			};
		},
		{ params: t.Object({ agencyId: t.String() }) },
	)
	// ============================================
	// Artist Routes
	// ============================================
	.get("/artists", async () => {
		const artists = await artistService.findAll();
		return {
			items: artists.map((artist) => ({
				id: artist.id,
				name: artist.name,
				group: artist.group
					? {
							id: artist.group.id,
							name: artist.group.name,
							agency: artist.group.agency
								? { id: artist.group.agency.id, name: artist.group.agency.name }
								: null,
						}
					: null,
			})),
		};
	})
	.get(
		"/artists/search",
		async ({ query }) => {
			if (!query.keyword) {
				return { items: [] };
			}
			const artists = await artistService.search(query.keyword);
			return {
				items: artists.map((artist) => ({
					id: artist.id,
					name: artist.name,
					group: artist.group
						? {
								id: artist.group.id,
								name: artist.group.name,
								agency: artist.group.agency
									? { id: artist.group.agency.id, name: artist.group.agency.name }
									: null,
							}
						: null,
				})),
			};
		},
		{ query: t.Object({ keyword: t.Optional(t.String()) }) },
	)
	.get(
		"/artists/:id",
		async ({ params, set }) => {
			const artist = await artistService.findById(params.id);
			if (!artist) {
				set.status = 404;
				return { error: "Artist not found" };
			}
			return {
				id: artist.id,
				name: artist.name,
				createdAt: artist.createdAt.toISOString(),
				group: artist.group
					? {
							id: artist.group.id,
							name: artist.group.name,
							agency: artist.group.agency
								? { id: artist.group.agency.id, name: artist.group.agency.name }
								: null,
						}
					: null,
				photocardCount: artist.photocards.length,
			};
		},
		{ params: t.Object({ id: t.String() }) },
	)
	.get(
		"/groups/:groupId/artists",
		async ({ params }) => {
			const artists = await artistService.findByGroupId(params.groupId);
			return {
				items: artists.map((artist) => ({
					id: artist.id,
					name: artist.name,
				})),
			};
		},
		{ params: t.Object({ groupId: t.String() }) },
	);

/**
 * Protected Artist Routes (인증 필수 - 생성/수정/삭제)
 */
export const artistRoutes = new Elysia()
	.use(authGuard)
	// ============================================
	// Agency Management
	// ============================================
	.post(
		"/agencies",
		async ({ body, set }) => {
			const agency = await agencyService.create({ name: body.name });
			set.status = 201;
			return {
				id: agency.id,
				name: agency.name,
				createdAt: agency.createdAt.toISOString(),
			};
		},
		{ body: t.Object({ name: t.String({ minLength: 1 }) }) },
	)
	.put(
		"/agencies/:id",
		async ({ params, body, set }) => {
			const agency = await agencyService.findById(params.id);
			if (!agency) {
				set.status = 404;
				return { error: "Agency not found" };
			}
			const updated = await agencyService.update(params.id, body.name);
			return {
				id: updated.id,
				name: updated.name,
			};
		},
		{
			params: t.Object({ id: t.String() }),
			body: t.Object({ name: t.String({ minLength: 1 }) }),
		},
	)
	.delete(
		"/agencies/:id",
		async ({ params, set }) => {
			const agency = await agencyService.findById(params.id);
			if (!agency) {
				set.status = 404;
				return { error: "Agency not found" };
			}
			await agencyService.delete(params.id);
			return { message: "Agency deleted successfully" };
		},
		{ params: t.Object({ id: t.String() }) },
	)
	// ============================================
	// ArtistGroup Management
	// ============================================
	.post(
		"/groups",
		async ({ body, set }) => {
			const group = await artistGroupService.create({
				name: body.name,
				agencyId: body.agencyId,
			});
			set.status = 201;
			return {
				id: group.id,
				name: group.name,
				agency: group.agency
					? { id: group.agency.id, name: group.agency.name }
					: null,
				createdAt: group.createdAt.toISOString(),
			};
		},
		{
			body: t.Object({
				name: t.String({ minLength: 1 }),
				agencyId: t.Optional(t.String()),
			}),
		},
	)
	.put(
		"/groups/:id",
		async ({ params, body, set }) => {
			const group = await artistGroupService.findById(params.id);
			if (!group) {
				set.status = 404;
				return { error: "Group not found" };
			}
			const updated = await artistGroupService.update(params.id, {
				name: body.name,
				agencyId: body.agencyId ?? undefined,
			});
			return {
				id: updated.id,
				name: updated.name,
				agency: updated.agency
					? { id: updated.agency.id, name: updated.agency.name }
					: null,
			};
		},
		{
			params: t.Object({ id: t.String() }),
			body: t.Object({
				name: t.Optional(t.String({ minLength: 1 })),
				agencyId: t.Optional(t.Nullable(t.String())),
			}),
		},
	)
	.delete(
		"/groups/:id",
		async ({ params, set }) => {
			const group = await artistGroupService.findById(params.id);
			if (!group) {
				set.status = 404;
				return { error: "Group not found" };
			}
			await artistGroupService.delete(params.id);
			return { message: "Group deleted successfully" };
		},
		{ params: t.Object({ id: t.String() }) },
	)
	// ============================================
	// Artist Management
	// ============================================
	.post(
		"/artists",
		async ({ body, set }) => {
			const artist = await artistService.create({
				name: body.name,
				groupId: body.groupId,
			});
			set.status = 201;
			return {
				id: artist.id,
				name: artist.name,
				group: artist.group
					? { id: artist.group.id, name: artist.group.name }
					: null,
				createdAt: artist.createdAt.toISOString(),
			};
		},
		{
			body: t.Object({
				name: t.String({ minLength: 1 }),
				groupId: t.Optional(t.String()),
			}),
		},
	)
	.put(
		"/artists/:id",
		async ({ params, body, set }) => {
			const artist = await artistService.findById(params.id);
			if (!artist) {
				set.status = 404;
				return { error: "Artist not found" };
			}
			const updated = await artistService.update(params.id, {
				name: body.name,
				groupId: body.groupId ?? undefined,
			});
			return {
				id: updated.id,
				name: updated.name,
				group: updated.group
					? { id: updated.group.id, name: updated.group.name }
					: null,
			};
		},
		{
			params: t.Object({ id: t.String() }),
			body: t.Object({
				name: t.Optional(t.String({ minLength: 1 })),
				groupId: t.Optional(t.Nullable(t.String())),
			}),
		},
	)
	.delete(
		"/artists/:id",
		async ({ params, set }) => {
			const artist = await artistService.findById(params.id);
			if (!artist) {
				set.status = 404;
				return { error: "Artist not found" };
			}
			await artistService.delete(params.id);
			return { message: "Artist deleted successfully" };
		},
		{ params: t.Object({ id: t.String() }) },
	);
