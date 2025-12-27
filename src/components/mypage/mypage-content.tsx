"use client";

import * as stylex from "@stylexjs/stylex";
import { Suspense } from "@suspensive/react";
import { SuspenseQuery } from "@suspensive/react-query";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import {
	ActivitySection,
	ProfileSection,
	StatsSection,
} from "@/components/mypage/sections";
import {
	ActivitySkeleton,
	ProfileSkeleton,
	StatsSkeleton,
} from "@/components/mypage/skeletons";
import { QueryErrorBoundary } from "@/components/providers/query-error-boundary";
import {
	userActivityQueryOptions,
	userProfileQueryOptions,
	userStatsQueryOptions,
} from "@/lib/queries/users";

const styles = stylex.create({
	content: {
		flex: 1,
		paddingTop: spacing.md,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		paddingBottom: spacing.lg,
	},
	profileError: {
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
		paddingBottom: spacing.sm,
		marginBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
		borderLeftWidth: 4,
		borderLeftStyle: "solid",
		borderLeftColor: colors.statusError,
	},
	statsError: {
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		marginBottom: spacing.md,
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
		borderLeftWidth: 4,
		borderLeftStyle: "solid",
		borderLeftColor: colors.statusError,
	},
	activityError: {
		marginBottom: spacing.md,
		paddingTop: spacing.md,
		paddingBottom: spacing.md,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
		borderLeftWidth: 4,
		borderLeftStyle: "solid",
		borderLeftColor: colors.statusError,
	},
	errorTitle: {
		margin: 0,
		marginBottom: spacing.xxxs,
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
	},
	errorDesc: {
		margin: 0,
		fontSize: fontSize.sm,
		color: colors.textMuted,
	},
});

interface ErrorFallbackProps {
	title: string;
	description?: string;
	variant?: "profile" | "stats" | "activity";
}

const variantStyles = {
	profile: styles.profileError,
	stats: styles.statsError,
	activity: styles.activityError,
};
function ErrorFallback({
	title,
	description,
	variant = "stats",
}: ErrorFallbackProps) {
	return (
		<div {...stylex.props(variantStyles[variant])}>
			<p {...stylex.props(styles.errorTitle)}>{title}</p>
			{description && <p {...stylex.props(styles.errorDesc)}>{description}</p>}
		</div>
	);
}

export function MyPageContent() {
	return (
		<div {...stylex.props(styles.content)}>
			<QueryErrorBoundary
				fallback={() => (
					<ErrorFallback
						title="프로필을 불러오지 못했습니다"
						description="잠시 후 다시 시도해주세요"
						variant="profile"
					/>
				)}
			>
				<Suspense clientOnly fallback={<ProfileSkeleton />}>
					<SuspenseQuery {...userProfileQueryOptions()}>
						{({ data: profile }) => <ProfileSection profile={profile} />}
					</SuspenseQuery>
				</Suspense>
			</QueryErrorBoundary>

			<QueryErrorBoundary
				fallback={() => (
					<ErrorFallback
						title="통계를 불러오지 못했습니다"
						description="잠시 후 다시 시도해주세요"
						variant="stats"
					/>
				)}
			>
				<Suspense clientOnly fallback={<StatsSkeleton />}>
					<SuspenseQuery {...userStatsQueryOptions()}>
						{({ data }) => (
							<StatsSection
								stats={{
									posts: data.posts ?? 0,
									likes: data.likes ?? 0,
									trades: data.trades ?? 0,
								}}
							/>
						)}
					</SuspenseQuery>
				</Suspense>
			</QueryErrorBoundary>

			<QueryErrorBoundary
				fallback={() => (
					<ErrorFallback
						title="활동 내역을 불러오지 못했습니다"
						description="잠시 후 다시 시도해주세요"
						variant="activity"
					/>
				)}
			>
				<Suspense clientOnly fallback={<ActivitySkeleton />}>
					<SuspenseQuery {...userActivityQueryOptions()}>
						{({ data }) => <ActivitySection activities={data?.items ?? []} />}
					</SuspenseQuery>
				</Suspense>
			</QueryErrorBoundary>
		</div>
	);
}
