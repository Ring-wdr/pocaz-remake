import { Elysia, t } from "elysia";
import { authGuard } from "@/lib/elysia/auth";
import { userService } from "@/lib/services/user";

// 공통 응답 스키마
const UserResponseSchema = t.Object({
	id: t.String(),
	supabaseId: t.String(),
	email: t.Nullable(t.String()),
	nickname: t.String(),
	profileImage: t.Nullable(t.String()),
	score: t.Number(),
	artistId: t.Nullable(t.String()),
	createdAt: t.String(),
});

const PublicUserSchema = t.Object({
	id: t.String(),
	nickname: t.String(),
	profileImage: t.Nullable(t.String()),
	score: t.Number(),
	artistId: t.Optional(t.Nullable(t.String())),
});

const ErrorSchema = t.Object({
	error: t.String(),
	message: t.Optional(t.String()),
});

/**
 * User API Routes
 * 인증된 사용자를 위한 User CRUD API
 */
export const userRoutes = new Elysia({ prefix: "/users" })
	.use(authGuard)
	// GET /api/users/me - 현재 사용자 정보 (Prisma User)
	.get(
		"/me",
		async ({ auth }) => {
			const user = await userService.findOrCreate(
				auth.user.id,
				auth.user.email,
				auth.user.user_metadata?.full_name,
				auth.user.user_metadata?.avatar_url,
			);

			return {
				id: user.id,
				supabaseId: user.supabaseId,
				email: user.email,
				nickname: user.nickname,
				profileImage: user.profileImage,
				score: user.score,
				artistId: user.artistId,
				createdAt: user.createdAt.toISOString(),
			};
		},
		{
			response: UserResponseSchema,
			detail: {
				tags: ["Users"],
				summary: "현재 사용자 정보 조회",
				description: "인증된 사용자의 Prisma User 정보를 조회합니다.",
			},
		},
	)
	// PUT /api/users/me - 현재 사용자 정보 수정
	.put(
		"/me",
		async ({ auth, body, set }) => {
			const existingUser = await userService.findBySupabaseId(auth.user.id);

			if (!existingUser) {
				set.status = 404;
				return {
					error: "User not found",
					message: "Please complete registration first",
				};
			}

			const user = await userService.update(existingUser.id, {
				nickname: body.nickname,
				profileImage: body.profileImage,
				artistId: body.artistId,
			});

			return {
				id: user.id,
				supabaseId: user.supabaseId,
				email: user.email,
				nickname: user.nickname,
				profileImage: user.profileImage,
				score: user.score,
				artistId: user.artistId,
				updatedAt: user.updatedAt.toISOString(),
			};
		},
		{
			body: t.Object({
				nickname: t.Optional(t.String({ minLength: 1, maxLength: 50 })),
				profileImage: t.Optional(t.Nullable(t.String())),
				artistId: t.Optional(t.Nullable(t.String())),
			}),
			response: {
				200: t.Object({
					id: t.String(),
					supabaseId: t.String(),
					email: t.Nullable(t.String()),
					nickname: t.String(),
					profileImage: t.Nullable(t.String()),
					score: t.Number(),
					artistId: t.Nullable(t.String()),
					updatedAt: t.String(),
				}),
				404: ErrorSchema,
			},
			detail: {
				tags: ["Users"],
				summary: "현재 사용자 정보 수정",
				description: "인증된 사용자의 프로필 정보를 수정합니다.",
			},
		},
	)
	// DELETE /api/users/me - 회원 탈퇴 (soft delete)
	.delete(
		"/me",
		async ({ auth, set }) => {
			const existingUser = await userService.findBySupabaseId(auth.user.id);

			if (!existingUser) {
				set.status = 404;
				return {
					error: "User not found",
				};
			}

			await userService.softDelete(existingUser.id);

			return {
				message: "User deleted successfully",
			};
		},
		{
			response: {
				200: t.Object({ message: t.String() }),
				404: t.Object({ error: t.String() }),
			},
			detail: {
				tags: ["Users"],
				summary: "회원 탈퇴",
				description: "인증된 사용자의 계정을 삭제합니다 (soft delete).",
			},
		},
	)
	// GET /api/users/:id - 특정 사용자 조회 (공개 정보만)
	.get(
		"/:id",
		async ({ params, set }) => {
			const user = await userService.findById(params.id);

			if (!user || user.deletedAt) {
				set.status = 404;
				return {
					error: "User not found",
				};
			}

			return {
				id: user.id,
				nickname: user.nickname,
				profileImage: user.profileImage,
				score: user.score,
				artistId: user.artistId,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: PublicUserSchema,
				404: t.Object({ error: t.String() }),
			},
			detail: {
				tags: ["Users"],
				summary: "특정 사용자 조회",
				description: "특정 사용자의 공개 정보를 조회합니다.",
			},
		},
	);

/**
 * Public User Routes (인증 불필요)
 */
export const publicUserRoutes = new Elysia({ prefix: "/users" })
	// GET /api/users - 전체 사용자 목록 (공개 정보만)
	.get(
		"/",
		async () => {
			const users = await userService.findAll();

			return users.map((user) => ({
				id: user.id,
				nickname: user.nickname,
				profileImage: user.profileImage,
				score: user.score,
			}));
		},
		{
			response: t.Array(
				t.Object({
					id: t.String(),
					nickname: t.String(),
					profileImage: t.Nullable(t.String()),
					score: t.Number(),
				}),
			),
			detail: {
				tags: ["Users"],
				summary: "전체 사용자 목록 조회",
				description: "모든 사용자의 공개 정보를 조회합니다.",
			},
		},
	);
