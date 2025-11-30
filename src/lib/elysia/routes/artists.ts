import { Elysia, t } from "elysia";
import { authGuard } from "@/lib/elysia/auth";
import {
	agencyService,
	artistGroupService,
	artistService,
} from "@/lib/services/artist";

// 공통 스키마
const AgencySchema = t.Object({
	id: t.String(),
	name: t.String(),
});

const GroupWithAgencySchema = t.Object({
	id: t.String(),
	name: t.String(),
	agency: t.Nullable(AgencySchema),
});

const ArtistWithGroupSchema = t.Object({
	id: t.String(),
	name: t.String(),
	group: t.Nullable(GroupWithAgencySchema),
});

const ErrorSchema = t.Object({
	error: t.String(),
});

const MessageSchema = t.Object({
	message: t.String(),
});

/**
 * Public Artist Routes (인증 불필요 - 조회)
 */
export const publicArtistRoutes = new Elysia()
	// ============================================
	// Agency Routes
	// ============================================
	.get(
		"/agencies",
		async () => {
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
		},
		{
			response: t.Object({
				items: t.Array(
					t.Object({
						id: t.String(),
						name: t.String(),
						groups: t.Array(
							t.Object({
								id: t.String(),
								name: t.String(),
								artistCount: t.Number(),
							}),
						),
					}),
				),
			}),
			detail: {
				tags: ["Artists"],
				summary: "소속사 목록 조회",
				description: "모든 소속사와 소속 그룹 목록을 조회합니다.",
			},
		},
	)
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
		{
			params: t.Object({ id: t.String() }),
			detail: {
				tags: ["Artists"],
				summary: "소속사 상세 조회",
				description: "소속사의 상세 정보와 소속 그룹/아티스트를 조회합니다.",
			},
		},
	)
	// ============================================
	// ArtistGroup Routes
	// ============================================
	.get(
		"/groups",
		async () => {
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
		},
		{
			response: t.Object({
				items: t.Array(
					t.Object({
						id: t.String(),
						name: t.String(),
						agency: t.Nullable(AgencySchema),
						artistCount: t.Number(),
					}),
				),
			}),
			detail: {
				tags: ["Artists"],
				summary: "그룹 목록 조회",
				description: "모든 아티스트 그룹 목록을 조회합니다.",
			},
		},
	)
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
		{
			params: t.Object({ id: t.String() }),
			detail: {
				tags: ["Artists"],
				summary: "그룹 상세 조회",
				description: "그룹의 상세 정보와 소속 아티스트를 조회합니다.",
			},
		},
	)
	.get(
		"/agencies/:id/groups",
		async ({ params }) => {
			const groups = await artistGroupService.findByAgencyId(params.id);
			return {
				items: groups.map((group) => ({
					id: group.id,
					name: group.name,
					artistCount: group.artists.length,
				})),
			};
		},
		{
			params: t.Object({ id: t.String() }),
			detail: {
				tags: ["Artists"],
				summary: "소속사별 그룹 조회",
				description: "특정 소속사의 그룹 목록을 조회합니다.",
			},
		},
	)
	// ============================================
	// Artist Routes
	// ============================================
	.get(
		"/artists",
		async () => {
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
									? {
											id: artist.group.agency.id,
											name: artist.group.agency.name,
										}
									: null,
							}
						: null,
				})),
			};
		},
		{
			response: t.Object({
				items: t.Array(ArtistWithGroupSchema),
			}),
			detail: {
				tags: ["Artists"],
				summary: "아티스트 목록 조회",
				description: "모든 아티스트 목록을 조회합니다.",
			},
		},
	)
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
									? {
											id: artist.group.agency.id,
											name: artist.group.agency.name,
										}
									: null,
							}
						: null,
				})),
			};
		},
		{
			query: t.Object({ keyword: t.Optional(t.String()) }),
			response: t.Object({
				items: t.Array(ArtistWithGroupSchema),
			}),
			detail: {
				tags: ["Artists"],
				summary: "아티스트 검색",
				description: "키워드로 아티스트를 검색합니다.",
			},
		},
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
								? {
										id: artist.group.agency.id,
										name: artist.group.agency.name,
									}
								: null,
						}
					: null,
				photocardCount: artist.photocards.length,
			};
		},
		{
			params: t.Object({ id: t.String() }),
			detail: {
				tags: ["Artists"],
				summary: "아티스트 상세 조회",
				description: "아티스트의 상세 정보를 조회합니다.",
			},
		},
	)
	.get(
		"/groups/:id/artists",
		async ({ params }) => {
			const artists = await artistService.findByGroupId(params.id);
			return {
				items: artists.map((artist) => ({
					id: artist.id,
					name: artist.name,
				})),
			};
		},
		{
			params: t.Object({ id: t.String() }),
			detail: {
				tags: ["Artists"],
				summary: "그룹별 아티스트 조회",
				description: "특정 그룹의 아티스트 목록을 조회합니다.",
			},
		},
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
		{
			body: t.Object({ name: t.String({ minLength: 1 }) }),
			response: t.Object({
				id: t.String(),
				name: t.String(),
				createdAt: t.String(),
			}),
			detail: {
				tags: ["Artists"],
				summary: "소속사 생성",
				description: "새 소속사를 생성합니다.",
			},
		},
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
			response: {
				200: AgencySchema,
				404: ErrorSchema,
			},
			detail: {
				tags: ["Artists"],
				summary: "소속사 수정",
				description: "소속사 정보를 수정합니다.",
			},
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
		{
			params: t.Object({ id: t.String() }),
			response: {
				200: MessageSchema,
				404: ErrorSchema,
			},
			detail: {
				tags: ["Artists"],
				summary: "소속사 삭제",
				description: "소속사를 삭제합니다.",
			},
		},
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
			detail: {
				tags: ["Artists"],
				summary: "그룹 생성",
				description: "새 아티스트 그룹을 생성합니다.",
			},
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
			detail: {
				tags: ["Artists"],
				summary: "그룹 수정",
				description: "그룹 정보를 수정합니다.",
			},
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
		{
			params: t.Object({ id: t.String() }),
			response: {
				200: MessageSchema,
				404: ErrorSchema,
			},
			detail: {
				tags: ["Artists"],
				summary: "그룹 삭제",
				description: "그룹을 삭제합니다.",
			},
		},
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
			detail: {
				tags: ["Artists"],
				summary: "아티스트 생성",
				description: "새 아티스트를 생성합니다.",
			},
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
			detail: {
				tags: ["Artists"],
				summary: "아티스트 수정",
				description: "아티스트 정보를 수정합니다.",
			},
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
		{
			params: t.Object({ id: t.String() }),
			response: {
				200: MessageSchema,
				404: ErrorSchema,
			},
			detail: {
				tags: ["Artists"],
				summary: "아티스트 삭제",
				description: "아티스트를 삭제합니다.",
			},
		},
	);
