import { Elysia, t } from "elysia";
import { type Generator, rateLimit } from "elysia-rate-limit";
import { type AuthenticatedContext, authGuard } from "@/lib/elysia/auth";
import { likeService } from "@/lib/services/like";
import { marketLikeService } from "@/lib/services/market";
import { userService } from "@/lib/services/user";

type DerivedAuth = {
	auth?: AuthenticatedContext;
};

const userGenerator: Generator<DerivedAuth> = (req, server, { auth }) => {
	if (!auth?.user) {
		return server?.requestIP(req)?.address ?? "anonymous";
	}

	return `user:${auth.user.id}`;
};

// 공통 스키마
const LikeStatusSchema = t.Object({
	liked: t.Boolean(),
	count: t.Number(),
});

const UserSchema = t.Object({
	id: t.String(),
	nickname: t.String(),
	profileImage: t.Nullable(t.String()),
});

const RateLimitErrorSchema = t.Object({
	error: t.String(),
	message: t.Optional(t.String()),
});

const ImageSchema = t.Object({
	id: t.String(),
	imageUrl: t.String(),
});

/**
 * Like Routes (인증 필수)
 */
export const likeRoutes = new Elysia({ prefix: "/likes" })
	.use(authGuard)
	.use(
		rateLimit({
			duration: 5000,
			max: 10,
			scoping: "scoped",
			generator: userGenerator,
			skip: (req) => {
				return req.method === "GET";
			},
			errorResponse: new Response(
				JSON.stringify({
					error: "rate_limit",
					message: "Too many requests. Please try again shortly.",
				}),
				{
					status: 429,
					headers: { "content-type": "application/json" },
				},
			),
		}),
	)
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
		{
			params: t.Object({ postId: t.String() }),
			response: {
				200: LikeStatusSchema,
				429: RateLimitErrorSchema,
			},
			detail: {
				tags: ["Likes"],
				summary: "좋아요 토글",
				description: "게시글의 좋아요를 토글합니다.",
			},
		},
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
		{
			params: t.Object({ postId: t.String() }),
			response: LikeStatusSchema,
			detail: {
				tags: ["Likes"],
				summary: "좋아요 여부 확인",
				description: "게시글의 좋아요 여부와 개수를 확인합니다.",
			},
		},
	)
	// GET /api/likes/posts/:postId/users - 좋아요한 사용자 목록
	.get(
		"/posts/:postId/users",
		async ({ params }) => {
			const users = await likeService.getLikedUsers(params.postId);
			return { users };
		},
		{
			params: t.Object({ postId: t.String() }),
			response: t.Object({
				users: t.Array(UserSchema),
			}),
			detail: {
				tags: ["Likes"],
				summary: "좋아요한 사용자 목록",
				description: "게시글을 좋아요한 사용자 목록을 조회합니다.",
			},
		},
	)
	// GET /api/likes/me - 내가 좋아요한 게시글 목록 (페이지네이션 지원)
	.get(
		"/me",
		async ({ auth, query }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				return { items: [], nextCursor: null, hasMore: false };
			}

			const parsedLimit = query.limit ? Number.parseInt(query.limit, 10) : 20;
			const result = await likeService.getLikedPosts(user.id, {
				cursor: query.cursor,
				limit: Number.isFinite(parsedLimit) ? parsedLimit : 20,
			});

			return {
				items: result.items.map((post) => ({
					id: post.id,
					content: post.content,
					createdAt: post.createdAt.toISOString(),
					user: post.user,
					images: post.images,
					replyCount: post.replyCount,
					likeCount: post.likeCount,
					likedAt: post.likedAt.toISOString(),
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
			response: t.Object({
				items: t.Array(
					t.Object({
						id: t.String(),
						content: t.String(),
						createdAt: t.String(),
						user: UserSchema,
						images: t.Array(ImageSchema),
						replyCount: t.Number(),
						likeCount: t.Number(),
						likedAt: t.String(),
					}),
				),
				nextCursor: t.Nullable(t.String()),
				hasMore: t.Boolean(),
			}),
			detail: {
				tags: ["Likes"],
				summary: "내가 좋아요한 게시글 목록",
				description: "현재 사용자가 좋아요한 게시글 목록을 조회합니다 (페이지네이션 지원).",
			},
		},
	)
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
			response: {
				200: t.Object({
					likes: t.Record(t.String(), t.Boolean()),
				}),
				429: RateLimitErrorSchema,
			},
			detail: {
				tags: ["Likes"],
				summary: "여러 게시글 좋아요 여부 확인",
				description: "여러 게시글의 좋아요 여부를 일괄 확인합니다.",
			},
		},
	)
	// POST /api/likes/markets/:marketId - 마켓 찜 토글
	.post(
		"/markets/:marketId",
		async ({ auth, params }) => {
			const user = await userService.findOrCreate(
				auth.user.id,
				auth.user.email,
				auth.user.user_metadata?.full_name,
				auth.user.user_metadata?.avatar_url,
			);

			const result = await marketLikeService.toggle(user.id, params.marketId);
			const count = await marketLikeService.getCount(params.marketId);

			return {
				liked: result.liked,
				count,
			};
		},
		{
			params: t.Object({ marketId: t.String() }),
			response: {
				200: LikeStatusSchema,
				429: RateLimitErrorSchema,
			},
			detail: {
				tags: ["Likes"],
				summary: "마켓 찜 토글",
				description: "마켓 상품의 찜 상태를 토글합니다.",
			},
		},
	)
	// GET /api/likes/markets/:marketId - 마켓 찜 여부 확인
	.get(
		"/markets/:marketId",
		async ({ auth, params }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			const liked = user
				? await marketLikeService.isLiked(user.id, params.marketId)
				: false;
			const count = await marketLikeService.getCount(params.marketId);

			return { liked, count };
		},
		{
			params: t.Object({ marketId: t.String() }),
			response: LikeStatusSchema,
			detail: {
				tags: ["Likes"],
				summary: "마켓 찜 여부 확인",
				description: "마켓 상품의 찜 여부와 개수를 확인합니다.",
			},
		},
	);
