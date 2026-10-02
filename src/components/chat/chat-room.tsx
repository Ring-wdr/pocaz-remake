"use client";

import * as stylex from "@stylexjs/stylex";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MoreVertical, Send } from "lucide-react";
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
import { useCallbackRef } from "@/hooks/use-callback-ref";
import { useEventListener } from "@/hooks/use-event-listener";
import { useChatMessages } from "@/lib/hooks/use-chat-messages";
import { preCacheUsers, useChatPresence } from "@/lib/hooks/use-chat-realtime";
import { useMarkRoomRead } from "@/lib/hooks/use-mark-room-read";
import { chatRoomsQueryKey } from "@/lib/queries/markets";
import type {
	ChatMarketInfo,
	ChatMember,
	PaginatedMessages,
} from "@/types/entities";
import { formatTime } from "@/utils/date";
import { api } from "@/utils/eden";
import { isSubmitEnter } from "@/utils/keyboard";
import { ChatFailedMessageActions } from "./chat-failed-message-actions";
import { ChatImageUploadButton } from "./chat-image-upload-button";
import { ChatMarketBanner } from "./chat-market-banner";
import { ChatMessageList } from "./chat-message-list";
import { OnlineStatusBadge } from "./online-status-badge";
import { openChatRoomMenu } from "./open-chat-room-menu";
import {
	findLastReadMessageId,
	findLatestIncomingMessageId,
} from "./unread-boundary";

const IMAGE_PREFIX = "image:";

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
	// 상대의 아바타와 이름이 상대의 프로필로 가는 링크
	partnerLink: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxs,
		minWidth: 0,
		color: "inherit",
		textDecoration: "none",
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
		whiteSpace: "pre-wrap",
		wordBreak: "break-word",
		overflowWrap: "anywhere",
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
		borderRadius: radius.sm,
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
	imagePreview: {
		maxWidth: "240px",
		maxHeight: "240px",
		minHeight: "160px",
		width: "100%",
		borderRadius: radius.md,
		objectFit: "cover",
		display: "block",
		backgroundColor: colors.bgTertiary,
	},
});

interface ChatRoomProps {
	roomId: string;
	roomName: string | null;
	members: ChatMember[];
	market: ChatMarketInfo | null;
	initialPage: PaginatedMessages;
	currentUserId: string;
	/** 방에 들어올 때 서버가 알려 준 내 읽음 시각. 읽은 적이 없으면 null */
	lastReadAt: string | null;
}

export default function ChatRoom({
	roomId,
	roomName,
	members,
	market,
	initialPage,
	currentUserId,
	lastReadAt,
}: ChatRoomProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [inputValue, setInputValue] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [isLeaving, setIsLeaving] = useState(false);
	const messagesRef = useRef<VirtuosoHandle | null>(null);
	const newMessageBadgeRef = useRef<HTMLButtonElement | null>(null);

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
		markAsSending,
		removePending,
	} = useChatMessages({
		roomId,
		initialPage,
		currentUserId,
	});
	const resetNewMessageCountRef = useCallbackRef(resetNewMessageCount);

	// "여기까지 읽음" 구분선 위치. 들어올 때의 읽음 시각으로 처음 한 번만 정한다.
	// 아래에서 읽음 처리를 해 서버의 lastReadAt이 바뀌어도 이 방에 있는 동안 구분선은 그대로 둔다
	const [lastReadMessageId] = useState(() =>
		findLastReadMessageId(initialPage.messages, lastReadAt, currentUserId),
	);

	// 들어올 때, 맨 아래에서 상대의 새 메시지가 올 때, 탭이 다시 보일 때 읽음 처리한다
	useMarkRoomRead({
		roomId,
		isAtBottom,
		latestIncomingMessageId: findLatestIncomingMessageId(
			messages,
			currentUserId,
		),
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
	// 거래 상대는 나를 뺀 멤버만 된다. 상대가 방을 나갔다면 partner가 나 자신으로 대체되므로 따로 구한다
	const tradePartner = members.find((m) => m.id !== currentUserId) ?? null;
	const displayName = roomName || partner?.nickname || "채팅방";
	// 1:1 채팅이면 헤더의 상대 아바타·이름이 상대의 프로필로 이어진다. 상대가 방을 나갔거나 여럿이 있는 방이면 링크를 두지 않는다
	const partnerProfileHref =
		tradePartner && members.length === 2 ? `/users/${tradePartner.id}` : null;

	const scrollToBottom = useCallback(
		(behavior: "auto" | "smooth" = "smooth") => {
			if (!messagesRef.current) return;
			messagesRef.current.scrollToIndex({
				index: Math.max(messages.length - 1, 0),
				behavior,
			});
			resetNewMessageCountRef();
		},
		[messages.length, resetNewMessageCountRef],
	);

	useEventListener("keydown", (event) => {
		const target = event.target;
		if (
			!(target instanceof HTMLElement) ||
			target.tagName === "INPUT" ||
			target.tagName === "TEXTAREA" ||
			target.isContentEditable
		) {
			return;
		}

		if (event.altKey && event.key === "ArrowDown") {
			event.preventDefault();
			scrollToBottom("smooth");
		}

		if (event.altKey && event.key.toLowerCase() === "n") {
			if (newMessageBadgeRef.current) {
				event.preventDefault();
				newMessageBadgeRef.current.focus();
			}
		}
	});

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

	const sendImageMessage = useCallback(
		async (imageUrl: string) => {
			setIsSending(true);
			try {
				const content = `${IMAGE_PREFIX}${imageUrl}`;
				const { clientId } = appendLocal(content);

				const { data: messageData, error: messageError } = await api.chat
					.rooms({ id: roomId })
					.messages.post({ content });

				if (messageError || !messageData) {
					toast.error("이미지 전송에 실패했어요.");
					markAsFailed(clientId);
					return;
				}

				markAsSent(clientId, messageData);
			} catch (err) {
				console.error("Image send error:", err);
				toast.error("이미지 전송에 실패했어요.");
			} finally {
				setIsSending(false);
			}
		},
		[appendLocal, markAsFailed, markAsSent, roomId],
	);

	/** 실패한 메시지 다시 보내기. 같은 메시지를 전송 중으로 되돌린 뒤 같은 clientId로 다시 보낸다 */
	const handleRetryFailed = useCallback(
		(content: string, clientId: string) => {
			markAsSending(clientId);
			void sendMessage(content, clientId);
		},
		[markAsSending, sendMessage],
	);

	/** 실패한 메시지 삭제 */
	const handleDeleteFailed = useCallback(
		(clientId: string) => {
			removePending(clientId);
			toast.success("메시지가 삭제되었습니다.");
		},
		[removePending],
	);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (isSubmitEnter(e)) {
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
			void queryClient.invalidateQueries({ queryKey: chatRoomsQueryKey });
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

	// 헤더의 상대 아바타와 이름·접속 상태
	const partnerSummary = (
		<>
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
		</>
	);

	return (
		<div data-chat-container {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.topSection)}>
				<div {...stylex.props(styles.header)}>
					<Link
						aria-label="채팅 목록으로 돌아가기"
						href="/chat/list"
						{...stylex.props(styles.backButton)}
					>
						<ArrowLeft size={24} />
					</Link>
					<div {...stylex.props(styles.partnerInfo)}>
						{partnerProfileHref ? (
							<Link
								href={partnerProfileHref}
								aria-label={`${displayName} 프로필 보기`}
								{...stylex.props(styles.partnerLink)}
							>
								{partnerSummary}
							</Link>
						) : (
							partnerSummary
						)}
					</div>
					<button
						aria-label="채팅방 메뉴"
						type="button"
						onClick={handleOpenMenu}
						{...stylex.props(styles.menuButton)}
					>
						<MoreVertical size={20} />
					</button>
				</div>

				{market && (
					<ChatMarketBanner
						market={market}
						currentUserId={currentUserId}
						partner={tradePartner}
					/>
				)}
			</div>

			<div data-chat-messages {...stylex.props(styles.messages)}>
				<div {...stylex.props(styles.messagesList)}>
					<ChatMessageList
						ref={messagesRef}
						messages={messages}
						lastReadMessageId={lastReadMessageId}
						onStartReached={fetchPrev}
						hasPrev={hasPrev}
						isFetchingPrev={isFetchingPrev}
						followOutput={isAtBottom ? "smooth" : false}
						onAtBottomChange={(atBottom) => {
							setIsAtBottom(atBottom);
							if (atBottom) {
								resetNewMessageCount();
							}
						}}
						renderMessage={(message) => {
							const isMine = message.user.id === currentUserId;
							const isFailed = message.status === "failed";
							const isSendingMsg = message.status === "sending";
							const isImage = message.content.startsWith(IMAGE_PREFIX);
							const imageUrl = isImage
								? message.content.replace(IMAGE_PREFIX, "")
								: null;

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
											{isImage && imageUrl ? (
												<img
													src={imageUrl}
													alt="전송한 이미지"
													{...stylex.props(styles.imagePreview)}
												/>
											) : (
												message.content
											)}
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

									{isFailed && isMine && message.clientId && (
										<ChatFailedMessageActions
											content={message.content}
											clientId={message.clientId}
											onRetry={handleRetryFailed}
											onDelete={handleDeleteFailed}
										/>
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
											{formatTime(message.createdAt)}
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
						ref={newMessageBadgeRef}
						onClick={() => {
							scrollToBottom("smooth");
						}}
						{...stylex.props(styles.newMessageBadge)}
					>
						새 메시지 {newMessageCount}개
					</button>
				)}
			</div>

			<div data-chat-input {...stylex.props(styles.inputArea)}>
				<ChatImageUploadButton
					onUploaded={sendImageMessage}
					disabled={isSending}
				/>
				<div {...stylex.props(styles.inputWrap)}>
					<input
						type="text"
						placeholder="메시지를 입력하세요"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={handleKeyDown}
						{...stylex.props(styles.input)}
					/>
				</div>
				<button
					aria-label="메시지 보내기"
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
