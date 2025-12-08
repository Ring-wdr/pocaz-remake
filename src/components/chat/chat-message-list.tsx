"use client";

import * as stylex from "@stylexjs/stylex";
import type { ComponentProps, ReactNode, Ref } from "react";
import { useEffect, useRef, useState } from "react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { colors, spacing, text } from "@/app/global-tokens.stylex";

import type { ChatMessageView } from "@/lib/hooks/use-chat-messages";

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
});

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
	const [firstItemIndex, setFirstItemIndex] = useState(0);
	const prevFirstIdRef = useRef<string | null>(messages[0]?.id ?? null);
	const prevLengthRef = useRef(messages.length);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		const prevLength = prevLengthRef.current;
		const currentLength = messages.length;
		const delta = currentLength - prevLength;
		const firstId = messages[0]?.id ?? null;
		const isPrepended =
			firstId !== prevFirstIdRef.current && delta > 0 && isFetchingPrev;

		if (isPrepended) {
			setFirstItemIndex((idx) => idx + delta);
		}

		prevFirstIdRef.current = firstId;
		prevLengthRef.current = currentLength;
	}, [isFetchingPrev, messages]);

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
					{shouldRenderUnreadDivider(index) && (
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
