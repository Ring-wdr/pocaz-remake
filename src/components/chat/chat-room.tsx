"use client";

import * as stylex from "@stylexjs/stylex";
import dayjs from "dayjs";
import { ArrowLeft, MoreVertical, Plus, Send } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
	colors,
	fontSize,
	fontWeight,
	lineHeight,
	radius,
	size,
	spacing,
} from "@/app/global-tokens.stylex";
import type {
	ChatMarketInfo,
	ChatMember,
	ChatMessage,
} from "@/types/entities";
import { api } from "@/utils/eden";
import { useChatPresence, useChatRealtime } from "@/lib/hooks/use-chat-realtime";

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
		gap: spacing.xs,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
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
		fontSize: fontSize.xl,
		textDecoration: "none",
	},
	partnerInfo: {
		flex: 1,
		display: "flex",
		alignItems: "center",
		gap: spacing.xxs,
	},
	avatar: {
		width: size.touchTarget,
		height: size.touchTarget,
		borderRadius: radius.lg,
		objectFit: "cover",
		backgroundColor: colors.bgTertiary,
	},
	partnerName: {
		fontSize: fontSize.base,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
		margin: 0,
	},
	memberCount: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
		margin: 0,
	},
	onlineBadge: {
		display: "inline-flex",
		alignItems: "center",
		gap: spacing.xxxs,
		paddingTop: spacing.xxxs,
		paddingBottom: spacing.xxxs,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		fontSize: fontSize.sm,
		color: colors.statusSuccess,
		backgroundColor: colors.statusSuccessBg,
		borderRadius: radius.sm,
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
		gap: spacing.xxs,
		paddingTop: spacing.xxs,
		paddingBottom: spacing.xxs,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
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
		borderRadius: radius.sm,
		objectFit: "cover",
		backgroundColor: colors.bgTertiary,
	},
	productInfo: {
		flex: 1,
	},
	productTitle: {
		fontSize: "13px",
		fontWeight: fontWeight.medium,
		color: colors.textSecondary,
		margin: 0,
		marginBottom: "2px",
	},
	productPrice: {
		fontSize: fontSize.md,
		fontWeight: fontWeight.bold,
		color: colors.textPrimary,
		margin: 0,
	},
	productStatus: {
		fontSize: "11px",
		fontWeight: fontWeight.semibold,
		color: colors.accentPrimary,
		backgroundColor: colors.accentPrimaryBg,
		paddingTop: spacing.xxxs,
		paddingBottom: spacing.xxxs,
		paddingLeft: spacing.xxs,
		paddingRight: spacing.xxs,
		borderRadius: radius.xs,
	},
	messages: {
		flex: 1,
		overflowY: "auto",
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
	},
	dateGroup: {
		textAlign: "center",
		marginBottom: spacing.sm,
	},
	dateBadge: {
		display: "inline-block",
		fontSize: fontSize.sm,
		color: colors.textMuted,
		backgroundColor: colors.borderPrimary,
		paddingTop: spacing.xxxs,
		paddingBottom: spacing.xxxs,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		borderRadius: radius.md,
	},
	messageRow: {
		display: "flex",
		marginBottom: spacing.xxs,
	},
	messageRowMine: {
		justifyContent: "flex-end",
	},
	messageRowTheirs: {
		justifyContent: "flex-start",
	},
	messageBubble: {
		maxWidth: "70%",
		paddingTop: spacing.xxs,
		paddingBottom: spacing.xxs,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		borderRadius: "16px",
		fontSize: fontSize.md,
		lineHeight: lineHeight.normal,
	},
	bubbleMine: {
		backgroundColor: colors.bgInverse,
		color: colors.textInverse,
		borderBottomRightRadius: radius.xs,
	},
	bubbleTheirs: {
		backgroundColor: colors.bgPrimary,
		color: colors.textSecondary,
		borderBottomLeftRadius: radius.xs,
	},
	messageTime: {
		fontSize: "11px",
		color: colors.textPlaceholder,
		marginTop: spacing.xxxs,
		marginLeft: spacing.xxs,
		marginRight: spacing.xxs,
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
		gap: spacing.xxs,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		backgroundColor: colors.bgPrimary,
		borderTopWidth: 1,
		borderTopStyle: "solid",
		borderTopColor: colors.borderPrimary,
	},
	attachButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: size.touchTarget,
		height: size.touchTarget,
		backgroundColor: colors.bgTertiary,
		borderRadius: radius.lg,
		borderWidth: 0,
		cursor: "pointer",
		color: colors.textMuted,
		fontSize: "20px",
	},
	inputWrap: {
		flex: 1,
		display: "flex",
		alignItems: "center",
		paddingTop: spacing.xxs,
		paddingBottom: spacing.xxs,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		backgroundColor: colors.bgTertiary,
		borderRadius: radius.lg,
	},
	input: {
		flex: 1,
		fontSize: fontSize.md,
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
		width: size.touchTarget,
		height: size.touchTarget,
		backgroundColor: colors.bgInverse,
		borderRadius: radius.lg,
		borderWidth: 0,
		cursor: "pointer",
		color: colors.textInverse,
		fontSize: fontSize.lg,
	},
	sendButtonDisabled: {
		backgroundColor: colors.borderPrimary,
		cursor: "default",
	},
});

interface ChatRoomProps {
	roomId: string;
	roomName: string | null;
	members: ChatMember[];
	market: ChatMarketInfo | null;
	initialMessages: ChatMessage[];
	currentUserId: string;
}

export default function ChatRoom({
	roomId,
	roomName,
	members,
	market,
	initialMessages,
	currentUserId,
}: ChatRoomProps) {
	const [messages, setMessages] = useState(initialMessages);
	const [inputValue, setInputValue] = useState("");
	const [isSending, setIsSending] = useState(false);
	const messagesRef = useRef<HTMLDivElement | null>(null);

	const currentUser = useMemo(
		() => members.find((m) => m.id === currentUserId) ?? members[0],
		[currentUserId, members],
	);

	// 상대방 찾기 (1:1 채팅 기준)
	const partner = members.find((m) => m.id !== currentUserId) ?? members[0];
	const displayName = roomName || partner?.nickname || "채팅방";

	const scrollToBottom = () => {
		const el = messagesRef.current;
		if (!el) return;
		requestAnimationFrame(() => {
			el.scrollTop = el.scrollHeight;
		});
	};

	const handleSend = () => {
		const content = inputValue.trim();
		if (!content || isSending) return;

		const tempId = `temp-${Date.now()}`;
		const optimisticMessage: ChatMessage = {
			id: tempId,
			content,
			createdAt: new Date().toISOString(),
			user: {
				id: currentUserId,
				nickname: currentUser?.nickname ?? "나",
				profileImage: currentUser?.profileImage ?? null,
			},
		};

		setMessages((prev) => [...prev, optimisticMessage]);
		setInputValue("");
		setIsSending(true);

		api.chat
			.rooms({ id: roomId })
			.messages.post({ content })
			.then(({ data, error }) => {
				if (error || !data) {
					setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
					toast.error("메시지 전송에 실패했습니다.");
					return;
				}

				setMessages((prev) =>
					prev.map((msg) => (msg.id === tempId ? data : msg)),
				);
			})
			.catch((error) => {
				console.error(error);
				setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
				toast.error("메시지 전송에 실패했습니다.");
			})
			.finally(() => setIsSending(false));
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleIncomingMessage = (message: ChatMessage) => {
		setMessages((prev) => {
			const exists = prev.some((m) => m.id === message.id);
			if (exists) return prev;
			return [...prev, message];
		});
	};

	const { onlineUsers } = useChatPresence(roomId, currentUserId, {
		nickname: currentUser?.nickname ?? "나",
		profileImage: currentUser?.profileImage ?? null,
	});

	useChatRealtime(roomId, handleIncomingMessage);

	useEffect(() => {
		setMessages(initialMessages);
	}, [initialMessages]);

	useEffect(() => {
		scrollToBottom();
	}, [messages.length]);

	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.header)}>
				<Link href="/chat/list" {...stylex.props(styles.backButton)}>
					<ArrowLeft size={24} />
				</Link>
		<div {...stylex.props(styles.partnerInfo)}>
			{partner?.profileImage ? (
				<img
					src={partner.profileImage}
					alt={displayName}
					{...stylex.props(styles.avatar)}
				/>
			) : (
				<div {...stylex.props(styles.avatar)} />
			)}
			<div>
				<h2 {...stylex.props(styles.partnerName)}>{displayName}</h2>
				<div {...stylex.props(styles.memberCount)}>
					{members.length > 2 && `${members.length}명 참여`}
					{onlineUsers.length > 0 && (
						<span {...stylex.props(styles.onlineBadge)}>
							• 온라인 {onlineUsers.length}
						</span>
					)}
				</div>
			</div>
		</div>
				<button type="button" {...stylex.props(styles.menuButton)}>
					<MoreVertical size={20} />
				</button>
			</div>

			{market && (
				<Link
					href={`/market/${market.id}`}
					{...stylex.props(styles.productBanner)}
				>
					{market.thumbnail && (
						<img
							src={market.thumbnail}
							alt={market.title}
							{...stylex.props(styles.productImage)}
						/>
					)}
					<div {...stylex.props(styles.productInfo)}>
						<p {...stylex.props(styles.productTitle)}>{market.title}</p>
						<p {...stylex.props(styles.productPrice)}>
							{market.price ? `${market.price.toLocaleString()}원` : "가격협의"}
						</p>
					</div>
					<span {...stylex.props(styles.productStatus)}>{market.status}</span>
				</Link>
			)}

		<div ref={messagesRef} {...stylex.props(styles.messages)}>
				<div {...stylex.props(styles.dateGroup)}>
					<span {...stylex.props(styles.dateBadge)}>오늘</span>
				</div>
				{messages.map((message) => {
					const isMine = message.user.id === currentUserId;
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
			disabled={!inputValue.trim() || isSending}
			{...stylex.props(
				styles.sendButton,
				(!inputValue.trim() || isSending) && styles.sendButtonDisabled,
			)}
		>
			<Send size={18} />
		</button>
			</div>
		</div>
	);
}
