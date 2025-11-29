import { prisma } from "@/lib/prisma";

/**
 * Post 생성 DTO
 */
export interface CreatePostDto {
	content: string;
	userId: string;
	imageUrls?: string[];
}

/**
 * Post 수정 DTO
 */
export interface UpdatePostDto {
	content?: string;
}

/**
 * Reply 생성 DTO
 */
export interface CreateReplyDto {
	content: string;
	postId: string;
	userId: string;
}

/**
 * 페이지네이션 옵션
 */
export interface PaginationOptions {
	cursor?: string;
	limit?: number;
}

/**
 * Post Service
 */
export const postService = {
	/**
	 * Post 목록 조회 (커서 기반 페이지네이션)
	 */
	async findAll(options: PaginationOptions = {}) {
		const { cursor, limit = 20 } = options;

		const posts = await prisma.post.findMany({
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
						replies: true,
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
						replies: true,
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
	 * Post 상세 조회
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
				replies: {
					include: {
						user: {
							select: {
								id: true,
								nickname: true,
								profileImage: true,
							},
						},
					},
					orderBy: { createdAt: "asc" },
				},
				_count: {
					select: {
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
						replies: true,
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
 * Reply Service
 */
export const replyService = {
	/**
	 * Reply 생성
	 */
	async create(dto: CreateReplyDto) {
		return prisma.reply.create({
			data: {
				content: dto.content,
				postId: dto.postId,
				userId: dto.userId,
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
	 * Reply 수정
	 */
	async update(id: string, content: string) {
		return prisma.reply.update({
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
	 * Reply 삭제
	 */
	async delete(id: string) {
		await prisma.reply.delete({
			where: { id },
		});
	},

	/**
	 * Reply 소유자 확인
	 */
	async isOwner(replyId: string, userId: string) {
		const reply = await prisma.reply.findUnique({
			where: { id: replyId },
			select: { userId: true },
		});
		return reply?.userId === userId;
	},

	/**
	 * Reply 조회
	 */
	async findById(id: string) {
		return prisma.reply.findUnique({
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
