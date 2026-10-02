import { prisma } from "@/lib/prisma";
import { activityService } from "@/lib/services/activity";

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
 * 거래 완료 DTO
 */
export interface CompleteTradeDto {
	marketId: string;
	/** 완료를 요청한 사용자. 상품 주인이어야 한다 */
	sellerId: string;
	buyerId: string;
	/** 생략하면 상품 가격(가격이 없으면 0) */
	price?: number;
}

/**
 * 요청 내용 때문에 거래를 완료할 수 없을 때. 라우트가 status와 메시지만 응답에 그대로 내보낸다.
 */
export class TradeError extends Error {
	status: 400 | 403 | 404 | 409;
	/** 409일 때 이미 완료된 거래의 id */
	transactionId?: string;

	constructor(
		status: 400 | 403 | 404 | 409,
		message: string,
		transactionId?: string,
	) {
		super(message);
		this.status = status;
		this.transactionId = transactionId;
	}
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
	/** 내가 이 거래의 후기를 이미 남겼는지 */
	reviewed: boolean;
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
	/** 내가 이 거래의 후기를 이미 남겼는지 */
	reviewed: boolean;
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
	 * 거래 완료. 구매자를 정해 거래를 남기고 상품을 판매완료로 바꾸며, 양쪽에 활동 기록을 남긴다.
	 * 검사 순서: 상품 없음 404, 판매자 아님 403, 본인 400, 구매자 없음·탈퇴 400,
	 * 이 상품의 채팅방 멤버 아님 400, 이미 완료된 거래 409(기존 거래 id 포함).
	 */
	async completeTrade(dto: CompleteTradeDto) {
		const { marketId, sellerId, buyerId } = dto;

		return prisma.$transaction(async (tx) => {
			// DB에 상품당 완료 거래 하나라는 제약이 없어서, 같은 상품의 완료 요청끼리는 advisory lock으로 차례를 정한다.
			// 잠금은 트랜잭션이 끝날 때 풀리므로, 아래 확인과 기록을 같은 트랜잭션에서 한다.
			const lockKey = `complete-trade:${marketId}`;
			await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;

			const market = await tx.market.findUnique({
				where: { id: marketId },
				select: { userId: true, title: true, price: true },
			});
			if (!market) {
				throw new TradeError(404, "Market not found");
			}
			if (market.userId !== sellerId) {
				throw new TradeError(403, "Forbidden");
			}
			if (buyerId === sellerId) {
				throw new TradeError(400, "Cannot complete a trade with yourself");
			}

			const buyer = await tx.user.findUnique({
				where: { id: buyerId, deletedAt: null },
				select: { id: true },
			});
			if (!buyer) {
				throw new TradeError(400, "Buyer not found");
			}

			// 엉뚱한 사용자에게 구매 내역이 생기지 않도록, 이 상품으로 대화한 사람만 구매자가 될 수 있다
			const room = await tx.chatRoom.findFirst({
				where: { marketId, members: { some: { userId: buyerId } } },
				select: { id: true },
			});
			if (!room) {
				throw new TradeError(
					400,
					"Buyer is not a member of a chat room for this market",
				);
			}

			const completed = await tx.transaction.findFirst({
				where: { marketId, status: "completed" },
				select: { id: true },
			});
			if (completed) {
				throw new TradeError(409, "Trade already completed", completed.id);
			}

			const transaction = await tx.transaction.create({
				data: {
					type: "purchase",
					status: "completed",
					price: dto.price ?? market.price ?? 0,
					buyerId,
					sellerId,
					marketId,
				},
			});
			await tx.market.update({
				where: { id: marketId },
				data: { status: "sold" },
			});
			await activityService.create(
				{
					userId: sellerId,
					type: "trade",
					description: `"${market.title}" 판매 완료`,
					targetId: transaction.id,
					targetType: "transaction",
				},
				tx,
			);
			await activityService.create(
				{
					userId: buyerId,
					type: "trade",
					description: `"${market.title}" 구매 완료`,
					targetId: transaction.id,
					targetType: "transaction",
				},
				tx,
			);

			return transaction;
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
				// 내가 쓴 후기. (거래, 작성자)가 유일해서 최대 한 건이다
				reviews: {
					where: { reviewerId: userId },
					select: { id: true },
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
			reviewed: tx.reviews.length > 0,
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
				// 내가 쓴 후기. (거래, 작성자)가 유일해서 최대 한 건이다
				reviews: {
					where: { reviewerId: userId },
					select: { id: true },
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
			reviewed: tx.reviews.length > 0,
		}));
	},

	/**
	 * 완료된 거래 수 (구매 + 판매)
	 */
	async countCompleted(userId: string) {
		return prisma.transaction.count({
			where: {
				OR: [{ buyerId: userId }, { sellerId: userId }],
				status: "completed",
			},
		});
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
