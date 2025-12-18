import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { ChatRoom } from "@/components/chat";
import { getCurrentUser } from "@/lib/auth/actions";
import { createMetadata } from "@/lib/metadata";
import type {
	ChatMarketInfo,
	ChatMember,
	ChatMessage,
	PaginatedMessages,
} from "@/types/entities";
import { api } from "@/utils/eden";

const getChatRoom = cache(async (roomId: string) => {
	const { data, error } = await api.chat.rooms({ id: roomId }).get();
	if (error || !data) return null;
	return data;
});

async function getInitialMessages(roomId: string) {
	const { data } = await api.chat.rooms({ id: roomId }).messages.get({
		query: { limit: "50" },
	});
	return data;
}

export async function generateMetadata({
	params,
}: PageProps<"/chat/[roomId]">): Promise<Metadata> {
	const { roomId } = await params;
	const data = await getChatRoom(roomId);
	const roomName = data?.name ?? "채팅";
	const participant =
		data?.members
			?.map((member) => member.nickname)
			.filter(Boolean)
			.slice(0, 2)
			.join(", ") ?? null;

	const description = participant
		? `${participant}과 나눈 채팅을 이어가세요.`
		: "거래와 소통을 이어가는 채팅방입니다.";

	return createMetadata({
		title: `${roomName} | POCAZ 채팅`,
		description,
		path: `/chat/${roomId}`,
		ogTitle: roomName,
	});
}

export default async function ChatRoomPage({
	params,
}: PageProps<"/chat/[roomId]">) {
	const { roomId } = await params;

	const currentUser = await getCurrentUser();
	if (!currentUser) {
		notFound();
	}

	const [roomData, messagesData] = await Promise.all([
		getChatRoom(roomId),
		getInitialMessages(roomId),
	]);

	if (!roomData) {
		notFound();
	}

	const members: ChatMember[] = roomData.members.map((m) => ({
		id: m.id,
		nickname: m.nickname,
		profileImage: m.profileImage,
		joinedAt: m.joinedAt,
	}));

	const market: ChatMarketInfo | null = roomData.market
		? {
				id: roomData.market.id,
				title: roomData.market.title,
				price: roomData.market.price,
				status: roomData.market.status,
				userId: roomData.market.userId,
				thumbnail: roomData.market.thumbnail,
			}
		: null;

	const messages: ChatMessage[] =
		messagesData?.messages.map((msg) => ({
			id: msg.id,
			content: msg.content,
			createdAt: msg.createdAt,
			user: {
				id: msg.user.id,
				nickname: msg.user.nickname,
				profileImage: msg.user.profileImage,
			},
		})) ?? [];

	const messagesPage: PaginatedMessages = {
		messages,
		nextCursor: messagesData?.nextCursor ?? null,
		hasMore: messagesData?.hasMore ?? false,
	};

	return (
		<ChatRoom
			roomId={roomData.id}
			roomName={roomData.name}
			members={members}
			market={market}
			initialPage={messagesPage}
			currentUserId={currentUser.id}
		/>
	);
}
