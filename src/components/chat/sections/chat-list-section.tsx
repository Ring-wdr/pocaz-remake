import * as stylex from "@stylexjs/stylex";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import { MessageCircleHeart, User } from "lucide-react";
import Link from "next/link";

dayjs.extend(relativeTime);
dayjs.locale("ko");

const styles = stylex.create({
	container: {},
	item: {
		display: "flex",
		alignItems: "center",
		gap: "12px",
		paddingTop: "16px",
		paddingBottom: "16px",
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: "#f3f4f6",
		textDecoration: "none",
		color: "inherit",
	},
	avatar: {
		position: "relative",
		width: "52px",
		height: "52px",
		flexShrink: 0,
	},
	avatarImage: {
		width: "100%",
		height: "100%",
		borderRadius: "26px",
		objectFit: "cover",
		backgroundColor: "#f3f4f6",
	},
	onlineIndicator: {
		position: "absolute",
		bottom: "2px",
		right: "2px",
		width: "12px",
		height: "12px",
		borderRadius: "6px",
		backgroundColor: "#22c55e",
		borderWidth: 2,
		borderStyle: "solid",
		borderColor: "#fff",
	},
	content: {
		flex: 1,
		minWidth: 0,
	},
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: "4px",
	},
	nameWrap: {
		display: "flex",
		alignItems: "center",
		gap: "6px",
	},
	name: {
		fontSize: "15px",
		fontWeight: 600,
		color: "#111827",
		margin: 0,
	},
	productBadge: {
		fontSize: "11px",
		color: "#6b7280",
		backgroundColor: "#f3f4f6",
		paddingTop: "2px",
		paddingBottom: "2px",
		paddingLeft: "6px",
		paddingRight: "6px",
		borderRadius: "4px",
	},
	time: {
		fontSize: "12px",
		color: "#9ca3af",
	},
	messageWrap: {
		display: "flex",
		alignItems: "center",
		gap: "8px",
	},
	message: {
		flex: 1,
		fontSize: "14px",
		color: "#6b7280",
		margin: 0,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	unreadBadge: {
		minWidth: "20px",
		height: "20px",
		paddingLeft: "6px",
		paddingRight: "6px",
		borderRadius: "10px",
		backgroundColor: "#ef4444",
		color: "#fff",
		fontSize: "11px",
		fontWeight: 600,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
	},
	emptyState: {
		textAlign: "center",
		paddingTop: "64px",
		paddingBottom: "64px",
		color: "#9ca3af",
	},
	emptyIcon: {
		fontSize: "56px",
		marginBottom: "16px",
	},
	emptyTitle: {
		fontSize: "16px",
		fontWeight: 600,
		color: "#374151",
		margin: 0,
		marginBottom: "8px",
	},
	emptyText: {
		fontSize: "14px",
		margin: 0,
	},
});

export interface ChatRoom {
	id: string;
	partnerId: string;
	partnerName: string;
	partnerAvatar?: string;
	isOnline: boolean;
	productTitle?: string;
	lastMessage: string;
	lastMessageAt: string;
	unreadCount: number;
}

// TODO: Replace with actual API call
async function getChatRooms(): Promise<ChatRoom[]> {
	// Simulate delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	// Placeholder data
	return [
		{
			id: "1",
			partnerId: "user1",
			partnerName: "포카덕후",
			partnerAvatar: "https://placehold.co/104x104/fef3c7/d97706?text=P",
			isOnline: true,
			productTitle: "르세라핌 채원 포카",
			lastMessage: "안녕하세요! 혹시 포카 아직 있나요?",
			lastMessageAt: "2024-01-15T14:30:00",
			unreadCount: 2,
		},
		{
			id: "2",
			partnerId: "user2",
			partnerName: "아이브팬",
			partnerAvatar: "https://placehold.co/104x104/dbeafe/2563eb?text=A",
			isOnline: false,
			productTitle: "장원영 ELEVEN 포카",
			lastMessage: "네 결제 확인했습니다! 빠르게 보내드릴게요 ㅎㅎ",
			lastMessageAt: "2024-01-15T12:15:00",
			unreadCount: 0,
		},
		{
			id: "3",
			partnerId: "user3",
			partnerName: "뉴진스러버",
			partnerAvatar: "https://placehold.co/104x104/fce7f3/db2777?text=N",
			isOnline: true,
			productTitle: "하니 OMG 포카",
			lastMessage: "교환 가능하신가요?",
			lastMessageAt: "2024-01-14T18:45:00",
			unreadCount: 1,
		},
		{
			id: "4",
			partnerId: "user4",
			partnerName: "포카수집가",
			partnerAvatar: "https://placehold.co/104x104/d1fae5/059669?text=C",
			isOnline: false,
			lastMessage: "감사합니다! 잘 받았어요 😊",
			lastMessageAt: "2024-01-13T20:30:00",
			unreadCount: 0,
		},
		{
			id: "5",
			partnerId: "user5",
			partnerName: "카리나최고",
			isOnline: false,
			productTitle: "에스파 MY WORLD 포카",
			lastMessage: "혹시 가격 조정 가능하실까요?",
			lastMessageAt: "2024-01-12T10:00:00",
			unreadCount: 0,
		},
	];
}

function formatTime(dateStr: string): string {
	const date = dayjs(dateStr);
	const now = dayjs();

	if (date.isSame(now, "day")) {
		return date.format("HH:mm");
	}
	if (date.isSame(now.subtract(1, "day"), "day")) {
		return "어제";
	}
	if (date.isSame(now, "year")) {
		return date.format("MM.DD");
	}
	return date.format("YY.MM.DD");
}

export default async function ChatListSection() {
	const chatRooms = await getChatRooms();

	if (chatRooms.length === 0) {
		return (
			<div {...stylex.props(styles.emptyState)}>
				<MessageCircleHeart size={56} {...stylex.props(styles.emptyIcon)} />
				<h3 {...stylex.props(styles.emptyTitle)}>채팅방이 없습니다</h3>
				<p {...stylex.props(styles.emptyText)}>
					마켓에서 상품을 둘러보고 대화를 시작해보세요
				</p>
			</div>
		);
	}

	return (
		<div {...stylex.props(styles.container)}>
			{chatRooms.map((room) => (
				<Link
					key={room.id}
					href={`/chat/${room.id}`}
					{...stylex.props(styles.item)}
				>
					<div {...stylex.props(styles.avatar)}>
						{room.partnerAvatar ? (
							<img
								src={room.partnerAvatar}
								alt={room.partnerName}
								{...stylex.props(styles.avatarImage)}
							/>
						) : (
							<div {...stylex.props(styles.avatarImage)}>
								<User size={24} />
							</div>
						)}
						{room.isOnline && <div {...stylex.props(styles.onlineIndicator)} />}
					</div>
					<div {...stylex.props(styles.content)}>
						<div {...stylex.props(styles.header)}>
							<div {...stylex.props(styles.nameWrap)}>
								<h3 {...stylex.props(styles.name)}>{room.partnerName}</h3>
								{room.productTitle && (
									<span {...stylex.props(styles.productBadge)}>
										{room.productTitle}
									</span>
								)}
							</div>
							<span {...stylex.props(styles.time)}>
								{formatTime(room.lastMessageAt)}
							</span>
						</div>
						<div {...stylex.props(styles.messageWrap)}>
							<p {...stylex.props(styles.message)}>{room.lastMessage}</p>
							{room.unreadCount > 0 && (
								<span {...stylex.props(styles.unreadBadge)}>
									{room.unreadCount}
								</span>
							)}
						</div>
					</div>
				</Link>
			))}
		</div>
	);
}
