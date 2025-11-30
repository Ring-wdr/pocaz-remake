import { Elysia, t } from "elysia";
import { authGuard } from "@/lib/elysia/auth";
import {
	postService,
	replyService,
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

const ReplySchema = t.Object({
	id: t.String(),
	content: t.String(),
	createdAt: t.String(),
	user: UserSchema,
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
			const result = await postService.findAll({
				cursor: query.cursor,
				limit: query.limit ? Number.parseInt(query.limit) : 20,
			});

			return {
				items: result.items.map((post) => ({
					id: post.id,
					content: post.content,
					createdAt: post.createdAt.toISOString(),
					user: post.user,
					images: post.images,
					replyCount: post._count.replies,
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
			}),
			response: PaginatedPostsSchema,
			detail: {
				tags: ["Posts"],
				summary: "게시글 목록 조회",
				description: "게시글 목록을 페이지네이션하여 조회합니다.",
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
				limit: query.limit ? Number.parseInt(query.limit) : 20,
			});

			return {
				items: result.items.map((post) => ({
					id: post.id,
					content: post.content,
					createdAt: post.createdAt.toISOString(),
					user: post.user,
					images: post.images,
					replyCount: post._count.replies,
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
	// GET /api/posts/:id - 게시글 상세
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
				replies: post.replies.map((reply) => ({
					id: reply.id,
					content: reply.content,
					createdAt: reply.createdAt.toISOString(),
					user: reply.user,
				})),
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
					replies: t.Array(ReplySchema),
					likeCount: t.Number(),
				}),
				ErrorSchema,
			]),
			detail: {
				tags: ["Posts"],
				summary: "게시글 상세 조회",
				description: "게시글의 상세 정보와 댓글을 조회합니다.",
			},
		},
	)
	// GET /api/posts/user/:userId - 특정 사용자의 게시글
	.get(
		"/user/:userId",
		async ({ params, query }) => {
			const result = await postService.findByUserId(params.userId, {
				cursor: query.cursor,
				limit: query.limit ? Number.parseInt(query.limit) : 20,
			});

			return {
				items: result.items.map((post) => ({
					id: post.id,
					content: post.content,
					createdAt: post.createdAt.toISOString(),
					user: post.user,
					images: post.images,
					replyCount: post._count.replies,
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
	// POST /api/posts/:id/replies - 댓글 작성
	.post(
		"/:id/replies",
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

			const reply = await replyService.create({
				content: body.content,
				postId: params.id,
				userId: user.id,
			});

			set.status = 201;
			return {
				id: reply.id,
				content: reply.content,
				createdAt: reply.createdAt.toISOString(),
				user: reply.user,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				content: t.String({ minLength: 1 }),
			}),
			response: t.Union([ReplySchema, ErrorSchema]),
			detail: {
				tags: ["Posts"],
				summary: "댓글 작성",
				description: "게시글에 댓글을 작성합니다.",
			},
		},
	)
	// PUT /api/posts/:id/replies/:replyId - 댓글 수정
	.put(
		"/:id/replies/:replyId",
		async ({ auth, params, body, set }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				set.status = 401;
				return { error: "User not found" };
			}

			const isOwner = await replyService.isOwner(params.replyId, user.id);
			if (!isOwner) {
				set.status = 403;
				return { error: "Forbidden" };
			}

			const reply = await replyService.update(params.replyId, body.content);

			return {
				id: reply.id,
				content: reply.content,
				updatedAt: reply.updatedAt.toISOString(),
			};
		},
		{
			params: t.Object({
				id: t.String(),
				replyId: t.String(),
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
				summary: "댓글 수정",
				description: "댓글 내용을 수정합니다.",
			},
		},
	)
	// DELETE /api/posts/:id/replies/:replyId - 댓글 삭제
	.delete(
		"/:id/replies/:replyId",
		async ({ auth, params, set }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				set.status = 401;
				return { error: "User not found" };
			}

			const isOwner = await replyService.isOwner(params.replyId, user.id);
			if (!isOwner) {
				set.status = 403;
				return { error: "Forbidden" };
			}

			await replyService.delete(params.replyId);

			return { message: "Reply deleted successfully" };
		},
		{
			params: t.Object({
				id: t.String(),
				replyId: t.String(),
			}),
			response: t.Union([
				t.Object({ message: t.String() }),
				ErrorSchema,
			]),
			detail: {
				tags: ["Posts"],
				summary: "댓글 삭제",
				description: "댓글을 삭제합니다.",
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
