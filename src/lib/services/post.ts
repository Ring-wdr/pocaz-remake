import { prisma } from "@/lib/prisma";

/**
 * Post 카테고리 타입
 */
export type PostCategory = "free" | "boast" | "info";

/**
 * Post 생성 DTO
 */
export interface CreatePostDto {
	content: string;
	userId: string;
	category?: PostCategory;
	imageUrls?: string[];
}

/**
 * Post 수정 DTO
 */
export interface UpdatePostDto {
	content?: string;
}

/**
 * Comment 생성 DTO
 */
export interface CreateCommentDto {
	content: string;
	postId: string;
	userId: string;
	parentId?: string; // 대댓글인 경우 부모 댓글 ID
}

/**
 * 페이지네이션 옵션
 */
export interface PaginationOptions {
	cursor?: string;
	limit?: number;
	category?: PostCategory;
}

/**
 * Post Service
 */
export const postService = {
	/**
	 * Post 목록 조회 (커서 기반 페이지네이션)
	 */
	async findAll(options: PaginationOptions = {}) {
		const { cursor, limit = 20, category } = options;

		const posts = await prisma.post.findMany({
			where: category ? { category } : undefined,
			take: limit + 1, // 다음 페이지 존재 여부 확인용
			...(cursor && {
				cursor: { id: cursor },
				skip: 1,
			}),
			orderBy: { createdAt: "desc" },
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
		});

		const hasMore = posts.length > limit;
		const items = hasMore ? posts.slice(0, -1) : posts;
		const nextCursor = hasMore ? items[items.length - 1]?.id : null;

		return {
			items,
			nextCursor,
			hasMore,
		};
	},

	/**
	 * 특정 사용자의 Post 목록 조회
	 */
	async findByUserId(userId: string, options: PaginationOptions = {}) {
		const { cursor, limit = 20 } = options;

		const posts = await prisma.post.findMany({
			where: { userId },
			take: limit + 1,
			...(cursor && {
				cursor: { id: cursor },
				skip: 1,
			}),
			orderBy: { createdAt: "desc" },
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
		});

		const hasMore = posts.length > limit;
		const items = hasMore ? posts.slice(0, -1) : posts;
		const nextCursor = hasMore ? items[items.length - 1]?.id : null;

		return {
			items,
			nextCursor,
			hasMore,
		};
	},

	/**
	 * Post 상세 조회 (댓글 제외 - 별도 API로 분리)
	 */
	async findById(id: string) {
		return prisma.post.findUnique({
			where: { id },
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
		});
	},

	/**
	 * Post 생성
	 */
	async create(dto: CreatePostDto) {
		return prisma.post.create({
			data: {
				content: dto.content,
				userId: dto.userId,
				category: dto.category ?? "free",
				...(dto.imageUrls &&
					dto.imageUrls.length > 0 && {
						images: {
							create: dto.imageUrls.map((url) => ({ imageUrl: url })),
						},
					}),
			},
			include: {
				user: {
					select: {
						id: true,
						nickname: true,
						profileImage: true,
					},
				},
				images: true,
			},
		});
	},

	/**
	 * Post 수정
	 */
	async update(id: string, dto: UpdatePostDto) {
		return prisma.post.update({
			where: { id },
			data: {
				content: dto.content,
			},
			include: {
				user: {
					select: {
						id: true,
						nickname: true,
						profileImage: true,
					},
				},
				images: true,
			},
		});
	},

	/**
	 * Post 삭제
	 */
	async delete(id: string) {
		await prisma.post.delete({
			where: { id },
		});
	},

	/**
	 * Post 소유자 확인
	 */
	async isOwner(postId: string, userId: string) {
		const post = await prisma.post.findUnique({
			where: { id: postId },
			select: { userId: true },
		});
		return post?.userId === userId;
	},

	/**
	 * 검색
	 */
	async search(keyword: string, options: PaginationOptions = {}) {
		const { cursor, limit = 20 } = options;

		const posts = await prisma.post.findMany({
			where: {
				content: {
					contains: keyword,
					mode: "insensitive",
				},
			},
			take: limit + 1,
			...(cursor && {
				cursor: { id: cursor },
				skip: 1,
			}),
			orderBy: { createdAt: "desc" },
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
		});

		const hasMore = posts.length > limit;
		const items = hasMore ? posts.slice(0, -1) : posts;
		const nextCursor = hasMore ? items[items.length - 1]?.id : null;

		return {
			items,
			nextCursor,
			hasMore,
		};
	},
};

/**
 * Comment Service - 댓글/대댓글 관리
 */
export const commentService = {
	/**
	 * 댓글 목록 조회 (최상위 댓글 + 대댓글 포함, 커서 기반 페이지네이션)
	 */
	async findByPostId(postId: string, options: PaginationOptions = {}) {
		const { cursor, limit = 20 } = options;

		// 최상위 댓글만 조회 (parentId가 null인 것)
		const comments = await prisma.comment.findMany({
			where: {
				postId,
				parentId: null, // 최상위 댓글만
			},
			take: limit + 1,
			...(cursor && {
				cursor: { id: cursor },
				skip: 1,
			}),
			orderBy: { createdAt: "asc" },
			include: {
				user: {
					select: {
						id: true,
						nickname: true,
						profileImage: true,
					},
				},
				// 대댓글 포함 (1 depth만)
				replies: {
					where: { deletedAt: null },
					orderBy: { createdAt: "asc" },
					include: {
						user: {
							select: {
								id: true,
								nickname: true,
								profileImage: true,
							},
						},
					},
				},
				_count: {
					select: {
						replies: true,
					},
				},
			},
		});

		const hasMore = comments.length > limit;
		const items = hasMore ? comments.slice(0, -1) : comments;
		const nextCursor = hasMore ? items[items.length - 1]?.id : null;

		return {
			items,
			nextCursor,
			hasMore,
		};
	},

	/**
	 * 전체 댓글 수 조회 (대댓글 포함)
	 */
	async countByPostId(postId: string) {
		return prisma.comment.count({
			where: {
				postId,
				deletedAt: null,
			},
		});
	},

	/**
	 * 댓글 생성 (대댓글인 경우 parentId 포함)
	 */
	async create(dto: CreateCommentDto) {
		// 대댓글인 경우 부모 댓글이 같은 게시글에 속하는지 확인
		if (dto.parentId) {
			const parent = await prisma.comment.findUnique({
				where: { id: dto.parentId },
				select: { postId: true, parentId: true },
			});
			if (!parent || parent.postId !== dto.postId) {
				throw new Error("Invalid parent comment");
			}
			// 대댓글에 또 대댓글을 달 수 없음 (1 depth 제한)
			if (parent.parentId !== null) {
				throw new Error("Cannot reply to a reply");
			}
		}

		return prisma.comment.create({
			data: {
				content: dto.content,
				postId: dto.postId,
				userId: dto.userId,
				parentId: dto.parentId,
			},
			include: {
				user: {
					select: {
						id: true,
						nickname: true,
						profileImage: true,
					},
				},
			},
		});
	},

	/**
	 * 댓글 수정
	 */
	async update(id: string, content: string) {
		return prisma.comment.update({
			where: { id },
			data: { content },
			include: {
				user: {
					select: {
						id: true,
						nickname: true,
						profileImage: true,
					},
				},
			},
		});
	},

	/**
	 * 댓글 삭제 (soft delete - 대댓글이 있으면 "삭제된 댓글입니다" 표시용)
	 */
	async delete(id: string) {
		const comment = await prisma.comment.findUnique({
			where: { id },
			include: {
				_count: { select: { replies: true } },
			},
		});

		if (!comment) {
			throw new Error("Comment not found");
		}

		// 대댓글이 있으면 soft delete, 없으면 hard delete
		if (comment._count.replies > 0) {
			await prisma.comment.update({
				where: { id },
				data: { deletedAt: new Date() },
			});
		} else {
			await prisma.comment.delete({
				where: { id },
			});
		}
	},

	/**
	 * 댓글 소유자 확인
	 */
	async isOwner(commentId: string, userId: string) {
		const comment = await prisma.comment.findUnique({
			where: { id: commentId },
			select: { userId: true },
		});
		return comment?.userId === userId;
	},

	/**
	 * 댓글 조회
	 */
	async findById(id: string) {
		return prisma.comment.findUnique({
			where: { id },
			include: {
				user: {
					select: {
						id: true,
						nickname: true,
						profileImage: true,
					},
				},
			},
		});
	},
};

/**
 * PostImage Service
 */
export const postImageService = {
	/**
	 * 이미지 추가
	 */
	async addImages(postId: string, imageUrls: string[]) {
		await prisma.postImage.createMany({
			data: imageUrls.map((url) => ({
				postId,
				imageUrl: url,
			})),
		});

		return prisma.postImage.findMany({
			where: { postId },
			orderBy: { createdAt: "asc" },
		});
	},

	/**
	 * 이미지 삭제
	 */
	async deleteImage(id: string) {
		await prisma.postImage.delete({
			where: { id },
		});
	},

	/**
	 * Post의 모든 이미지 조회
	 */
	async findByPostId(postId: string) {
		return prisma.postImage.findMany({
			where: { postId },
			orderBy: { createdAt: "asc" },
		});
	},
};
