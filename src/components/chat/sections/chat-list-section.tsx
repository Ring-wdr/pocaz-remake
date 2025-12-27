import type { ChatRoomListItem } from "@/types/entities";
import ChatListClient from "./chat-list-section.client";

interface ChatListSectionProps {
	initialRooms: ChatRoomListItem[];
	initialHasMore: boolean;
	initialCursor: string | null;
	marketId?: string;
}

/**
 * 채팅 목록 프레젠테이션 컴포넌트
 * - 순수 프레젠테이션 역할
 * - 데이터를 props로 받아 ChatListClient에 전달
 */
export default function ChatListSection({
	initialRooms,
	initialHasMore,
	initialCursor,
	marketId,
}: ChatListSectionProps) {
	return (
		<ChatListClient
			initialRooms={initialRooms}
			initialHasMore={initialHasMore}
			initialCursor={initialCursor}
			marketId={marketId}
		/>
	);
}
