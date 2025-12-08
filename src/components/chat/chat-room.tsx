"use client";

import * as stylex from "@stylexjs/stylex";
import dayjs from "dayjs";
import {
	AlertCircle,
	ArrowLeft,
	MoreVertical,
	Plus,
	Send,
	X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { VirtuosoHandle } from "react-virtuoso";
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
import { confirmAction } from "@/components/ui";
import { useChatMessages } from "@/lib/hooks/use-chat-messages";
import { preCacheUsers, useChatPresence } from "@/lib/hooks/use-chat-realtime";
import type {
	ChatMarketInfo,
	ChatMember,
	PaginatedMessages,
} from "@/types/entities";
import { api } from "@/utils/eden";
import { ChatMessageList } from "./chat-message-list";
import { OnlineStatusBadge } from "./online-status-badge";
import { openChatRoomMenu } from "./open-chat-room-menu";

const styles = stylex.create({
	container: {
		display: "flex",
		flexDirection: "column",
		flex: 1,
		minHeight: 0,
		height: "100%",
		maxHeight: stylex.firstThatWorks(
			`calc(100dvh - ${size.bottomMenuHeight})`,
			`calc(100vh - ${size.bottomMenuHeight})`,
		),
		overflow: "hidden",
		backgroundColor: colors.bgSecondary,
	},
	topSection: {
		position: "sticky",
		top: 0,
		zIndex: 10,
		backgroundColor: colors.bgPrimary,
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
		minHeight: 0,
		display: "flex",
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		position: "relative",
	},
	messagesList: {
		flex: 1,
		minHeight: 0,
		width: "100%",
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
		bottom: 0,
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
	// 전송중 상태 스타일
	sendingIndicator: {
		fontSize: "11px",
		color: colors.textPlaceholder,
		fontStyle: "italic",
	},
	newMessageBadge: {
		position: "absolute",
		left: "50%",
		transform: "translateX(-50%)",
		bottom: spacing.sm,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderRadius: radius.full,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		backgroundColor: colors.bgPrimary,
		color: colors.textPrimary,
		boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
		fontWeight: fontWeight.semibold,
		cursor: "pointer",
		display: "flex",
		gap: spacing.xs,
		alignItems: "center",
	},
});

interface ChatRoomProps {
	roomId: string;
	roomName: string | null;
	members: ChatMember[];
	market: ChatMarketInfo | null;
	initialPage: PaginatedMessages;
	currentUserId: string;
}

export default function ChatRoom({
	roomId,
	roomName,
	members,
	market,
	initialPage,
	currentUserId,
}: ChatRoomProps) {
	const router = useRouter();
	const [inputValue, setInputValue] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [isLeaving, setIsLeaving] = useState(false);
	const messagesRef = useRef<VirtuosoHandle | null>(null);

	const {
		items: messages,
		hasPrev,
		isFetchingPrev,
		fetchPrev,
		isAtBottom,
		setIsAtBottom,
		newMessageCount,
		resetNewMessageCount,
		appendLocal,
		markAsSent,
		markAsFailed,
		removePending,
	} = useChatMessages({
		roomId,
		initialPage,
		currentUserId,
	});

	useEffect(() => {
		if (isAtBottom && messagesRef.current) {
			messagesRef.current.scrollToIndex({
				index: Math.max(messages.length - 1, 0),
				behavior: "auto",
			});
		}
	}, [messages.length, isAtBottom]);

	const currentUser = members.find((m) => m.id === currentUserId) ?? members[0];

	// 상대방 찾기 (1:1 채팅 기준)
	const partner = members.find((m) => m.id !== currentUserId) ?? members[0];
	const displayName = roomName || partner?.nickname || "채팅방";

	/** 메시지 전송 함수 (재시도 포함) */
	const sendMessage = useCallback(
		async (content: string, clientId?: string) => {
			const isRetry = Boolean(clientId);
			const targetClientId = clientId ?? appendLocal(content).clientId;

			try {
				const { data, error } = await api.chat
					.rooms({ id: roomId })
					.messages.post({ content });

				if (error || !data || typeof data !== "object" || !data.id) {
					toast.error("메시지 전송 실패");
					markAsFailed(targetClientId);
					return;
				}

				markAsSent(targetClientId, data);
			} catch (err) {
				console.error("Message send error:", err);
				markAsFailed(targetClientId);
				if (!isRetry) {
					toast.error("메시지 전송에 실패했습니다. 다시 시도해주세요.");
				}
			}
		},
		[roomId, appendLocal, markAsFailed, markAsSent],
	);

	const handleSend = () => {
		const content = inputValue.trim();
		if (!content || isSending) return;

		setInputValue("");
		setIsSending(true);
		sendMessage(content).finally(() => setIsSending(false));
	};

	/** 실패한 메시지 삭제 */
	const handleDeleteFailed = useCallback(
		(clientId: string) => {
			removePending(clientId);
			toast.success("메시지가 삭제되었습니다.");
		},
		[removePending],
	);

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	/** 메뉴 열기 */
	const handleOpenMenu = async () => {
		const action = await openChatRoomMenu();

		if (action === "leave") {
			await handleLeaveRoom();
		}
	};

	/** 채팅방 나가기 */
	const handleLeaveRoom = async () => {
		if (isLeaving) return;

		const confirmed = await confirmAction({
			title: "채팅방 나가기",
			description:
				"정말 채팅방을 나가시겠습니까? 대화 내용은 복구할 수 없습니다.",
			confirmText: "나가기",
			cancelText: "취소",
		});
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
		}
	};

	const { onlineUsers } = useChatPresence(roomId, currentUserId, {
		nickname: currentUser?.nickname ?? "나",
		profileImage: currentUser?.profileImage ?? null,
	});

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

	return (
		<div data-chat-container {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.topSection)}>
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
								<OnlineStatusBadge onlineCount={onlineUsers.length} />
							</div>
						</div>
					</div>
					<button
						type="button"
						onClick={handleOpenMenu}
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
								{market.price
									? `${market.price.toLocaleString()}원`
									: "가격협의"}
							</p>
						</div>
						<span {...stylex.props(styles.productStatus)}>{market.status}</span>
					</Link>
				)}
			</div>

			<div data-chat-messages {...stylex.props(styles.messages)}>
				<div {...stylex.props(styles.messagesList)}>
					<ChatMessageList
						ref={messagesRef}
						messages={messages}
						onStartReached={fetchPrev}
						hasPrev={hasPrev}
						isFetchingPrev={isFetchingPrev}
						followOutput={(atBottom) => (atBottom ? "smooth" : false)}
						onAtBottomChange={(atBottom) => {
							setIsAtBottom(atBottom);
							if (atBottom) {
								resetNewMessageCount();
							}
						}}
						renderHeader={() => (
							<div {...stylex.props(styles.dateGroup)}>
								<span {...stylex.props(styles.dateBadge)}>오늘</span>
							</div>
						)}
						renderMessage={(message) => {
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

									{isSendingMsg && isMine && (
										<div
											{...stylex.props(
												styles.messageTime,
												styles.messageTimeMine,
											)}
										>
											<span {...stylex.props(styles.sendingIndicator)}>
												전송 중...
											</span>
										</div>
									)}

									{isFailed && isMine && (
										<div {...stylex.props(styles.failedActions)}>
											<span {...stylex.props(styles.failedText)}>
												<AlertCircle size={12} />
												전송 실패
											</span>
											<button
												type="button"
												onClick={() =>
													handleDeleteFailed(message.clientId ?? "")
												}
												{...stylex.props(styles.retryButton)}
											>
												<X size={12} />
												삭제
											</button>
										</div>
									)}

									{!isSendingMsg && !isFailed && (
										<div
											{...stylex.props(
												styles.messageTime,
												isMine
													? styles.messageTimeMine
													: styles.messageTimeTheirs,
											)}
										>
											{dayjs(message.createdAt).format("HH:mm")}
										</div>
									)}
								</div>
							);
						}}
					/>
				</div>

				{!isAtBottom && newMessageCount > 0 && (
					<button
						type="button"
						onClick={() => {
							if (!messagesRef.current) return;
							messagesRef.current.scrollToIndex({
								index: Math.max(messages.length - 1, 0),
								behavior: "smooth",
							});
							resetNewMessageCount();
						}}
						{...stylex.props(styles.newMessageBadge)}
					>
						새 메시지 {newMessageCount}개
					</button>
				)}
			</div>

			<div data-chat-input {...stylex.props(styles.inputArea)}>
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
