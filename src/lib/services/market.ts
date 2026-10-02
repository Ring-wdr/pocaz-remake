import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Market 상태
 */
export type MarketStatus = "available" | "sold" | "reserved";

/**
 * 상품 상태. 등록 폼의 선택지 id와 같다 (src/types/entities의 MarketCondition과 같은 값)
 */
const MARKET_CONDITIONS = ["new", "like-new", "good", "used"] as const;
export type MarketCondition = (typeof MARKET_CONDITIONS)[number];

/**
 * DB의 condition 문자열을 응답에 쓸 값으로 좁힌다. 비어 있거나 모르는 값이면 null
 */
export function toMarketCondition(
	value: string | null,
): MarketCondition | null {
	return MARKET_CONDITIONS.find((condition) => condition === value) ?? null;
}

export type MarketSort = "latest" | "priceAsc" | "priceDesc";

function buildOrderBy(sort: MarketSort | undefined) {
	switch (sort) {
		case "priceAsc":
			return [{ price: "asc" as const }, { createdAt: "desc" as const }];
		case "priceDesc":
			return [{ price: "desc" as const }, { createdAt: "desc" as const }];
		default:
			return [{ createdAt: "desc" as const }];
	}
}

/**
 * 목록·상세·작성·수정 조회가 함께 쓰는 관계. 판매자는 화면에 필요한 필드만, 그룹·아티스트 태그는 id와 이름만 싣는다
 */
const marketInclude = {
	user: {
		select: {
			id: true,
			nickname: true,
			profileImage: true,
		},
	},
	images: true,
	group: { select: { id: true, name: true } },
	artist: { select: { id: true, name: true } },
} satisfies Prisma.MarketInclude;

/**
 * 요청 내용 때문에 상품을 만들거나 고칠 수 없을 때(400). 이 오류의 메시지만 응답에 그대로 내보낸다.
 */
export class MarketError extends Error {}

/**
 * 상품에 붙일 그룹·멤버 태그를 검사한다. 없는 그룹이나 아티스트이거나, 둘 다 있는데
 * 아티스트가 그 그룹 소속이 아니면 MarketError. null은 태그를 붙이지 않는다는 뜻이라 검사하지 않는다.
 */
async function assertArtistTags(
	groupId: string | null,
	artistId: string | null,
): Promise<void> {
	if (groupId !== null) {
		const group = await prisma.artistGroup.findUnique({
			where: { id: groupId },
			select: { id: true },
		});
		if (!group) throw new MarketError("Group not found");
	}

	if (artistId !== null) {
		const artist = await prisma.artist.findUnique({
			where: { id: artistId },
			select: { groupId: true },
		});
		if (!artist) throw new MarketError("Artist not found");
		if (groupId !== null && artist.groupId !== groupId) {
			throw new MarketError("Artist does not belong to the group");
		}
	}
}

/**
 * Market 생성 DTO
 */
export interface CreateMarketDto {
	title: string;
	description?: string;
	price?: number;
	condition?: MarketCondition;
	isNegotiable?: boolean;
	/** 태그할 그룹. 생략하면 태그하지 않는다 */
	groupId?: string;
	/** 태그할 멤버. groupId와 함께 보내면 그 그룹 소속이어야 한다 */
	artistId?: string;
	userId: string;
	imageUrls?: string[];
}

/**
 * Market 수정 DTO
 */
export interface UpdateMarketDto {
	title?: string;
	description?: string;
	/** null이면 가격을 비운다(가격협의). 생략하면 그대로 둔다 */
	price?: number | null;
	condition?: MarketCondition;
	isNegotiable?: boolean;
	/** null이면 그룹 태그를 푼다. 생략하면 그대로 둔다 */
	groupId?: string | null;
	/** null이면 멤버 태그를 푼다. 생략하면 그대로 둔다 */
	artistId?: string | null;
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
 * 목록 조회 조건. 값이 없는 조건은 적용하지 않는다
 */
export interface MarketFilters extends PaginationOptions {
	/** 이 사용자가 올린 상품만 */
	userId?: string;
	/** 제목, 설명, 그룹 이름, 멤버 이름에 들어 있는 글자 (대소문자 무시) */
	keyword?: string;
	status?: MarketStatus;
	condition?: MarketCondition;
	/** true면 협상 가능한 상품만, false면 협상 불가인 상품만 */
	negotiable?: boolean;
	/** 이 그룹으로 태그한 상품만 */
	groupId?: string;
	/** 이 멤버로 태그한 상품만 */
	artistId?: string;
}

/**
 * Market Service
 */
export const marketService = {
	/**
	 * Market 목록 조회 (커서 기반 페이지네이션). 목록·검색·상태별·사용자별 조회가 모두 이 함수를 쓴다
	 */
	async findMany(filters: MarketFilters = {}) {
		const {
			cursor,
			limit = 20,
			sort,
			userId,
			keyword,
			status,
			condition,
			negotiable,
			groupId,
			artistId,
		} = filters;

		const markets = await prisma.market.findMany({
			where: {
				...(userId !== undefined && { userId }),
				...(keyword && {
					OR: [
						{ title: { contains: keyword, mode: "insensitive" } },
						{ description: { contains: keyword, mode: "insensitive" } },
						{ artist: { name: { contains: keyword, mode: "insensitive" } } },
						{ group: { name: { contains: keyword, mode: "insensitive" } } },
					],
				}),
				...(status && { status }),
				...(condition && { condition }),
				...(negotiable !== undefined && { isNegotiable: negotiable }),
				...(groupId && { groupId }),
				...(artistId && { artistId }),
			},
			take: limit + 1,
			...(cursor && {
				cursor: { id: cursor },
				skip: 1,
			}),
			orderBy: buildOrderBy(sort),
			include: marketInclude,
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
			include: marketInclude,
		});
	},

	/**
	 * Market 생성. 그룹·멤버 태그가 올바르지 않으면 MarketError
	 */
	async create(dto: CreateMarketDto) {
		await assertArtistTags(dto.groupId ?? null, dto.artistId ?? null);

		return prisma.market.create({
			data: {
				title: dto.title,
				description: dto.description,
				price: dto.price,
				condition: dto.condition,
				isNegotiable: dto.isNegotiable,
				groupId: dto.groupId,
				artistId: dto.artistId,
				userId: dto.userId,
				...(dto.imageUrls &&
					dto.imageUrls.length > 0 && {
						images: {
							create: dto.imageUrls.map((url) => ({ imageUrl: url })),
						},
					}),
			},
			include: marketInclude,
		});
	},

	/**
	 * Market 수정. 그룹·멤버 태그가 올바르지 않으면 MarketError.
	 * 둘 중 하나만 바꾸면 나머지는 지금 저장된 값과 짝이 맞는지 본다(그룹만 바꾸고 이전 그룹의 멤버를 남기지 못한다).
	 */
	async update(id: string, dto: UpdateMarketDto) {
		if (dto.groupId !== undefined || dto.artistId !== undefined) {
			const current =
				dto.groupId === undefined || dto.artistId === undefined
					? await prisma.market.findUnique({
							where: { id },
							select: { groupId: true, artistId: true },
						})
					: null;
			await assertArtistTags(
				dto.groupId !== undefined ? dto.groupId : (current?.groupId ?? null),
				dto.artistId !== undefined ? dto.artistId : (current?.artistId ?? null),
			);
		}

		return prisma.market.update({
			where: { id },
			data: {
				title: dto.title,
				description: dto.description,
				price: dto.price,
				condition: dto.condition,
				isNegotiable: dto.isNegotiable,
				groupId: dto.groupId,
				artistId: dto.artistId,
				status: dto.status,
			},
			include: marketInclude,
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
	 * 이 상품으로 남은 거래 기록이 있는지. Transaction.marketId는 Restrict라 거래 기록이 있는 상품은 지울 수 없다
	 */
	async hasTransactions(marketId: string): Promise<boolean> {
		const count = await prisma.transaction.count({ where: { marketId } });
		return count > 0;
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
	 * Market의 현재 판매 상태. 없는 상품이면 null. 상태가 바뀌었는지 알려면 바꾸기 전에 읽어 둔다.
	 */
	async getStatus(marketId: string): Promise<string | null> {
		const market = await prisma.market.findUnique({
			where: { id: marketId },
			select: { status: true },
		});
		return market?.status ?? null;
	},

	/**
	 * 사용자가 올린 상품 중 판매중(available)인 수. 예약중·판매완료는 세지 않는다
	 */
	async countAvailableByUser(userId: string): Promise<number> {
		return prisma.market.count({ where: { userId, status: "available" } });
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
	async checkLikedMarkets(
		userId: string,
		marketIds: string[],
	): Promise<Record<string, boolean>> {
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
	 * 이미지 삭제. 해당 상품의 이미지일 때만 지우고, 지웠는지 돌려준다.
	 */
	async deleteImage(marketId: string, imageId: string) {
		const { count } = await prisma.marketImage.deleteMany({
			where: { id: imageId, marketId },
		});
		return count > 0;
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
