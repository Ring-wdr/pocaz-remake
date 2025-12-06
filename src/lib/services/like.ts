import { prisma } from "@/lib/prisma";
import type { Like } from "@/generated/prisma/client";

/**
 * Like Service
 */
export const likeService = {
	/**
	 * 좋아요 토글 (있으면 삭제, 없으면 생성)
	 */
	async toggle(userId: string, postId: string): Promise<{ liked: boolean }> {
		const existing = await prisma.like.findUnique({
			where: {
				userId_postId: {
					userId,
					postId,
				},
			},
		});

		if (existing) {
			await prisma.like.delete({
				where: { id: existing.id },
			});
			return { liked: false };
		}

		await prisma.like.create({
			data: {
				userId,
				postId,
			},
		});
		return { liked: true };
	},

	/**
	 * 좋아요 여부 확인
	 */
	async isLiked(userId: string, postId: string): Promise<boolean> {
		const like = await prisma.like.findUnique({
			where: {
				userId_postId: {
					userId,
					postId,
				},
			},
		});
		return !!like;
	},

	/**
	 * Post의 좋아요 수 조회
	 */
	async getCount(postId: string): Promise<number> {
		return prisma.like.count({
			where: { postId },
		});
	},

	/**
	 * Post에 좋아요한 사용자 목록
	 */
	async getLikedUsers(postId: string) {
		const likes = await prisma.like.findMany({
			where: { postId },
			include: {
				user: {
					select: {
						id: true,
						nickname: true,
						profileImage: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});

		return likes.map((like) => like.user);
	},

	/**
	 * 사용자가 좋아요한 Post 목록 (페이지네이션 및 정렬 지원)
	 */
	async getLikedPosts(
		userId: string,
		options?: { cursor?: string; limit?: number; sort?: "likedAt" | "popular" | "recent" },
	) {
		const limit = options?.limit ?? 20;
		const cursor = options?.cursor;
		const sort = options?.sort ?? "likedAt";

		// popular 정렬은 Like 테이블이 아닌 Post 테이블 기준으로 정렬해야 함
		if (sort === "popular") {
			// 인기순: 좋아요 수 기준 정렬 (cursor 기반 페이지네이션은 offset으로 대체)
			const offset = cursor ? Number.parseInt(cursor, 10) : 0;

			const likes = await prisma.like.findMany({
				where: { userId },
				include: {
					post: {
						include: {
							user: {
								select: {
									id: true,
									nickname: true,
									profileImage: true,
								},
							},
							images: true,
							_count: {
								select: {
									comments: true,
									likes: true,
								},
							},
						},
					},
				},
				skip: offset,
				take: limit + 1,
			});

			// 좋아요 수 기준으로 정렬
			const sortedLikes = likes.sort(
				(a, b) => b.post._count.likes - a.post._count.likes,
			);

			const hasMore = sortedLikes.length > limit;
			const items = hasMore ? sortedLikes.slice(0, limit) : sortedLikes;
			const nextCursor = hasMore ? String(offset + limit) : null;

			return {
				items: items.map((like) => ({
					id: like.post.id,
					content: like.post.content,
					createdAt: like.post.createdAt,
					user: like.post.user,
					images: like.post.images,
					replyCount: like.post._count.comments,
					likeCount: like.post._count.likes,
					likedAt: like.createdAt,
				})),
				nextCursor,
				hasMore,
			};
		}

		// recent 정렬: 게시글 작성일 기준
		if (sort === "recent") {
			const likes = await prisma.like.findMany({
				where: { userId },
				include: {
					post: {
						include: {
							user: {
								select: {
									id: true,
									nickname: true,
									profileImage: true,
								},
							},
							images: true,
							_count: {
								select: {
									comments: true,
									likes: true,
								},
							},
						},
					},
				},
				orderBy: { post: { createdAt: "desc" } },
				take: limit + 1,
				...(cursor && {
					cursor: { id: cursor },
					skip: 1,
				}),
			});

			const hasMore = likes.length > limit;
			const items = hasMore ? likes.slice(0, limit) : likes;
			const nextCursor = hasMore ? items[items.length - 1]?.id : null;

			return {
				items: items.map((like) => ({
					id: like.post.id,
					content: like.post.content,
					createdAt: like.post.createdAt,
					user: like.post.user,
					images: like.post.images,
					replyCount: like.post._count.comments,
					likeCount: like.post._count.likes,
					likedAt: like.createdAt,
				})),
				nextCursor,
				hasMore,
			};
		}

		// likedAt 정렬 (기본값): 좋아요한 날짜 기준
		const likes = await prisma.like.findMany({
			where: { userId },
			include: {
				post: {
					include: {
						user: {
							select: {
								id: true,
								nickname: true,
								profileImage: true,
							},
						},
						images: true,
						_count: {
							select: {
								comments: true,
								likes: true,
							},
						},
					},
				},
			},
			orderBy: { createdAt: "desc" },
			take: limit + 1,
			...(cursor && {
				cursor: { id: cursor },
				skip: 1,
			}),
		});

		const hasMore = likes.length > limit;
		const items = hasMore ? likes.slice(0, limit) : likes;
		const nextCursor = hasMore ? items[items.length - 1]?.id : null;

		return {
			items: items.map((like) => ({
				id: like.post.id,
				content: like.post.content,
				createdAt: like.post.createdAt,
				user: like.post.user,
				images: like.post.images,
				replyCount: like.post._count.comments,
				likeCount: like.post._count.likes,
				likedAt: like.createdAt,
			})),
			nextCursor,
			hasMore,
		};
	},

	/**
	 * 여러 Post의 좋아요 여부 확인 (batch)
	 */
	async checkLikedPosts(userId: string, postIds: string[]): Promise<Record<string, boolean>> {
		const likes = await prisma.like.findMany({
			where: {
				userId,
				postId: { in: postIds },
			},
			select: { postId: true },
		});

		const likedPostIds = new Set(likes.map((like) => like.postId));

		return postIds.reduce(
			(acc, postId) => {
				acc[postId] = likedPostIds.has(postId);
				return acc;
			},
			{} as Record<string, boolean>,
		);
	},
};
