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
	 * 사용자가 좋아요한 Post 목록
	 */
	async getLikedPosts(userId: string) {
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
		});

		return likes.map((like) => ({
			id: like.post.id,
			content: like.post.content,
			createdAt: like.post.createdAt,
			user: like.post.user,
			images: like.post.images,
			replyCount: like.post._count.comments,
			likeCount: like.post._count.likes,
			likedAt: like.createdAt,
		}));
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
