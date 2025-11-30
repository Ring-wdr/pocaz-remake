import { Elysia, t } from "elysia";
import { authGuard } from "@/lib/elysia/auth";
import {
	postService,
	commentService,
	postImageService,
} from "@/lib/services/post";
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

const PostItemSchema = t.Object({
	id: t.String(),
	content: t.String(),
	createdAt: t.String(),
	user: UserSchema,
	images: t.Array(ImageSchema),
	replyCount: t.Number(),
	likeCount: t.Number(),
});

const PaginatedPostsSchema = t.Object({
	items: t.Array(PostItemSchema),
	nextCursor: t.Nullable(t.String()),
	hasMore: t.Boolean(),
});

// 대댓글 스키마
const CommentReplySchema = t.Object({
	id: t.String(),
	content: t.String(),
	createdAt: t.String(),
	deletedAt: t.Nullable(t.String()),
	user: UserSchema,
});

// 댓글 스키마 (대댓글 포함)
const CommentSchema = t.Object({
	id: t.String(),
	content: t.String(),
	createdAt: t.String(),
	deletedAt: t.Nullable(t.String()),
	user: UserSchema,
	replies: t.Array(CommentReplySchema),
	replyCount: t.Number(),
});

const PaginatedCommentsSchema = t.Object({
	items: t.Array(CommentSchema),
	nextCursor: t.Nullable(t.String()),
	hasMore: t.Boolean(),
	totalCount: t.Number(),
});

const ErrorSchema = t.Object({
	error: t.String(),
});

/**
 * Public Post Routes (인증 불필요)
 */
export const publicPostRoutes = new Elysia({ prefix: "/posts" })
	// GET /api/posts - 게시글 목록
	.get(
		"/",
		async ({ query }) => {
			const category = query.category as
				| "free"
				| "boast"
				| "info"
				| undefined;
			const result = await postService.findAll({
				cursor: query.cursor,
				limit: query.limit ? Number.parseInt(query.limit, 10) : 20,
				category,
			});

			return {
				items: result.items.map((post) => ({
					id: post.id,
					content: post.content,
					createdAt: post.createdAt.toISOString(),
					user: post.user,
					images: post.images,
					replyCount: post._count.comments,
					likeCount: post._count.likes,
				})),
				nextCursor: result.nextCursor,
				hasMore: result.hasMore,
			};
		},
		{
			query: t.Object({
				cursor: t.Optional(t.String()),
				limit: t.Optional(t.String()),
				category: t.Optional(t.Union([t.Literal("free"), t.Literal("boast"), t.Literal("info")])),
			}),
			response: PaginatedPostsSchema,
			detail: {
				tags: ["Posts"],
				summary: "게시글 목록 조회",
				description: "게시글 목록을 페이지네이션하여 조회합니다. category로 필터링 가능합니다.",
			},
		},
	)
	// GET /api/posts/search - 게시글 검색
	.get(
		"/search",
		async ({ query }) => {
			if (!query.keyword) {
				return { items: [], nextCursor: null, hasMore: false };
			}

			const result = await postService.search(query.keyword, {
				cursor: query.cursor,
				limit: query.limit ? Number.parseInt(query.limit, 10) : 20,
			});

			return {
				items: result.items.map((post) => ({
					id: post.id,
					content: post.content,
					createdAt: post.createdAt.toISOString(),
					user: post.user,
					images: post.images,
					replyCount: post._count.comments,
					likeCount: post._count.likes,
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
			response: PaginatedPostsSchema,
			detail: {
				tags: ["Posts"],
				summary: "게시글 검색",
				description: "키워드로 게시글을 검색합니다.",
			},
		},
	)
	// GET /api/posts/:id - 게시글 상세 (댓글 제외 - 별도 API로 분리)
	.get(
		"/:id",
		async ({ params, set }) => {
			const post = await postService.findById(params.id);

			if (!post) {
				set.status = 404;
				return { error: "Post not found" };
			}

			return {
				id: post.id,
				content: post.content,
				createdAt: post.createdAt.toISOString(),
				updatedAt: post.updatedAt.toISOString(),
				user: post.user,
				images: post.images,
				commentCount: post._count.comments,
				likeCount: post._count.likes,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: t.Union([
				t.Object({
					id: t.String(),
					content: t.String(),
					createdAt: t.String(),
					updatedAt: t.String(),
					user: UserSchema,
					images: t.Array(ImageSchema),
					commentCount: t.Number(),
					likeCount: t.Number(),
				}),
				ErrorSchema,
			]),
			detail: {
				tags: ["Posts"],
				summary: "게시글 상세 조회",
				description: "게시글의 상세 정보를 조회합니다. 댓글은 별도 API로 조회합니다.",
			},
		},
	)
	// GET /api/posts/:id/comments - 댓글 목록 조회 (페이지네이션)
	.get(
		"/:id/comments",
		async ({ params, query, set }) => {
			const post = await postService.findById(params.id);
			if (!post) {
				set.status = 404;
				return { error: "Post not found" };
			}

			const [result, totalCount] = await Promise.all([
				commentService.findByPostId(params.id, {
					cursor: query.cursor,
					limit: query.limit ? Number.parseInt(query.limit, 10) : 20,
				}),
				commentService.countByPostId(params.id),
			]);

			return {
				items: result.items.map((comment) => ({
					id: comment.id,
					content: comment.deletedAt ? "" : comment.content,
					createdAt: comment.createdAt.toISOString(),
					deletedAt: comment.deletedAt?.toISOString() ?? null,
					user: comment.user,
					replies: comment.replies.map((reply) => ({
						id: reply.id,
						content: reply.content,
						createdAt: reply.createdAt.toISOString(),
						deletedAt: reply.deletedAt?.toISOString() ?? null,
						user: reply.user,
					})),
					replyCount: comment._count.replies,
				})),
				nextCursor: result.nextCursor,
				hasMore: result.hasMore,
				totalCount,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			query: t.Object({
				cursor: t.Optional(t.String()),
				limit: t.Optional(t.String()),
			}),
			response: t.Union([PaginatedCommentsSchema, ErrorSchema]),
			detail: {
				tags: ["Comments"],
				summary: "댓글 목록 조회",
				description: "게시글의 댓글을 페이지네이션하여 조회합니다. 대댓글도 포함됩니다.",
			},
		},
	)
	// GET /api/posts/user/:userId - 특정 사용자의 게시글
	.get(
		"/user/:userId",
		async ({ params, query }) => {
			const result = await postService.findByUserId(params.userId, {
				cursor: query.cursor,
				limit: query.limit ? Number.parseInt(query.limit, 10) : 20,
			});

			return {
				items: result.items.map((post) => ({
					id: post.id,
					content: post.content,
					createdAt: post.createdAt.toISOString(),
					user: post.user,
					images: post.images,
					replyCount: post._count.comments,
					likeCount: post._count.likes,
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
			}),
			response: PaginatedPostsSchema,
			detail: {
				tags: ["Posts"],
				summary: "특정 사용자의 게시글 조회",
				description: "특정 사용자가 작성한 게시글 목록을 조회합니다.",
			},
		},
	);

/**
 * Protected Post Routes (인증 필수)
 */
export const postRoutes = new Elysia({ prefix: "/posts" })
	.use(authGuard)
	// POST /api/posts - 게시글 작성
	.post(
		"/",
		async ({ auth, body, set }) => {
			// Prisma User 가져오기/생성
			const user = await userService.findOrCreate(
				auth.user.id,
				auth.user.email,
				auth.user.user_metadata?.full_name,
				auth.user.user_metadata?.avatar_url,
			);

			const post = await postService.create({
				content: body.content,
				userId: user.id,
				category: body.category,
				imageUrls: body.imageUrls,
			});

			set.status = 201;
			return {
				id: post.id,
				content: post.content,
				createdAt: post.createdAt.toISOString(),
				user: post.user,
				images: post.images,
			};
		},
		{
			body: t.Object({
				content: t.String({ minLength: 1 }),
				category: t.Optional(t.Union([t.Literal("free"), t.Literal("boast"), t.Literal("info")])),
				imageUrls: t.Optional(t.Array(t.String())),
			}),
			response: t.Object({
				id: t.String(),
				content: t.String(),
				createdAt: t.String(),
				user: UserSchema,
				images: t.Array(ImageSchema),
			}),
			detail: {
				tags: ["Posts"],
				summary: "게시글 작성",
				description: "새 게시글을 작성합니다.",
			},
		},
	)
	// PUT /api/posts/:id - 게시글 수정
	.put(
		"/:id",
		async ({ auth, params, body, set }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				set.status = 401;
				return { error: "User not found" };
			}

			const isOwner = await postService.isOwner(params.id, user.id);
			if (!isOwner) {
				set.status = 403;
				return { error: "Forbidden" };
			}

			const post = await postService.update(params.id, {
				content: body.content,
			});

			return {
				id: post.id,
				content: post.content,
				updatedAt: post.updatedAt.toISOString(),
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				content: t.String({ minLength: 1 }),
			}),
			response: t.Union([
				t.Object({
					id: t.String(),
					content: t.String(),
					updatedAt: t.String(),
				}),
				ErrorSchema,
			]),
			detail: {
				tags: ["Posts"],
				summary: "게시글 수정",
				description: "게시글 내용을 수정합니다.",
			},
		},
	)
	// DELETE /api/posts/:id - 게시글 삭제
	.delete(
		"/:id",
		async ({ auth, params, set }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				set.status = 401;
				return { error: "User not found" };
			}

			const isOwner = await postService.isOwner(params.id, user.id);
			if (!isOwner) {
				set.status = 403;
				return { error: "Forbidden" };
			}

			await postService.delete(params.id);

			return { message: "Post deleted successfully" };
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: t.Union([
				t.Object({ message: t.String() }),
				ErrorSchema,
			]),
			detail: {
				tags: ["Posts"],
				summary: "게시글 삭제",
				description: "게시글을 삭제합니다.",
			},
		},
	)
	// POST /api/posts/:id/comments - 댓글/대댓글 작성
	.post(
		"/:id/comments",
		async ({ auth, params, body, set }) => {
			const user = await userService.findOrCreate(
				auth.user.id,
				auth.user.email,
				auth.user.user_metadata?.full_name,
				auth.user.user_metadata?.avatar_url,
			);

			// Post 존재 확인
			const post = await postService.findById(params.id);
			if (!post) {
				set.status = 404;
				return { error: "Post not found" };
			}

			try {
				const comment = await commentService.create({
					content: body.content,
					postId: params.id,
					userId: user.id,
					parentId: body.parentId,
				});

				set.status = 201;
				return {
					id: comment.id,
					content: comment.content,
					createdAt: comment.createdAt.toISOString(),
					user: comment.user,
					parentId: body.parentId ?? null,
				};
			} catch (error) {
				set.status = 400;
				return {
					error:
						error instanceof Error ? error.message : "Failed to create comment",
				};
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				content: t.String({ minLength: 1 }),
				parentId: t.Optional(t.String()), // 대댓글인 경우 부모 댓글 ID
			}),
			response: t.Union([
				t.Object({
					id: t.String(),
					content: t.String(),
					createdAt: t.String(),
					user: UserSchema,
					parentId: t.Nullable(t.String()),
				}),
				ErrorSchema,
			]),
			detail: {
				tags: ["Comments"],
				summary: "댓글/대댓글 작성",
				description:
					"게시글에 댓글을 작성합니다. parentId를 포함하면 대댓글로 작성됩니다.",
			},
		},
	)
	// PUT /api/posts/:id/comments/:commentId - 댓글 수정
	.put(
		"/:id/comments/:commentId",
		async ({ auth, params, body, set }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				set.status = 401;
				return { error: "User not found" };
			}

			const isOwner = await commentService.isOwner(params.commentId, user.id);
			if (!isOwner) {
				set.status = 403;
				return { error: "Forbidden" };
			}

			const comment = await commentService.update(
				params.commentId,
				body.content,
			);

			return {
				id: comment.id,
				content: comment.content,
				updatedAt: comment.updatedAt.toISOString(),
			};
		},
		{
			params: t.Object({
				id: t.String(),
				commentId: t.String(),
			}),
			body: t.Object({
				content: t.String({ minLength: 1 }),
			}),
			response: t.Union([
				t.Object({
					id: t.String(),
					content: t.String(),
					updatedAt: t.String(),
				}),
				ErrorSchema,
			]),
			detail: {
				tags: ["Comments"],
				summary: "댓글 수정",
				description: "댓글 내용을 수정합니다.",
			},
		},
	)
	// DELETE /api/posts/:id/comments/:commentId - 댓글 삭제
	.delete(
		"/:id/comments/:commentId",
		async ({ auth, params, set }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				set.status = 401;
				return { error: "User not found" };
			}

			const isOwner = await commentService.isOwner(params.commentId, user.id);
			if (!isOwner) {
				set.status = 403;
				return { error: "Forbidden" };
			}

			try {
				await commentService.delete(params.commentId);
				return { message: "Comment deleted successfully" };
			} catch (error) {
				set.status = 400;
				return {
					error:
						error instanceof Error ? error.message : "Failed to delete comment",
				};
			}
		},
		{
			params: t.Object({
				id: t.String(),
				commentId: t.String(),
			}),
			response: t.Union([t.Object({ message: t.String() }), ErrorSchema]),
			detail: {
				tags: ["Comments"],
				summary: "댓글 삭제",
				description:
					"댓글을 삭제합니다. 대댓글이 있는 경우 '삭제된 댓글입니다'로 표시됩니다.",
			},
		},
	)
	// POST /api/posts/:id/images - 이미지 추가
	.post(
		"/:id/images",
		async ({ auth, params, body, set }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				set.status = 401;
				return { error: "User not found" };
			}

			const isOwner = await postService.isOwner(params.id, user.id);
			if (!isOwner) {
				set.status = 403;
				return { error: "Forbidden" };
			}

			const images = await postImageService.addImages(
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
			response: t.Union([
				t.Object({ images: t.Array(ImageSchema) }),
				ErrorSchema,
			]),
			detail: {
				tags: ["Posts"],
				summary: "게시글 이미지 추가",
				description: "게시글에 이미지를 추가합니다.",
			},
		},
	)
	// DELETE /api/posts/:id/images/:imageId - 이미지 삭제
	.delete(
		"/:id/images/:imageId",
		async ({ auth, params, set }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				set.status = 401;
				return { error: "User not found" };
			}

			const isOwner = await postService.isOwner(params.id, user.id);
			if (!isOwner) {
				set.status = 403;
				return { error: "Forbidden" };
			}

			await postImageService.deleteImage(params.imageId);

			return { message: "Image deleted successfully" };
		},
		{
			params: t.Object({
				id: t.String(),
				imageId: t.String(),
			}),
			response: t.Union([
				t.Object({ message: t.String() }),
				ErrorSchema,
			]),
			detail: {
				tags: ["Posts"],
				summary: "게시글 이미지 삭제",
				description: "게시글에서 이미지를 삭제합니다.",
			},
		},
	);
