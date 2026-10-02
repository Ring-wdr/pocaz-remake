import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * 후기 생성 DTO
 */
export interface CreateReviewDto {
	transactionId: string;
	/** 후기를 쓰는 사용자. 거래의 구매자나 판매자여야 한다 */
	reviewerId: string;
	/** 1~5 */
	rating: number;
	content?: string | null;
}

/**
 * 후기 목록 조회 옵션
 */
export interface ReviewListOptions {
	cursor?: string;
	limit?: number;
}

/**
 * 사용자가 받은 후기 요약
 */
export interface ReviewSummary {
	reviewCount: number;
	/** 소수 첫째 자리까지 반올림한 평균. 받은 후기가 없으면 null */
	averageRating: number | null;
}

/**
 * 요청 내용 때문에 후기를 남길 수 없을 때. 라우트가 status와 메시지만 응답에 그대로 내보낸다.
 */
export class ReviewError extends Error {
	status: 400 | 403 | 404 | 409;

	constructor(status: 400 | 403 | 404 | 409, message: string) {
		super(message);
		this.status = status;
	}
}

/**
 * Review Service
 */
export const reviewService = {
	/**
	 * 후기 작성. 거래의 구매자·판매자만 쓸 수 있고, 받는 사람은 거래 상대다.
	 * 검사 순서: 거래 없음 404, 당사자 아님 403, 완료되지 않은 거래 400, 이미 후기를 남김 409.
	 * 중복은 (거래, 작성자) 유일 제약이 막아서 동시에 두 번 보내도 하나만 남는다.
	 */
	async create(dto: CreateReviewDto) {
		const transaction = await prisma.transaction.findUnique({
			where: { id: dto.transactionId },
			select: { buyerId: true, sellerId: true, status: true },
		});
		if (!transaction) {
			throw new ReviewError(404, "Transaction not found");
		}

		const isBuyer = transaction.buyerId === dto.reviewerId;
		if (!isBuyer && transaction.sellerId !== dto.reviewerId) {
			throw new ReviewError(403, "Forbidden");
		}
		if (transaction.status !== "completed") {
			throw new ReviewError(400, "Trade is not completed");
		}

		try {
			return await prisma.review.create({
				data: {
					transactionId: dto.transactionId,
					reviewerId: dto.reviewerId,
					revieweeId: isBuyer ? transaction.sellerId : transaction.buyerId,
					rating: dto.rating,
					// 공백뿐인 내용은 남기지 않는다
					content: dto.content?.trim() || null,
				},
			});
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === "P2002"
			) {
				throw new ReviewError(409, "Already reviewed");
			}
			throw error;
		}
	},

	/**
	 * 사용자가 받은 후기 목록 (최신순, 커서 기반 페이지네이션)
	 */
	async listByUser(userId: string, options: ReviewListOptions = {}) {
		const { cursor, limit = 20 } = options;

		const reviews = await prisma.review.findMany({
			where: { revieweeId: userId },
			take: limit + 1,
			...(cursor && {
				cursor: { id: cursor },
				skip: 1,
			}),
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			include: {
				reviewer: {
					select: {
						id: true,
						nickname: true,
						profileImage: true,
					},
				},
				transaction: {
					select: {
						market: { select: { id: true, title: true } },
					},
				},
			},
		});

		const hasMore = reviews.length > limit;
		const items = hasMore ? reviews.slice(0, limit) : reviews;
		// 다음 요청은 커서 항목을 건너뛰므로(skip: 1) 이 페이지의 마지막 항목을 커서로 준다
		const nextCursor = hasMore ? items[items.length - 1].id : null;

		return { items, nextCursor, hasMore };
	},

	/**
	 * 사용자가 받은 후기 수와 평균 별점
	 */
	async summary(userId: string): Promise<ReviewSummary> {
		const { _count, _avg } = await prisma.review.aggregate({
			where: { revieweeId: userId },
			_count: { _all: true },
			_avg: { rating: true },
		});

		return {
			reviewCount: _count._all,
			averageRating:
				_avg.rating === null ? null : Math.round(_avg.rating * 10) / 10,
		};
	},
};
