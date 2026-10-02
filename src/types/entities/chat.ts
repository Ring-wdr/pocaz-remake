/**
 * Chat Entity Types
 *
 * API 스키마 기반 채팅 관련 타입 정의
 * @see src/lib/elysia/routes/chat.ts
 */

import type {
	ChatMessageModel,
	ChatRoomModel,
} from "@/generated/prisma/models";

/** 채팅 참여자 (API UserSchema 기반) */
export interface ChatUser {
	id: string;
	nickname: string;
	profileImage: string | null;
}

/** 채팅방 멤버 (API MemberSchema 기반) */
export interface ChatMember extends ChatUser {
	joinedAt: string;
}

/** 마지막 메시지 정보 (API LastMessageSchema 기반) */
export interface ChatLastMessage {
	content: string;
	createdAt: string;
	user: {
		id: string;
		nickname: string;
	};
}

/** 채팅방 연결 마켓의 기본 정보 (API MarketInfoSchema 기반, 목록 응답에 쓰인다) */
export interface ChatMarketSummary {
	id: string;
	title: string;
	price: number | null;
	status: string;
	userId: string;
	thumbnail: string | null;
}

/** 채팅방 연결 마켓에서 완료된 거래 (API RoomDetailSchema의 market.transaction 기반) */
export interface ChatMarketTransaction {
	id: string;
	buyerId: string;
	sellerId: string;
	price: number;
	completedAt: string;
	/** 현재 사용자가 이 거래의 후기를 이미 남겼는지 */
	myReviewed: boolean;
}

/** 채팅방 상세의 연결 마켓 정보 (API RoomDetailSchema의 market 기반). 완료된 거래가 없으면 transaction은 null */
export interface ChatMarketInfo extends ChatMarketSummary {
	transaction: ChatMarketTransaction | null;
}

/** 채팅 메시지 (API MessageSchema 기반) */
export interface ChatMessage {
	id: ChatMessageModel["id"];
	content: ChatMessageModel["content"];
	createdAt: string;
	user: ChatUser;
}

/** 채팅방 목록 아이템 (API RoomItemSchema 기반) */
export interface ChatRoomListItem {
	id: ChatRoomModel["id"];
	name: ChatRoomModel["name"];
	createdAt: string;
	members: ChatUser[];
	lastMessage: ChatLastMessage | null;
	messageCount: number;
	/** 내가 마지막으로 읽은 뒤에 상대가 보낸 메시지 수 */
	unreadCount: number;
	market: ChatMarketSummary | null;
}

/** 채팅방 상세 정보 (API RoomDetailSchema 기반) */
export interface ChatRoomDetail {
	id: ChatRoomModel["id"];
	name: ChatRoomModel["name"];
	createdAt: string;
	members: ChatMember[];
	messageCount: number;
	/** 내가 이 방을 마지막으로 읽은 시각. 읽은 적이 없으면 null */
	lastReadAt: string | null;
	market: ChatMarketInfo | null;
}

/** 페이지네이션된 메시지 응답 (API PaginatedMessagesSchema 기반) */
export interface PaginatedMessages {
	messages: ChatMessage[];
	nextCursor: string | null;
	hasMore: boolean;
}
