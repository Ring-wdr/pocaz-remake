"use client";

import * as stylex from "@stylexjs/stylex";
import dayjs from "dayjs";
import { ArrowLeft, MoreVertical, Plus, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { colors } from "@/app/global-tokens.stylex";

const styles = stylex.create({
	container: {
		display: "flex",
		flexDirection: "column",
		height: "100vh",
		backgroundColor: colors.bgSecondary,
	},
	header: {
		display: "flex",
		alignItems: "center",
		gap: "12px",
		paddingTop: "12px",
		paddingBottom: "12px",
		paddingLeft: "14px",
		paddingRight: "14px",
		backgroundColor: colors.bgPrimary,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
	},
	backButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "36px",
		height: "36px",
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
		color: colors.textTertiary,
		fontSize: "24px",
		textDecoration: "none",
	},
	partnerInfo: {
		flex: 1,
		display: "flex",
		alignItems: "center",
		gap: "10px",
	},
	avatar: {
		width: "40px",
		height: "40px",
		borderRadius: "20px",
		objectFit: "cover",
		backgroundColor: colors.bgTertiary,
	},
	partnerName: {
		fontSize: "16px",
		fontWeight: 600,
		color: colors.textSecondary,
		margin: 0,
	},
	onlineStatus: {
		fontSize: "12px",
		color: colors.statusSuccess,
		margin: 0,
	},
	menuButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "36px",
		height: "36px",
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
		color: colors.textTertiary,
		fontSize: "20px",
	},
	productBanner: {
		display: "flex",
		alignItems: "center",
		gap: "10px",
		paddingTop: "10px",
		paddingBottom: "10px",
		paddingLeft: "14px",
		paddingRight: "14px",
		backgroundColor: colors.bgPrimary,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
		textDecoration: "none",
		color: "inherit",
	},
	productImage: {
		width: "44px",
		height: "44px",
		borderRadius: "8px",
		objectFit: "cover",
		backgroundColor: colors.bgTertiary,
	},
	productInfo: {
		flex: 1,
	},
	productTitle: {
		fontSize: "13px",
		fontWeight: 500,
		color: colors.textSecondary,
		margin: 0,
		marginBottom: "2px",
	},
	productPrice: {
		fontSize: "14px",
		fontWeight: 700,
		color: colors.textPrimary,
		margin: 0,
	},
	productStatus: {
		fontSize: "11px",
		fontWeight: 600,
		color: colors.accentPrimary,
		backgroundColor: colors.accentPrimaryBg,
		paddingTop: "4px",
		paddingBottom: "4px",
		paddingLeft: "8px",
		paddingRight: "8px",
		borderRadius: "4px",
	},
	messages: {
		flex: 1,
		overflowY: "auto",
		paddingTop: "16px",
		paddingBottom: "16px",
		paddingLeft: "14px",
		paddingRight: "14px",
	},
	dateGroup: {
		textAlign: "center",
		marginBottom: "16px",
	},
	dateBadge: {
		display: "inline-block",
		fontSize: "12px",
		color: colors.textMuted,
		backgroundColor: colors.borderPrimary,
		paddingTop: "4px",
		paddingBottom: "4px",
		paddingLeft: "12px",
		paddingRight: "12px",
		borderRadius: "12px",
	},
	messageRow: {
		display: "flex",
		marginBottom: "8px",
	},
	messageRowMine: {
		justifyContent: "flex-end",
	},
	messageRowTheirs: {
		justifyContent: "flex-start",
	},
	messageBubble: {
		maxWidth: "70%",
		paddingTop: "10px",
		paddingBottom: "10px",
		paddingLeft: "14px",
		paddingRight: "14px",
		borderRadius: "16px",
		fontSize: "14px",
		lineHeight: 1.5,
	},
	bubbleMine: {
		backgroundColor: colors.bgInverse,
		color: colors.textInverse,
		borderBottomRightRadius: "4px",
	},
	bubbleTheirs: {
		backgroundColor: colors.bgPrimary,
		color: colors.textSecondary,
		borderBottomLeftRadius: "4px",
	},
	messageTime: {
		fontSize: "11px",
		color: colors.textPlaceholder,
		marginTop: "4px",
		marginLeft: "8px",
		marginRight: "8px",
	},
	messageTimeMine: {
		textAlign: "right",
	},
	messageTimeTheirs: {
		textAlign: "left",
	},
	inputArea: {
		display: "flex",
		alignItems: "center",
		gap: "8px",
		paddingTop: "12px",
		paddingBottom: "12px",
		paddingLeft: "14px",
		paddingRight: "14px",
		backgroundColor: colors.bgPrimary,
		borderTopWidth: 1,
		borderTopStyle: "solid",
		borderTopColor: colors.borderPrimary,
	},
	attachButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "40px",
		height: "40px",
		backgroundColor: colors.bgTertiary,
		borderRadius: "20px",
		borderWidth: 0,
		cursor: "pointer",
		color: colors.textMuted,
		fontSize: "20px",
	},
	inputWrap: {
		flex: 1,
		display: "flex",
		alignItems: "center",
		paddingTop: "10px",
		paddingBottom: "10px",
		paddingLeft: "14px",
		paddingRight: "14px",
		backgroundColor: colors.bgTertiary,
		borderRadius: "20px",
	},
	input: {
		flex: 1,
		fontSize: "14px",
		backgroundColor: "transparent",
		borderWidth: 0,
		outline: "none",
		color: colors.textSecondary,
		"::placeholder": {
			color: colors.textPlaceholder,
		},
	},
	sendButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "40px",
		height: "40px",
		backgroundColor: colors.bgInverse,
		borderRadius: "20px",
		borderWidth: 0,
		cursor: "pointer",
		color: colors.textInverse,
		fontSize: "18px",
	},
	sendButtonDisabled: {
		backgroundColor: colors.borderPrimary,
		cursor: "default",
	},
});

interface Message {
	id: string;
	senderId: string;
	content: string;
	createdAt: string;
}

interface ChatRoomProps {
	roomId: string;
	partner: {
		id: string;
		name: string;
		avatar?: string;
		isOnline: boolean;
	};
	product?: {
		id: number;
		title: string;
		price: number;
		image: string;
		status: string;
	};
	messages: Message[];
	currentUserId: string;
}

export default function ChatRoom({
	roomId,
	partner,
	product,
	messages: initialMessages,
	currentUserId,
}: ChatRoomProps) {
	const [messages, setMessages] = useState(initialMessages);
	const [inputValue, setInputValue] = useState("");

	const handleSend = () => {
		if (!inputValue.trim()) return;

		const newMessage: Message = {
			id: String(Date.now()),
			senderId: currentUserId,
			content: inputValue.trim(),
			createdAt: new Date().toISOString(),
		};

		setMessages([...messages, newMessage]);
		setInputValue("");
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.header)}>
				<Link href="/chat/list" {...stylex.props(styles.backButton)}>
					<ArrowLeft size={24} />
				</Link>
				<div {...stylex.props(styles.partnerInfo)}>
					{partner.avatar ? (
						<img
							src={partner.avatar}
							alt={partner.name}
							{...stylex.props(styles.avatar)}
						/>
					) : (
						<div {...stylex.props(styles.avatar)} />
					)}
					<div>
						<h2 {...stylex.props(styles.partnerName)}>{partner.name}</h2>
						{partner.isOnline && (
							<p {...stylex.props(styles.onlineStatus)}>온라인</p>
						)}
					</div>
				</div>
				<button type="button" {...stylex.props(styles.menuButton)}>
					<MoreVertical size={20} />
				</button>
			</div>

			{product && (
				<Link
					href={`/market/${product.id}`}
					{...stylex.props(styles.productBanner)}
				>
					<img
						src={product.image}
						alt={product.title}
						{...stylex.props(styles.productImage)}
					/>
					<div {...stylex.props(styles.productInfo)}>
						<p {...stylex.props(styles.productTitle)}>{product.title}</p>
						<p {...stylex.props(styles.productPrice)}>
							{product.price.toLocaleString()}원
						</p>
					</div>
					<span {...stylex.props(styles.productStatus)}>{product.status}</span>
				</Link>
			)}

			<div {...stylex.props(styles.messages)}>
				<div {...stylex.props(styles.dateGroup)}>
					<span {...stylex.props(styles.dateBadge)}>오늘</span>
				</div>
				{messages.map((message) => {
					const isMine = message.senderId === currentUserId;
					return (
						<div key={message.id}>
							<div
								{...stylex.props(
									styles.messageRow,
									isMine ? styles.messageRowMine : styles.messageRowTheirs,
								)}
							>
								<div
									{...stylex.props(
										styles.messageBubble,
										isMine ? styles.bubbleMine : styles.bubbleTheirs,
									)}
								>
									{message.content}
								</div>
							</div>
							<div
								{...stylex.props(
									styles.messageTime,
									isMine ? styles.messageTimeMine : styles.messageTimeTheirs,
								)}
							>
								{dayjs(message.createdAt).format("HH:mm")}
							</div>
						</div>
					);
				})}
			</div>

			<div {...stylex.props(styles.inputArea)}>
				<button type="button" {...stylex.props(styles.attachButton)}>
					<Plus size={20} />
				</button>
				<div {...stylex.props(styles.inputWrap)}>
					<input
						type="text"
						placeholder="메시지를 입력하세요"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyPress={handleKeyPress}
						{...stylex.props(styles.input)}
					/>
				</div>
				<button
					type="button"
					onClick={handleSend}
					{...stylex.props(
						styles.sendButton,
						!inputValue.trim() && styles.sendButtonDisabled,
					)}
				>
					<Send size={18} />
				</button>
			</div>
		</div>
	);
}
