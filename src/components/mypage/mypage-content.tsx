"use client";

import * as stylex from "@stylexjs/stylex";
import { Suspense } from "@suspensive/react";
import { SuspenseQuery } from "@suspensive/react-query";
import {
	colors,
	fontSize,
	fontWeight,
	spacing,
} from "@/app/global-tokens.stylex";
import { mypageStyles } from "@/components/mypage/mypage-styles.stylex";
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
		display: "flex",
		flexDirection: "column",
		gap: spacing.sm,
	},
	error: {
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderLeftWidth: 4,
		borderLeftStyle: "solid",
		borderLeftColor: colors.statusError,
	},
	errorDivided: {
		borderTopWidth: 1,
		borderTopStyle: "solid",
		borderTopColor: colors.borderPrimary,
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
	divided?: boolean;
}

// Rendered inside a card, so it only draws the error accent, not its own box.
function ErrorFallback({ title, description, divided }: ErrorFallbackProps) {
	return (
		<div
			role="alert"
			{...stylex.props(styles.error, divided && styles.errorDivided)}
		>
			<p {...stylex.props(styles.errorTitle)}>{title}</p>
			{description && <p {...stylex.props(styles.errorDesc)}>{description}</p>}
		</div>
	);
}

export function MyPageContent() {
	return (
		<div {...stylex.props(styles.content)}>
			<div {...stylex.props(mypageStyles.card)}>
				<QueryErrorBoundary
					fallback={() => (
						<ErrorFallback
							title="프로필을 불러오지 못했습니다"
							description="잠시 후 다시 시도해주세요"
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
							divided
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
			</div>

			<QueryErrorBoundary
				fallback={() => (
					<div {...stylex.props(mypageStyles.card)}>
						<ErrorFallback
							title="활동 내역을 불러오지 못했습니다"
							description="잠시 후 다시 시도해주세요"
						/>
					</div>
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
