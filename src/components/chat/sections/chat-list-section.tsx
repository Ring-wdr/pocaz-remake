import * as stylex from "@stylexjs/stylex";
import { MessageCircleHeart } from "lucide-react";

import {
	colors,
	fontSize,
	fontWeight,
	spacing,
} from "@/app/global-tokens.stylex";
import type { ChatRoomListItem } from "@/types/entities";
import { api } from "@/utils/eden";
import ChatListClient from "./chat-list-section.client";

const styles = stylex.create({
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
});

interface ChatListSectionProps {
	marketId?: string;
}

export default async function ChatListSection({
	marketId,
}: ChatListSectionProps) {
	// 초기 데이터 조회 (SSR)
	const { data, error } = marketId
		? await api.chat.rooms.market({ marketId }).get()
		: await api.chat.rooms.get({ query: { limit: "20" } });

	if (error || !data) {
		return (
			<div {...stylex.props(styles.emptyState)}>
				<MessageCircleHeart size={56} {...stylex.props(styles.emptyIcon)} />
				<h3 {...stylex.props(styles.emptyTitle)}>
					채팅방을 불러올 수 없습니다
				</h3>
				<p {...stylex.props(styles.emptyText)}>로그인 후 다시 시도해주세요</p>
			</div>
		);
	}

	// API 응답을 ChatRoomListItem 타입으로 변환
	const rooms = data.rooms.map<ChatRoomListItem>((room) => ({
		id: room.id,
		name: room.name,
		createdAt: room.createdAt,
		members: room.members,
		lastMessage: room.lastMessage,
		messageCount: room.messageCount,
		market: room.market,
	}));

	// 페이지네이션 정보 (타입 안전하게 추출)
	const paginatedData = data as {
		rooms: typeof data.rooms;
		hasMore?: boolean;
		nextCursor?: string | null;
	};
	const hasMore =
		"hasMore" in paginatedData && typeof paginatedData.hasMore === "boolean"
			? paginatedData.hasMore
			: false;
	const nextCursor =
		"nextCursor" in paginatedData ? (paginatedData.nextCursor ?? null) : null;

	return (
		<ChatListClient
			initialRooms={rooms}
			initialHasMore={hasMore}
			initialCursor={nextCursor}
			marketId={marketId}
		/>
	);
}
