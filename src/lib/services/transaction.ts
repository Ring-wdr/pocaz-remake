import { prisma } from "@/lib/prisma";

/**
 * Transaction 상태
 */
export type TransactionStatus = "pending" | "completed" | "cancelled";

/**
 * Transaction 타입
 */
export type TransactionType = "purchase" | "sale";

/**
 * Transaction 생성 DTO
 */
export interface CreateTransactionDto {
	buyerId: string;
	sellerId: string;
	marketId: string;
	price: number;
}

/**
 * User 정보 타입
 */
export interface UserInfo {
	id: string;
	nickname: string;
	profileImage: string | null;
}

/**
 * 구매 내역 타입
 */
export interface PurchaseItem {
	id: string;
	title: string;
	price: number;
	seller: UserInfo;
	date: Date;
	image: string | null;
	marketId: string;
}

/**
 * 판매 내역 타입
 */
export interface SaleItem {
	id: string;
	title: string;
	price: number | null;
	status: string;
	date: Date;
	image: string | null;
}

/**
 * 거래 내역 타입
 */
export interface TradeItem {
	id: string;
	title: string;
	price: number;
	type: "buy" | "sell";
	partner: UserInfo;
	date: Date;
	image: string | null;
	marketId: string;
}

/**
 * Transaction Service
 */
export const transactionService = {
	/**
	 * 거래 생성
	 */
	async create(dto: CreateTransactionDto) {
		return prisma.transaction.create({
			data: {
				type: "purchase",
				buyerId: dto.buyerId,
				sellerId: dto.sellerId,
				marketId: dto.marketId,
				price: dto.price,
				status: "completed",
			},
			include: {
				buyer: {
					select: {
						id: true,
						nickname: true,
						profileImage: true,
					},
				},
				seller: {
					select: {
						id: true,
						nickname: true,
						profileImage: true,
					},
				},
				market: {
					include: {
						images: true,
					},
				},
			},
		});
	},

	/**
	 * 구매 내역 조회 (내가 구매한 것)
	 */
	async getPurchases(userId: string): Promise<PurchaseItem[]> {
		const transactions = await prisma.transaction.findMany({
			where: {
				buyerId: userId,
				status: "completed",
			},
			include: {
				seller: {
					select: {
						id: true,
						nickname: true,
						profileImage: true,
					},
				},
				market: {
					include: {
						images: true,
					},
				},
			},
			orderBy: { completedAt: "desc" },
		});

		return transactions.map((tx) => ({
			id: tx.id,
			title: tx.market.title,
			price: tx.price,
			seller: tx.seller,
			date: tx.completedAt,
			image: tx.market.images[0]?.imageUrl ?? null,
			marketId: tx.marketId,
		}));
	},

	/**
	 * 판매 내역 조회 (내가 판매한 것)
	 */
	async getSales(userId: string, status?: string): Promise<SaleItem[]> {
		const markets = await prisma.market.findMany({
			where: {
				userId,
				...(status && status !== "all" && { status }),
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
			orderBy: { createdAt: "desc" },
		});

		return markets.map((market) => ({
			id: market.id,
			title: market.title,
			price: market.price,
			status: market.status,
			date: market.createdAt,
			image: market.images[0]?.imageUrl ?? null,
		}));
	},

	/**
	 * 거래 내역 조회 (구매 + 판매)
	 */
	async getTrades(userId: string): Promise<TradeItem[]> {
		const transactions = await prisma.transaction.findMany({
			where: {
				OR: [{ buyerId: userId }, { sellerId: userId }],
				status: "completed",
			},
			include: {
				buyer: {
					select: {
						id: true,
						nickname: true,
						profileImage: true,
					},
				},
				seller: {
					select: {
						id: true,
						nickname: true,
						profileImage: true,
					},
				},
				market: {
					include: {
						images: true,
					},
				},
			},
			orderBy: { completedAt: "desc" },
		});

		return transactions.map((tx) => ({
			id: tx.id,
			title: tx.market.title,
			price: tx.price,
			type: tx.buyerId === userId ? "buy" : "sell",
			partner: tx.buyerId === userId ? tx.seller : tx.buyer,
			date: tx.completedAt,
			image: tx.market.images[0]?.imageUrl ?? null,
			marketId: tx.marketId,
		}));
	},

	/**
	 * 거래 상세 조회
	 */
	async findById(id: string) {
		return prisma.transaction.findUnique({
			where: { id },
			include: {
				buyer: {
					select: {
						id: true,
						nickname: true,
						profileImage: true,
					},
				},
				seller: {
					select: {
						id: true,
						nickname: true,
						profileImage: true,
					},
				},
				market: {
					include: {
						images: true,
					},
				},
			},
		});
	},
};
