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
import { ChatListSkeleton } from "@/components/chat/skeletons";
import { QueryErrorBoundary } from "@/components/providers/query-error-boundary";
import { chatListAllQueryOptions } from "@/lib/queries/markets";
import ChatListSection from "./chat-list-section";

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

export function ChatListAllContent() {
	return (
		<QueryErrorBoundary
			fallback={() => (
				<ErrorFallback
					title="채팅방을 불러오지 못했습니다"
					description="잠시 후 다시 시도해주세요"
				/>
			)}
		>
			<Suspense clientOnly fallback={<ChatListSkeleton showFilters />}>
				<SuspenseQuery {...chatListAllQueryOptions()}>
					{({ data }) => (
						<ChatListSection
							initialRooms={data.rooms}
							initialHasMore={data.hasMore}
							initialCursor={data.nextCursor}
							marketId={undefined}
						/>
					)}
				</SuspenseQuery>
			</Suspense>
		</QueryErrorBoundary>
	);
}
