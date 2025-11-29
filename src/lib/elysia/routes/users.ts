import { Elysia, t } from "elysia";
import { authGuard, optionalAuth } from "@/lib/elysia/auth";
import { userService } from "@/lib/services/user";

/**
 * User API Routes
 * 인증된 사용자를 위한 User CRUD API
 */
export const userRoutes = new Elysia({ prefix: "/users" })
	.use(authGuard)
	// GET /api/users/me - 현재 사용자 정보 (Prisma User)
	.get("/me", async ({ auth }) => {
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
	})
	// PUT /api/users/me - 현재 사용자 정보 수정
	.put(
		"/me",
		async ({ auth, body }) => {
			const existingUser = await userService.findBySupabaseId(auth.user.id);

			if (!existingUser) {
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
		},
	)
	// DELETE /api/users/me - 회원 탈퇴 (soft delete)
	.delete("/me", async ({ auth, set }) => {
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
	})
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
		},
	);

/**
 * Public User Routes (인증 불필요)
 */
export const publicUserRoutes = new Elysia({ prefix: "/users" })
	// GET /api/users - 전체 사용자 목록 (공개 정보만)
	.get("/", async ({ query }) => {
		const users = await userService.findAll();

		return users.map((user) => ({
			id: user.id,
			nickname: user.nickname,
			profileImage: user.profileImage,
			score: user.score,
		}));
	});
