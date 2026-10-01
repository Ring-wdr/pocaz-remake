"use client";

import * as stylex from "@stylexjs/stylex";
import type { ComponentProps, ReactNode, Ref } from "react";
import { useEffect, useRef, useState } from "react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { colors, radius, spacing, text } from "@/app/global-tokens.stylex";
import type { ChatMessageView } from "@/lib/hooks/use-chat-messages";
import { formatDayLabel, isSameDay } from "@/utils/date";

interface ChatMessageListProps extends ComponentProps<typeof Virtuoso> {
	messages: ChatMessageView[];
	onStartReached: () => void;
	hasPrev: boolean;
	isFetchingPrev: boolean;
	onAtBottomChange: (isAtBottom: boolean) => void;
	renderMessage: (message: ChatMessageView) => ReactNode;
	renderHeader?: () => ReactNode;
	virtuosoRef?: Ref<VirtuosoHandle>;
	lastReadMessageId?: string | null;
	lastReadAt?: string | null;
}

const styles = stylex.create({
	container: {
		height: "100%",
		width: "100%",
	},
	unreadDivider: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxs,
		marginTop: spacing.xs,
		marginBottom: spacing.sm,
		color: colors.textMuted,
		fontSize: text.xs,
	},
	unreadDividerLine: {
		flex: 1,
		height: 1,
		backgroundColor: colors.borderPrimary,
	},
	unreadDividerLabel: {
		whiteSpace: "nowrap",
	},
	dateGroup: {
		textAlign: "center",
		marginBottom: spacing.sm,
	},
	dateBadge: {
		display: "inline-block",
		fontSize: text.sm,
		color: colors.textMuted,
		backgroundColor: colors.borderPrimary,
		paddingTop: spacing.xxxs,
		paddingBottom: spacing.xxxs,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		borderRadius: radius.md,
	},
});

/**
 * Virtuoso의 firstItemIndex 시작값. 과거 메시지를 앞에 붙일 때마다 붙인 개수만큼 줄이므로 충분히 크게 잡는다.
 */
const START_INDEX = 1_000_000;

/**
 * 가변 높이 메시지 리스트 (react-virtuoso)
 * - startReached: 위로 스크롤 시 과거 메시지 로드
 * - followOutput: 맨 아래일 때만 새 메시지를 따라감
 * - atBottomStateChange: 새 메시지 배지/읽지 않음 경계용
 */
export function ChatMessageList({
	messages,
	onStartReached,
	hasPrev,
	isFetchingPrev,
	onAtBottomChange,
	renderMessage,
	renderHeader,
	virtuosoRef,
	lastReadMessageId,
	lastReadAt,
	...props
}: ChatMessageListProps) {
	const internalRef = useRef<VirtuosoHandle | null>(null);
	const [mounted, setMounted] = useState(false);

	// 과거 메시지를 앞에 붙이면 Virtuoso는 "같은 렌더에서" firstItemIndex가 붙인 개수만큼 줄어야 스크롤 위치를 지킨다.
	// 기준 메시지(처음 맨 위에 있던 메시지)를 잡아 두고, 그 앞에 붙은 메시지 수로 firstItemIndex를 계산한다.
	const [anchor, setAnchor] = useState({
		id: messages[0]?.id ?? null,
		index: START_INDEX,
	});
	const anchorPosition =
		anchor.id === null
			? -1
			: messages.findIndex((message) => message.id === anchor.id);
	const firstItemIndex =
		anchorPosition === -1 ? anchor.index : anchor.index - anchorPosition;
	if (anchorPosition === -1 && messages.length > 0) {
		// 빈 방에서 시작했거나 기준이던 전송 중 메시지가 서버 메시지로 바뀌면 지금 맨 위 메시지로 기준을 옮긴다
		setAnchor({ id: messages[0].id, index: firstItemIndex });
	}

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	const shouldRenderUnreadDivider = (index: number) => {
		if (!lastReadMessageId && !lastReadAt) return false;
		const current = messages[index];
		const prev = messages[index - 1];

		if (lastReadMessageId) {
			return prev?.id === lastReadMessageId;
		}

		if (lastReadAt) {
			const lastReadTs = new Date(lastReadAt).getTime();
			const prevTs = prev ? new Date(prev.createdAt).getTime() : -Infinity;
			const currTs = new Date(current.createdAt).getTime();
			return prevTs <= lastReadTs && currTs > lastReadTs;
		}

		return false;
	};

	const shouldRenderDateLabel = (index: number) => {
		if (index === 0) return true;
		const prev = messages[index - 1];
		const current = messages[index];
		if (!prev || !current) return false;

		return !isSameDay(prev.createdAt, current.createdAt);
	};

	return (
		<Virtuoso
			ref={virtuosoRef ?? internalRef}
			{...props}
			{...stylex.props(styles.container)}
			role="log"
			aria-live="polite"
			aria-relevant="additions text"
			aria-label="채팅 메시지"
			data={messages}
			totalCount={messages.length}
			firstItemIndex={firstItemIndex}
			initialTopMostItemIndex={messages.length - 1}
			computeItemKey={(_index, item) => item.id}
			startReached={() => {
				if (hasPrev && !isFetchingPrev) onStartReached();
			}}
			atBottomStateChange={onAtBottomChange}
			itemContent={(index, item) => (
				<div>
					{shouldRenderDateLabel(index - firstItemIndex) && (
						<div {...stylex.props(styles.dateGroup)}>
							<span {...stylex.props(styles.dateBadge)}>
								{formatDayLabel(item.createdAt)}
							</span>
						</div>
					)}
					{shouldRenderUnreadDivider(index - firstItemIndex) && (
						<div {...stylex.props(styles.unreadDivider)}>
							<span {...stylex.props(styles.unreadDividerLine)} aria-hidden />
							<span {...stylex.props(styles.unreadDividerLabel)}>
								여기까지 읽음
							</span>
							<span {...stylex.props(styles.unreadDividerLine)} aria-hidden />
						</div>
					)}
					{renderMessage(item)}
				</div>
			)}
			components={{
				Header: () => (renderHeader ? renderHeader() : null),
				Footer: () => null,
			}}
		/>
	);
}
