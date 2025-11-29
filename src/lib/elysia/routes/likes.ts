import { Elysia, t } from "elysia";
import { authGuard } from "@/lib/elysia/auth";
import { likeService } from "@/lib/services/like";
import { userService } from "@/lib/services/user";

/**
 * Like Routes (인증 필수)
 */
export const likeRoutes = new Elysia({ prefix: "/likes" })
	.use(authGuard)
	// POST /api/likes/posts/:postId - 좋아요 토글
	.post(
		"/posts/:postId",
		async ({ auth, params }) => {
			const user = await userService.findOrCreate(
				auth.user.id,
				auth.user.email,
				auth.user.user_metadata?.full_name,
				auth.user.user_metadata?.avatar_url,
			);

			const result = await likeService.toggle(user.id, params.postId);
			const count = await likeService.getCount(params.postId);

			return {
				liked: result.liked,
				count,
			};
		},
		{ params: t.Object({ postId: t.String() }) },
	)
	// GET /api/likes/posts/:postId - 좋아요 여부 확인
	.get(
		"/posts/:postId",
		async ({ auth, params }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				return { liked: false, count: 0 };
			}

			const liked = await likeService.isLiked(user.id, params.postId);
			const count = await likeService.getCount(params.postId);

			return { liked, count };
		},
		{ params: t.Object({ postId: t.String() }) },
	)
	// GET /api/likes/posts/:postId/users - 좋아요한 사용자 목록
	.get(
		"/posts/:postId/users",
		async ({ params }) => {
			const users = await likeService.getLikedUsers(params.postId);
			return { users };
		},
		{ params: t.Object({ postId: t.String() }) },
	)
	// GET /api/likes/me - 내가 좋아요한 게시글 목록
	.get("/me", async ({ auth }) => {
		const user = await userService.findBySupabaseId(auth.user.id);
		if (!user) {
			return { items: [] };
		}

		const posts = await likeService.getLikedPosts(user.id);
		return {
			items: posts.map((post) => ({
				id: post.id,
				content: post.content,
				createdAt: post.createdAt.toISOString(),
				user: post.user,
				images: post.images,
				replyCount: post.replyCount,
				likeCount: post.likeCount,
				likedAt: post.likedAt.toISOString(),
			})),
		};
	})
	// POST /api/likes/check - 여러 게시글 좋아요 여부 확인 (batch)
	.post(
		"/check",
		async ({ auth, body }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				return {
					likes: body.postIds.reduce(
						(acc, id) => {
							acc[id] = false;
							return acc;
						},
						{} as Record<string, boolean>,
					),
				};
			}

			const likes = await likeService.checkLikedPosts(user.id, body.postIds);
			return { likes };
		},
		{
			body: t.Object({
				postIds: t.Array(t.String(), { minItems: 1 }),
			}),
		},
	);
