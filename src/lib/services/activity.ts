import { prisma } from "@/lib/prisma";

/**
 * Activity 타입
 */
export type ActivityType = "post" | "like" | "comment" | "trade" | "market";

/**
 * Activity 대상 타입
 */
export type TargetType = "post" | "market" | "transaction";

/**
 * Activity 생성 DTO
 */
export interface CreateActivityDto {
	userId: string;
	type: ActivityType;
	description: string;
	targetId: string;
	targetType: TargetType;
}

/**
 * Activity 조회 결과 타입
 */
export interface ActivityItem {
	id: string;
	type: string;
	description: string;
	target: string | null;
	targetHref: string | null;
	createdAt: Date;
}

export interface ActivityQueryOptions {
	limit?: number;
	cursor?: string;
	type?: ActivityType;
}

/**
 * Activity Service
 */
export const activityService = {
	/**
	 * 활동 기록 생성
	 */
	async create(dto: CreateActivityDto) {
		return prisma.activity.create({
			data: {
				userId: dto.userId,
				type: dto.type,
				description: dto.description,
				targetId: dto.targetId,
				targetType: dto.targetType,
			},
		});
	},

	/**
	 * 사용자의 활동 내역 조회
	 */
	async getByUserId(
		userId: string,
		options: ActivityQueryOptions = {},
	): Promise<{
		items: ActivityItem[];
		nextCursor: string | null;
		hasMore: boolean;
	}> {
		const limit = options.limit ?? 50;
		const activities = await prisma.activity.findMany({
			where: {
				userId,
				...(options.type ? { type: options.type } : null),
			},
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			take: limit + 1,
			...(options.cursor
				? {
						cursor: { id: options.cursor },
						skip: 1,
					}
				: null),
		});

		const itemsForPage = activities.slice(0, limit);
		const nextCursor = activities.length > limit ? activities[limit].id : null;

		const postIds = itemsForPage
			.filter((activity) => activity.targetType === "post")
			.map((activity) => activity.targetId);
		const marketIds = itemsForPage
			.filter((activity) => activity.targetType === "market")
			.map((activity) => activity.targetId);
		const transactionIds = itemsForPage
			.filter((activity) => activity.targetType === "transaction")
			.map((activity) => activity.targetId);

		const [posts, markets, transactions] = await Promise.all([
			postIds.length
				? prisma.post.findMany({
						where: { id: { in: postIds } },
						select: { id: true, content: true },
					})
				: Promise.resolve([] as { id: string; content: string }[]),
			marketIds.length
				? prisma.market.findMany({
						where: { id: { in: marketIds } },
						select: { id: true, title: true },
					})
				: Promise.resolve([] as { id: string; title: string }[]),
			transactionIds.length
				? prisma.transaction.findMany({
						where: { id: { in: transactionIds } },
						select: {
							id: true,
							marketId: true,
							market: { select: { title: true } },
						},
					})
				: Promise.resolve([]),
		]);

		const postMap = new Map(posts.map((post) => [post.id, post]));
		const marketMap = new Map(markets.map((market) => [market.id, market]));
		const transactionMap = new Map(transactions.map((tx) => [tx.id, tx]));

		// 각 활동에 대한 대상 정보를 가져옴 (batch fetch to avoid N+1)
		const enrichedActivities = itemsForPage.map((activity) => {
			let target: string | null = null;
			let targetHref: string | null = null;

			if (activity.targetType === "post") {
				const post = postMap.get(activity.targetId);
				target = post?.content?.slice(0, 30) ?? null;
				targetHref = `/community/posts/${activity.targetId}`;
			} else if (activity.targetType === "market") {
				const market = marketMap.get(activity.targetId);
				target = market?.title ?? null;
				targetHref = `/market/${activity.targetId}`;
			} else if (activity.targetType === "transaction") {
				const transaction = transactionMap.get(activity.targetId);
				target = transaction?.market?.title ?? null;
				targetHref = transaction?.marketId
					? `/market/${transaction.marketId}`
					: null;
			}

			return {
				id: activity.id,
				type: activity.type,
				description: activity.description,
				target,
				targetHref,
				createdAt: activity.createdAt,
			};
		});

		return {
			items: enrichedActivities,
			nextCursor,
			hasMore: Boolean(nextCursor),
		};
	},

	/**
	 * 최근 활동 요약 (대시보드용)
	 */
	async getRecentSummary(userId: string) {
		const now = new Date();
		const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

		const activities = await prisma.activity.groupBy({
			by: ["type"],
			where: {
				userId,
				createdAt: { gte: thirtyDaysAgo },
			},
			_count: true,
		});

		return activities.reduce(
			(acc, item) => {
				acc[item.type] = item._count;
				return acc;
			},
			{} as Record<string, number>,
		);
	},

	/**
	 * 활동 삭제
	 */
	async delete(id: string) {
		await prisma.activity.delete({
			where: { id },
		});
	},

	/**
	 * 대상과 관련된 모든 활동 삭제
	 */
	async deleteByTarget(targetId: string, targetType: TargetType) {
		await prisma.activity.deleteMany({
			where: {
				targetId,
				targetType,
			},
		});
	},
};
