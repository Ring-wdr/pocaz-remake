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
	async getByUserId(userId: string, limit = 50): Promise<ActivityItem[]> {
		const activities = await prisma.activity.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
			take: limit,
		});

		// 각 활동에 대한 대상 정보를 가져옴
		const enrichedActivities = await Promise.all(
			activities.map(async (activity) => {
				let target: string | null = null;
				let targetHref: string | null = null;

				if (activity.targetType === "post") {
					const post = await prisma.post.findUnique({
						where: { id: activity.targetId },
						select: { content: true },
					});
					target = post?.content?.slice(0, 30) ?? null;
					targetHref = `/community/posts/${activity.targetId}`;
				} else if (activity.targetType === "market") {
					const market = await prisma.market.findUnique({
						where: { id: activity.targetId },
						select: { title: true },
					});
					target = market?.title ?? null;
					targetHref = `/market/${activity.targetId}`;
				} else if (activity.targetType === "transaction") {
					const transaction = await prisma.transaction.findUnique({
						where: { id: activity.targetId },
						include: { market: { select: { title: true } } },
					});
					target = transaction?.market?.title ?? null;
					targetHref = `/market/${transaction?.marketId}`;
				}

				return {
					id: activity.id,
					type: activity.type,
					description: activity.description,
					target,
					targetHref,
					createdAt: activity.createdAt,
				};
			}),
		);

		return enrichedActivities;
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
