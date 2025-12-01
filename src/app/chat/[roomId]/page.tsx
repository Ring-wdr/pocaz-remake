import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChatRoom } from "@/components/chat";
import { getCurrentUser } from "@/lib/auth/actions";
import { createMetadata } from "@/lib/metadata";
import type { ChatMarketInfo, ChatMember, ChatMessage } from "@/types/entities";
import { api } from "@/utils/eden";

async function getChatRoomData(roomId: string, currentUserId: string) {
	// 채팅방 상세 정보 조회
	const { data: roomData, error: roomError } = await api.chat
		.rooms({ id: roomId })
		.get();

	if (roomError || !roomData) {
		return null;
	}

	// 메시지 목록 조회
	const { data: messagesData } = await api.chat
		.rooms({ id: roomId })
		.messages.get({
			query: { limit: "50" },
		});

	// API 응답을 entity 타입으로 변환
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

	return {
		roomId: roomData.id,
		roomName: roomData.name,
		members,
		market,
		messages,
		currentUserId,
	};
}

export async function generateMetadata({
	params,
}: PageProps<"/chat/[roomId]">): Promise<Metadata> {
	const { roomId } = await params;
	const { data } = await api.chat.rooms({ id: roomId }).get();
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

	const data = await getChatRoomData(roomId, currentUser.id);
	if (!data) {
		notFound();
	}

	return (
		<ChatRoom
			roomId={data.roomId}
			roomName={data.roomName}
			members={data.members}
			market={data.market}
			initialMessages={data.messages}
			currentUserId={data.currentUserId}
		/>
	);
}
