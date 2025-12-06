"use client";

import * as stylex from "@stylexjs/stylex";
import dayjs from "dayjs";
import {
	AlertCircle,
	ArrowLeft,
	DoorOpen,
	MoreVertical,
	Plus,
	RefreshCw,
	Send,
	X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
	preCacheUsers,
	useChatPresence,
	useChatRealtime,
} from "@/lib/hooks/use-chat-realtime";
import type { ChatMarketInfo, ChatMember, ChatMessage } from "@/types/entities";
import { api } from "@/utils/eden";

/** 실패한 메시지 추적을 위한 확장 타입 */
interface ChatMessageWithStatus extends ChatMessage {
	status?: "sending" | "sent" | "failed";
	retryCount?: number;
}

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
		display: "flex",
		alignItems: "center",
		gap: spacing.xxs,
		fontSize: fontSize.sm,
		color: colors.textMuted,
		margin: 0,
		minHeight: "20px",
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
		position: "sticky",
		bottom: size.bottomMenuHeight,
		left: 0,
		right: 0,
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
		zIndex: 10,
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
	// 실패 메시지 스타일
	failedMessageContainer: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-end",
	},
	failedBubble: {
		backgroundColor: colors.statusErrorBg,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.statusError,
	},
	failedActions: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxs,
		marginTop: spacing.xxxs,
	},
	failedText: {
		fontSize: fontSize.sm,
		color: colors.statusError,
		display: "flex",
		alignItems: "center",
		gap: spacing.xxxs,
	},
	retryButton: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxxs,
		paddingTop: spacing.xxxs,
		paddingBottom: spacing.xxxs,
		paddingLeft: spacing.xxs,
		paddingRight: spacing.xxs,
		fontSize: fontSize.sm,
		color: colors.accentPrimary,
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
	},
	// 메뉴 관련 스타일
	menuOverlay: {
		position: "fixed",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		display: "flex",
		alignItems: "flex-end",
		justifyContent: "center",
		zIndex: 100,
	},
	menuSheet: {
		width: "100%",
		maxWidth: "500px",
		backgroundColor: colors.bgPrimary,
		borderTopLeftRadius: radius.lg,
		borderTopRightRadius: radius.lg,
		paddingTop: spacing.sm,
		paddingBottom: spacing.lg,
	},
	menuHandle: {
		width: "40px",
		height: "4px",
		backgroundColor: colors.borderSecondary,
		borderRadius: radius.sm,
		margin: "0 auto",
		marginBottom: spacing.sm,
	},
	menuItem: {
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
		width: "100%",
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.md,
		paddingRight: spacing.md,
		fontSize: fontSize.base,
		color: colors.textSecondary,
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
		textAlign: "left",
	},
	menuItemDanger: {
		color: colors.statusError,
	},
	// 전송중 상태 스타일
	sendingIndicator: {
		fontSize: "11px",
		color: colors.textPlaceholder,
		fontStyle: "italic",
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

const MAX_RETRY_COUNT = 3;

export default function ChatRoom({
	roomId,
	roomName,
	members,
	market,
	initialMessages,
	currentUserId,
}: ChatRoomProps) {
	const router = useRouter();
	const [messages, setMessages] =
		useState<ChatMessageWithStatus[]>(initialMessages);
	const [inputValue, setInputValue] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isLeaving, setIsLeaving] = useState(false);
	const messagesRef = useRef<HTMLDivElement | null>(null);

	const currentUser = useMemo(
		() => members.find((m) => m.id === currentUserId) ?? members[0],
		[currentUserId, members],
	);

	// 상대방 찾기 (1:1 채팅 기준)
	const partner = members.find((m) => m.id !== currentUserId) ?? members[0];
	const displayName = roomName || partner?.nickname || "채팅방";

	const scrollToBottom = useCallback(() => {
		const el = messagesRef.current;
		if (!el) return;
		requestAnimationFrame(() => {
			el.scrollTop = el.scrollHeight;
		});
	}, []);

	/** 메시지 전송 함수 (재시도 포함) */
	const sendMessage = useCallback(
		async (content: string, existingTempId?: string, retryCount = 0) => {
			const tempId = existingTempId || `temp-${Date.now()}`;

			// 새 메시지인 경우 optimistic 추가
			if (!existingTempId) {
				const optimisticMessage: ChatMessageWithStatus = {
					id: tempId,
					content,
					createdAt: new Date().toISOString(),
					user: {
						id: currentUserId,
						nickname: currentUser?.nickname ?? "나",
						profileImage: currentUser?.profileImage ?? null,
					},
					status: "sending",
					retryCount: 0,
				};
				setMessages((prev) => [...prev, optimisticMessage]);
			} else {
				// 재시도인 경우 상태만 업데이트
				setMessages((prev) =>
					prev.map((msg) =>
						msg.id === tempId
							? { ...msg, status: "sending" as const, retryCount }
							: msg,
					),
				);
			}

			try {
				const { data, error } = await api.chat
					.rooms({ id: roomId })
					.messages.post({ content });

				if (error || !data) {
					throw new Error("메시지 전송 실패");
				}

				// 성공시 메시지 교체
				setMessages((prev) =>
					prev.map((msg) =>
						msg.id === tempId
							? { ...(data as ChatMessage), status: "sent" as const }
							: msg,
					),
				);
			} catch (err) {
				console.error("Message send error:", err);

				// 실패 상태로 업데이트
				setMessages((prev) =>
					prev.map((msg) =>
						msg.id === tempId
							? { ...msg, status: "failed" as const, retryCount }
							: msg,
					),
				);

				if (retryCount === 0) {
					toast.error("메시지 전송에 실패했습니다. 다시 시도해주세요.");
				}
			}
		},
		[roomId, currentUserId, currentUser],
	);

	const handleSend = () => {
		const content = inputValue.trim();
		if (!content || isSending) return;

		setInputValue("");
		setIsSending(true);
		sendMessage(content).finally(() => setIsSending(false));
	};

	/** 실패한 메시지 재시도 */
	const handleRetry = useCallback(
		(message: ChatMessageWithStatus) => {
			const newRetryCount = (message.retryCount ?? 0) + 1;

			if (newRetryCount > MAX_RETRY_COUNT) {
				toast.error("최대 재시도 횟수를 초과했습니다. 메시지를 삭제해주세요.");
				return;
			}

			toast.info(`재시도 중... (${newRetryCount}/${MAX_RETRY_COUNT})`);
			sendMessage(message.content, message.id, newRetryCount);
		},
		[sendMessage],
	);

	/** 실패한 메시지 삭제 */
	const handleDeleteFailed = useCallback((messageId: string) => {
		setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
		toast.success("메시지가 삭제되었습니다.");
	}, []);

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleIncomingMessage = useCallback((message: ChatMessage) => {
		setMessages((prev) => {
			const exists = prev.some((m) => m.id === message.id);
			if (exists) return prev;
			return [...prev, { ...message, status: "sent" as const }];
		});
	}, []);

	/** 채팅방 나가기 */
	const handleLeaveRoom = async () => {
		if (isLeaving) return;

		const confirmed = window.confirm(
			"정말 채팅방을 나가시겠습니까? 대화 내용은 복구할 수 없습니다.",
		);
		if (!confirmed) return;

		setIsLeaving(true);
		try {
			const { error } = await api.chat.rooms({ id: roomId }).leave.delete();

			if (error) {
				throw new Error("채팅방 나가기 실패");
			}

			toast.success("채팅방을 나갔습니다.");
			router.push("/chat/list");
		} catch (err) {
			console.error("Leave room error:", err);
			toast.error("채팅방 나가기에 실패했습니다.");
		} finally {
			setIsLeaving(false);
			setIsMenuOpen(false);
		}
	};

	const { onlineUsers } = useChatPresence(roomId, currentUserId, {
		nickname: currentUser?.nickname ?? "나",
		profileImage: currentUser?.profileImage ?? null,
	});

	useChatRealtime(roomId, handleIncomingMessage);

	// 채팅방 멤버를 캐시에 미리 등록 (realtime 메시지 수신 시 추가 fetch 방지)
	useEffect(() => {
		preCacheUsers(
			members.map((m) => ({
				id: m.id,
				nickname: m.nickname,
				profileImage: m.profileImage,
			})),
		);
	}, [members]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: message change by realtime api
	useEffect(() => {
		scrollToBottom();
	}, [scrollToBottom, messages.length]);

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
				<button
					type="button"
					onClick={() => setIsMenuOpen(true)}
					{...stylex.props(styles.menuButton)}
				>
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
					const isFailed = message.status === "failed";
					const isSendingMsg = message.status === "sending";

					return (
						<div key={message.id}>
							<div
								{...stylex.props(
									styles.messageRow,
									isMine ? styles.messageRowMine : styles.messageRowTheirs,
									isFailed && styles.failedMessageContainer,
								)}
							>
								<div
									{...stylex.props(
										styles.messageBubble,
										isMine ? styles.bubbleMine : styles.bubbleTheirs,
										isFailed && styles.failedBubble,
									)}
								>
									{message.content}
								</div>
							</div>

							{/* 전송 중 표시 */}
							{isSendingMsg && isMine && (
								<div
									{...stylex.props(styles.messageTime, styles.messageTimeMine)}
								>
									<span {...stylex.props(styles.sendingIndicator)}>
										전송 중...
									</span>
								</div>
							)}

							{/* 실패 메시지 액션 */}
							{isFailed && isMine && (
								<div {...stylex.props(styles.failedActions)}>
									<span {...stylex.props(styles.failedText)}>
										<AlertCircle size={12} />
										전송 실패
									</span>
									<button
										type="button"
										onClick={() => handleRetry(message)}
										{...stylex.props(styles.retryButton)}
									>
										<RefreshCw size={12} />
										재시도
									</button>
									<button
										type="button"
										onClick={() => handleDeleteFailed(message.id)}
										{...stylex.props(styles.retryButton)}
									>
										<X size={12} />
										삭제
									</button>
								</div>
							)}

							{/* 일반 메시지 시간 표시 */}
							{!isSendingMsg && !isFailed && (
								<div
									{...stylex.props(
										styles.messageTime,
										isMine ? styles.messageTimeMine : styles.messageTimeTheirs,
									)}
								>
									{dayjs(message.createdAt).format("HH:mm")}
								</div>
							)}
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

			{/* 메뉴 바텀 시트 */}
			{isMenuOpen && (
				<div
					role="dialog"
					aria-modal="true"
					aria-label="채팅방 메뉴"
					{...stylex.props(styles.menuOverlay)}
					onClick={() => setIsMenuOpen(false)}
					onKeyDown={(e) => e.key === "Escape" && setIsMenuOpen(false)}
				>
					<div
						role="menu"
						{...stylex.props(styles.menuSheet)}
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
					>
						<div {...stylex.props(styles.menuHandle)} />
						<button
							type="button"
							onClick={handleLeaveRoom}
							disabled={isLeaving}
							{...stylex.props(styles.menuItem, styles.menuItemDanger)}
						>
							<DoorOpen size={20} />
							{isLeaving ? "나가는 중..." : "채팅방 나가기"}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
