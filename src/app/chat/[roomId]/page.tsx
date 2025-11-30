import { ChatRoom } from "@/components/chat";

interface ChatRoomPageProps {
	params: Promise<{
		roomId: string;
	}>;
}

// TODO: Replace with actual API call
async function getChatRoomData(roomId: string) {
	// Simulate delay
	await new Promise((resolve) => setTimeout(resolve, 300));

	// Placeholder data
	return {
		roomId,
		partner: {
			id: "user1",
			name: "포카덕후",
			avatar: "https://placehold.co/80x80/fef3c7/d97706?text=P",
			isOnline: true,
		},
		product: {
			id: 1,
			title: "르세라핌 김채원 UNFORGIVEN 포카",
			price: 25000,
			image: "https://placehold.co/88x88/fce7f3/db2777?text=PC",
			status: "판매중",
		},
		messages: [
			{
				id: "1",
				senderId: "user1",
				content: "안녕하세요! 혹시 포카 아직 있나요?",
				createdAt: "2024-01-15T14:00:00",
			},
			{
				id: "2",
				senderId: "me",
				content: "네 아직 있어요! 관심 가져주셔서 감사합니다 ㅎㅎ",
				createdAt: "2024-01-15T14:05:00",
			},
			{
				id: "3",
				senderId: "user1",
				content: "혹시 직거래도 가능할까요? 서울이에요",
				createdAt: "2024-01-15T14:10:00",
			},
			{
				id: "4",
				senderId: "me",
				content: "저도 서울이라 가능해요! 어디쪽이세요?",
				createdAt: "2024-01-15T14:12:00",
			},
			{
				id: "5",
				senderId: "user1",
				content: "강남쪽이요! 혹시 강남역 근처 가능하실까요?",
				createdAt: "2024-01-15T14:15:00",
			},
		],
		currentUserId: "me",
	};
}

export default async function ChatRoomPage({ params }: ChatRoomPageProps) {
	const { roomId } = await params;
	const data = await getChatRoomData(roomId);

	return (
		<ChatRoom
			roomId={data.roomId}
			partner={data.partner}
			product={data.product}
			messages={data.messages}
			currentUserId={data.currentUserId}
		/>
	);
}
