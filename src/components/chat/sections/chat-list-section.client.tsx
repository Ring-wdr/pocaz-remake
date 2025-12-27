"use client";

import * as stylex from "@stylexjs/stylex";
import { Loader2, MessageCircleHeart } from "lucide-react";
import { useEffect, useRef } from "react";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import { ChatListItem } from "@/components/chat/chat-list-item";
import type { ChatRoomListItem } from "@/types/entities";

const styles = stylex.create({
	container: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.sm,
	},
	searchBar: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxs,
		paddingTop: spacing.xxs,
		paddingBottom: spacing.xxs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		backgroundColor: colors.bgTertiary,
		borderRadius: radius.md,
	},
	searchIcon: {
		color: colors.textPlaceholder,
		flexShrink: 0,
	},
	searchInput: {
		flex: 1,
		fontSize: fontSize.md,
		backgroundColor: "transparent",
		borderWidth: 0,
		outline: "none",
		color: colors.textSecondary,
		"::placeholder": {
			color: colors.textPlaceholder,
		},
	},
	clearButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "24px",
		height: "24px",
		backgroundColor: colors.borderSecondary,
		borderRadius: radius.full,
		borderWidth: 0,
		cursor: "pointer",
		color: colors.textMuted,
	},
	filterTabs: {
		display: "flex",
		gap: spacing.xxs,
	},
	filterTab: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxxs,
		paddingTop: spacing.xxs,
		paddingBottom: spacing.xxs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		fontSize: fontSize.sm,
		fontWeight: fontWeight.medium,
		color: colors.textMuted,
		backgroundColor: colors.bgTertiary,
		borderRadius: radius.md,
		borderWidth: 0,
		cursor: "pointer",
	},
	filterTabActive: {
		color: colors.accentPrimary,
		backgroundColor: colors.accentPrimaryBg,
	},
	list: {},
	emptyState: {
		textAlign: "center",
		paddingTop: spacing.xxl,
		paddingBottom: spacing.xxl,
		color: colors.textPlaceholder,
	},
	emptyIcon: {
		fontSize: "56px",
		marginBottom: spacing.sm,
	},
	emptyTitle: {
		fontSize: fontSize.base,
		fontWeight: fontWeight.semibold,
		color: colors.textTertiary,
		margin: 0,
		marginBottom: spacing.xxs,
	},
	emptyText: {
		fontSize: fontSize.md,
		margin: 0,
	},
	loadingMore: {
		display: "flex",
		justifyContent: "center",
		paddingTop: spacing.md,
		paddingBottom: spacing.md,
	},
	spinner: {
		animationName: "spin",
		animationDuration: "1s",
		animationIterationCount: "infinite",
		animationTimingFunction: "linear",
	},
});

const spinKeyframes = stylex.keyframes({
	"0%": { transform: "rotate(0deg)" },
	"100%": { transform: "rotate(360deg)" },
});

const spinnerStyle = stylex.create({
	spinner: {
		animationName: spinKeyframes,
		animationDuration: "1s",
		animationIterationCount: "infinite",
		animationTimingFunction: "linear",
	},
});

export interface ChatListClientViewProps {
	rooms: ChatRoomListItem[];
	isLoadingMore: boolean;
	hasMore: boolean;
	onLoadMore?: () => void;
	loadMoreRef?: React.RefObject<HTMLDivElement | null>;
}

export function ChatListClientView({
	rooms,
	isLoadingMore,
	hasMore,
	onLoadMore,
	loadMoreRef: externalRef,
}: ChatListClientViewProps) {
	const internalRef = useRef<HTMLDivElement>(null);
	const loadMoreRef = externalRef || internalRef;
	// 무한 스크롤 관찰
	useEffect(() => {
		if (!hasMore || isLoadingMore || !onLoadMore) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
					onLoadMore();
				}
			},
			{ threshold: 0.1 },
		);

		if (loadMoreRef.current) {
			observer.observe(loadMoreRef.current);
		}

		return () => observer.disconnect();
	}, [hasMore, isLoadingMore, onLoadMore, loadMoreRef]);

	if (rooms.length === 0) {
		return (
			<div {...stylex.props(styles.container)}>
				<div {...stylex.props(styles.emptyState)}>
					<MessageCircleHeart size={56} {...stylex.props(styles.emptyIcon)} />
					<h3 {...stylex.props(styles.emptyTitle)}>채팅방이 없습니다</h3>
					<p {...stylex.props(styles.emptyText)}>
						마켓에서 상품을 둘러보고 대화를 시작해보세요
					</p>
				</div>
			</div>
		);
	}

	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.list)}>
				{rooms.map((room) => (
					<ChatListItem key={room.id} room={room} />
				))}
			</div>

			<div ref={loadMoreRef} {...stylex.props(styles.loadingMore)}>
				{isLoadingMore && (
					<Loader2 size={24} {...stylex.props(spinnerStyle.spinner)} />
				)}
			</div>
		</div>
	);
}
