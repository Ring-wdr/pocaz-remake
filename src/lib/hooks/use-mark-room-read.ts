"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { useEventListener } from "@/hooks/use-event-listener";
import { chatUnreadCountQueryKey } from "@/lib/queries/chat";
import { chatRoomsQueryKey } from "@/lib/queries/markets";
import { notificationsQueryKey } from "@/lib/queries/notifications";
import { api } from "@/utils/eden";

/** 읽음 처리 요청 사이의 최소 간격(ms). 간격 안에 또 필요해지면 끝에 한 번만 보낸다 */
export const MARK_READ_THROTTLE_MS = 1000;

interface UseMarkRoomReadOptions {
	roomId: string;
	/** 맨 아래까지 보고 있는지. 위로 스크롤해 둔 동안 온 메시지는 아직 보지 못한 것이다 */
	isAtBottom: boolean;
	/** 상대가 보낸 가장 최근 메시지의 id. 값이 바뀌면 새 메시지가 도착한 것이다 */
	latestIncomingMessageId: string | null;
}

/**
 * 채팅방을 읽음 처리한다(`POST /chat/rooms/:id/read`). 아래 경우에 요청한다.
 * - 방에 들어올 때 한 번
 * - 맨 아래를 보는 중에 상대의 새 메시지가 올 때(위로 스크롤해 둔 사람이 맨 아래로 돌아왔을 때도)
 * - 다른 탭에 갔다가 돌아왔을 때(맨 아래를 보고 있을 때만)
 * 보이지 않는 탭에서는 읽은 것으로 치지 않는다. 요청은 1초에 한 번을 넘지 않고, 처리가 끝나면
 * 채팅방 목록·안 읽음 수·알림 쿼리를 무효화해 목록·하단 탭 뱃지·알림함·종 아이콘이 바로 바뀌게 한다
 * (서버가 그 방의 안 읽은 채팅 알림도 함께 읽음 처리한다).
 * isAtBottom은 처음에 true여야 방에 들어올 때 요청이 나간다.
 */
export function useMarkRoomRead({
	roomId,
	isAtBottom,
	latestIncomingMessageId,
}: UseMarkRoomReadOptions) {
	const queryClient = useQueryClient();
	const lastSentAtRef = useRef(0);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	// 다음 요청이 읽음 처리할 상대 메시지. 간격 안에 새 메시지가 오면 끝에 보내는 요청이 이 값을 쓴다
	const pendingMessageIdRef = useRef<string | null>(null);
	// 마지막으로 보낸 요청이 덮는 상대 메시지. 같은 상태에서 요청을 되풀이하지 않으려고 기억한다
	const markedRef = useRef<{ roomId: string; messageId: string | null } | null>(
		null,
	);

	const send = useCallback(async () => {
		lastSentAtRef.current = Date.now();
		markedRef.current = { roomId, messageId: pendingMessageIdRef.current };

		try {
			const { error } = await api.chat.rooms({ id: roomId }).read.post();
			if (error) {
				// 보조 기능이라 사용자에게 알리지 않는다. 다음 기회에 다시 시도하도록 기억을 지운다
				markedRef.current = null;
				return;
			}
			void queryClient.invalidateQueries({ queryKey: chatRoomsQueryKey });
			void queryClient.invalidateQueries({ queryKey: chatUnreadCountQueryKey });
			void queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
		} catch (err) {
			console.error("Mark room read error:", err);
			markedRef.current = null;
		}
	}, [roomId, queryClient]);

	const requestRead = useCallback(
		(messageId: string | null) => {
			pendingMessageIdRef.current = messageId;
			// 보이지 않는 탭에서는 보내지 않는다. 다시 보일 때 visibilitychange에서 요청한다
			if (document.visibilityState === "hidden") return;

			const wait = lastSentAtRef.current + MARK_READ_THROTTLE_MS - Date.now();
			if (wait <= 0) {
				void send();
				return;
			}
			if (timerRef.current === null) {
				timerRef.current = setTimeout(() => {
					timerRef.current = null;
					if (document.visibilityState !== "hidden") void send();
				}, wait);
			}
		},
		[send],
	);

	useEffect(() => {
		if (!isAtBottom) return;
		const marked = markedRef.current;
		if (
			marked?.roomId === roomId &&
			marked.messageId === latestIncomingMessageId
		) {
			return;
		}
		requestRead(latestIncomingMessageId);
	}, [isAtBottom, latestIncomingMessageId, roomId, requestRead]);

	useEventListener("visibilitychange", () => {
		if (document.visibilityState === "visible" && isAtBottom) {
			requestRead(latestIncomingMessageId);
		}
	});

	// 간격을 기다리는 요청이 있는 채로 방을 떠나도 그 사이에 본 메시지는 읽음 처리한다
	useEffect(() => {
		return () => {
			if (timerRef.current === null) return;
			clearTimeout(timerRef.current);
			timerRef.current = null;
			if (document.visibilityState !== "hidden") void send();
		};
	}, [send]);
}
