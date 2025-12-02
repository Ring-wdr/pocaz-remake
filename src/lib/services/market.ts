import { prisma } from "@/lib/prisma";

/**
 * Market 상태
 */
export type MarketStatus = "available" | "sold" | "reserved";

export type MarketSort = "latest" | "priceAsc" | "priceDesc";

function buildOrderBy(sort: MarketSort | undefined) {
	switch (sort) {
		case "priceAsc":
			return [
				{ price: "asc" as const },
				{ createdAt: "desc" as const },
			];
		case "priceDesc":
			return [
				{ price: "desc" as const },
				{ createdAt: "desc" as const },
			];
		default:
			return [{ createdAt: "desc" as const }];
	}
}

/**
 * Market 생성 DTO
 */
export interface CreateMarketDto {
	title: string;
	description?: string;
	price?: number;
	userId: string;
	imageUrls?: string[];
}

/**
 * Market 수정 DTO
 */
export interface UpdateMarketDto {
	title?: string;
	description?: string;
	price?: number;
	status?: MarketStatus;
}

/**
 * 페이지네이션 옵션
 */
export interface PaginationOptions {
	cursor?: string;
	limit?: number;
	sort?: MarketSort;
}

/**
 * Market Service
 */
export const marketService = {
	/**
	 * Market 목록 조회 (커서 기반 페이지네이션)
	 */
	async findAll(options: PaginationOptions = {}) {
		const { cursor, limit = 20, sort } = options;

		const markets = await prisma.market.findMany({
			take: limit + 1,
			...(cursor && {
				cursor: { id: cursor },
				skip: 1,
			}),
			orderBy: buildOrderBy(sort),
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

		const hasMore = markets.length > limit;
		const items = hasMore ? markets.slice(0, -1) : markets;
		const nextCursor = hasMore ? items[items.length - 1]?.id : null;

		return {
			items,
			nextCursor,
			hasMore,
		};
	},

	/**
	 * 특정 사용자의 Market 목록 조회
	 */
	async findByUserId(userId: string, options: PaginationOptions = {}) {
		const { cursor, limit = 20, sort } = options;

		const markets = await prisma.market.findMany({
			where: { userId },
			take: limit + 1,
			...(cursor && {
				cursor: { id: cursor },
				skip: 1,
			}),
			orderBy: buildOrderBy(sort),
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

		const hasMore = markets.length > limit;
		const items = hasMore ? markets.slice(0, -1) : markets;
		const nextCursor = hasMore ? items[items.length - 1]?.id : null;

		return {
			items,
			nextCursor,
			hasMore,
		};
	},

	/**
	 * Market 상세 조회
	 */
	async findById(id: string) {
		return prisma.market.findUnique({
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
			},
		});
	},

	/**
	 * Market 생성
	 */
	async create(dto: CreateMarketDto) {
		return prisma.market.create({
			data: {
				title: dto.title,
				description: dto.description,
				price: dto.price,
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
	 * Market 수정
	 */
	async update(id: string, dto: UpdateMarketDto) {
		return prisma.market.update({
			where: { id },
			data: {
				title: dto.title,
				description: dto.description,
				price: dto.price,
				status: dto.status,
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
	 * Market 삭제
	 */
	async delete(id: string): Promise<void> {
		await prisma.market.delete({
			where: { id },
		});
	},

	/**
	 * Market 소유자 확인
	 */
	async isOwner(marketId: string, userId: string): Promise<boolean> {
		const market = await prisma.market.findUnique({
			where: { id: marketId },
			select: { userId: true },
		});
		return market?.userId === userId;
	},

	/**
	 * 검색
	 */
	async search(keyword: string, options: PaginationOptions = {}) {
		const { cursor, limit = 20, sort } = options;

		const markets = await prisma.market.findMany({
			where: {
				OR: [
					{ title: { contains: keyword, mode: "insensitive" } },
					{ description: { contains: keyword, mode: "insensitive" } },
				],
			},
			take: limit + 1,
			...(cursor && {
				cursor: { id: cursor },
				skip: 1,
			}),
			orderBy: buildOrderBy(sort),
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

		const hasMore = markets.length > limit;
		const items = hasMore ? markets.slice(0, -1) : markets;
		const nextCursor = hasMore ? items[items.length - 1]?.id : null;

		return {
			items,
			nextCursor,
			hasMore,
		};
	},

	/**
	 * 상태별 조회
	 */
	async findByStatus(status: MarketStatus, options: PaginationOptions = {}) {
		const { cursor, limit = 20, sort } = options;

		const markets = await prisma.market.findMany({
			where: { status },
			take: limit + 1,
			...(cursor && {
				cursor: { id: cursor },
				skip: 1,
			}),
			orderBy: buildOrderBy(sort),
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

		const hasMore = markets.length > limit;
		const items = hasMore ? markets.slice(0, -1) : markets;
		const nextCursor = hasMore ? items[items.length - 1]?.id : null;

		return {
			items,
			nextCursor,
			hasMore,
		};
	},
};

/**
 * Wishlist 아이템 타입
 */
export interface WishlistItem {
	id: string;
	title: string;
	description: string | null;
	price: number | null;
	status: string;
	createdAt: Date;
	user: {
		id: string;
		nickname: string;
		profileImage: string | null;
	};
	images: {
		id: string;
		imageUrl: string;
	}[];
	likedAt: Date;
}

/**
 * MarketLike Service (찜)
 */
export const marketLikeService = {
	/**
	 * 찜 토글 (있으면 삭제, 없으면 생성)
	 */
	async toggle(userId: string, marketId: string): Promise<{ liked: boolean }> {
		const existing = await prisma.marketLike.findUnique({
			where: {
				userId_marketId: {
					userId,
					marketId,
				},
			},
		});

		if (existing) {
			await prisma.marketLike.delete({
				where: { id: existing.id },
			});
			return { liked: false };
		}

		await prisma.marketLike.create({
			data: {
				userId,
				marketId,
			},
		});
		return { liked: true };
	},

	/**
	 * 찜 여부 확인
	 */
	async isLiked(userId: string, marketId: string): Promise<boolean> {
		const like = await prisma.marketLike.findUnique({
			where: {
				userId_marketId: {
					userId,
					marketId,
				},
			},
		});
		return !!like;
	},

	/**
	 * Market의 찜 수 조회
	 */
	async getCount(marketId: string): Promise<number> {
		return prisma.marketLike.count({
			where: { marketId },
		});
	},

	/**
	 * 사용자가 찜한 Market 목록 (위시리스트)
	 */
	async getWishlist(userId: string): Promise<WishlistItem[]> {
		const likes = await prisma.marketLike.findMany({
			where: { userId },
			include: {
				market: {
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
				},
			},
			orderBy: { createdAt: "desc" },
		});

		return likes.map((like) => ({
			id: like.market.id,
			title: like.market.title,
			description: like.market.description,
			price: like.market.price,
			status: like.market.status,
			createdAt: like.market.createdAt,
			user: like.market.user,
			images: like.market.images,
			likedAt: like.createdAt,
		}));
	},

	/**
	 * 여러 Market의 찜 여부 확인 (batch)
	 */
	async checkLikedMarkets(userId: string, marketIds: string[]): Promise<Record<string, boolean>> {
		const likes = await prisma.marketLike.findMany({
			where: {
				userId,
				marketId: { in: marketIds },
			},
			select: { marketId: true },
		});

		const likedMarketIds = new Set(likes.map((like) => like.marketId));

		return marketIds.reduce(
			(acc, marketId) => {
				acc[marketId] = likedMarketIds.has(marketId);
				return acc;
			},
			{} as Record<string, boolean>,
		);
	},
};

/**
 * MarketImage Service
 */
export const marketImageService = {
	/**
	 * 이미지 추가
	 */
	async addImages(marketId: string, imageUrls: string[]) {
		await prisma.marketImage.createMany({
			data: imageUrls.map((url) => ({
				marketId,
				imageUrl: url,
			})),
		});

		return prisma.marketImage.findMany({
			where: { marketId },
			orderBy: { createdAt: "asc" },
		});
	},

	/**
	 * 이미지 삭제
	 */
	async deleteImage(id: string) {
		await prisma.marketImage.delete({
			where: { id },
		});
	},

	/**
	 * Market의 모든 이미지 조회
	 */
	async findByMarketId(marketId: string) {
		return prisma.marketImage.findMany({
			where: { marketId },
			orderBy: { createdAt: "asc" },
		});
	},
};
