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
import { MarketInfoSection } from "@/components/chat/sections/market-info-section";
import { MarketInfoSkeleton } from "@/components/chat/skeletons/market-info-skeleton";
import { QueryErrorBoundary } from "@/components/providers/query-error-boundary";
import { marketInfoQueryOptions } from "@/lib/queries/markets";

const styles = stylex.create({
	errorContainer: {
		marginBottom: spacing.sm,
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
}

function ErrorFallback({ title, description }: ErrorFallbackProps) {
	return (
		<div {...stylex.props(styles.errorContainer)}>
			<p {...stylex.props(styles.errorTitle)}>{title}</p>
			{description && <p {...stylex.props(styles.errorDesc)}>{description}</p>}
		</div>
	);
}

interface ChatListContentProps {
	marketId: string;
}

export function ChatListContent({ marketId }: ChatListContentProps) {
	return (
		<QueryErrorBoundary
			fallback={() => (
				<ErrorFallback
					title="마켓 정보를 불러오지 못했습니다"
					description="잠시 후 다시 시도해주세요"
				/>
			)}
		>
			<Suspense clientOnly fallback={<MarketInfoSkeleton />}>
				<SuspenseQuery {...marketInfoQueryOptions(marketId)}>
					{({ data: marketInfo }) => (
						<MarketInfoSection marketInfo={marketInfo} />
					)}
				</SuspenseQuery>
			</Suspense>
		</QueryErrorBoundary>
	);
}
