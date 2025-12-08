"use client";

import * as stylex from "@stylexjs/stylex";
import type { ComponentProps, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";

import type { ChatMessageView } from "@/lib/hooks/use-chat-messages";

interface ChatMessageListProps extends ComponentProps<typeof Virtuoso> {
	messages: ChatMessageView[];
	onStartReached: () => void;
	hasPrev: boolean;
	isFetchingPrev: boolean;
	onAtBottomChange: (isAtBottom: boolean) => void;
	renderMessage: (message: ChatMessageView) => ReactNode;
	renderHeader?: () => ReactNode;
	virtuosoRef?: React.Ref<VirtuosoHandle>;
}

const styles = stylex.create({
	container: {
		height: "100%",
		width: "100%",
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
	...props
}: ChatMessageListProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	return (
		<Virtuoso
			{...props}
			{...stylex.props(styles.container)}
			data={messages}
			totalCount={messages.length}
			initialTopMostItemIndex={messages.length - 1}
			startReached={() => {
				if (hasPrev && !isFetchingPrev) onStartReached();
			}}
			atBottomStateChange={onAtBottomChange}
			itemContent={(_index, item) => renderMessage(item)}
			components={{
				Header: () => (renderHeader ? renderHeader() : null),
				Footer: () => null,
			}}
		/>
	);
}
