"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * 채팅 메시지 타입
 */
export interface ChatMessage {
	id: string;
	content: string;
	createdAt: string;
	user: {
		id: string;
		nickname: string;
		profileImage: string | null;
	};
}

/**
 * Supabase Realtime 채팅 훅
 *
 * PostgreSQL Changes를 구독하여 새 메시지를 실시간으로 받습니다.
 * Supabase Dashboard에서 Realtime을 활성화해야 합니다:
 * 1. Database > Replication 에서 ChatMessage 테이블 활성화
 * 2. 또는 SQL: ALTER PUBLICATION supabase_realtime ADD TABLE "ChatMessage";
 */
export function useChatRealtime(
	roomId: string | null,
	onNewMessage?: (message: ChatMessage) => void,
) {
	const supabase = createSupabaseBrowserClient();
	const channelRef = useRef<RealtimeChannel | null>(null);
	const [isConnected, setIsConnected] = useState(false);

	const subscribe = useCallback(() => {
		if (!roomId) return;

		// 기존 구독 해제
		if (channelRef.current) {
			supabase.removeChannel(channelRef.current);
		}

		// 새 채널 구독
		const channel = supabase
			.channel(`chat:${roomId}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "ChatMessage",
					filter: `roomId=eq.${roomId}`,
				},
				async (payload) => {
					// 새 메시지가 들어오면 사용자 정보와 함께 전달
					const newMessage = payload.new as {
						id: string;
						content: string;
						createdAt: string;
						userId: string;
					};

					// 사용자 정보 조회 (간단한 API 호출)
					try {
						const response = await fetch(`/api/users/${newMessage.userId}`);
						if (response.ok) {
							const userData = await response.json();
							onNewMessage?.({
								id: newMessage.id,
								content: newMessage.content,
								createdAt: newMessage.createdAt,
								user: {
									id: userData.id,
									nickname: userData.nickname,
									profileImage: userData.profileImage,
								},
							});
						}
					} catch (error) {
						console.error("Failed to fetch user data for message:", error);
						// 사용자 정보 없이 메시지만 전달
						onNewMessage?.({
							id: newMessage.id,
							content: newMessage.content,
							createdAt: newMessage.createdAt,
							user: {
								id: newMessage.userId,
								nickname: "Unknown",
								profileImage: null,
							},
						});
					}
				},
			)
			.subscribe((status) => {
				setIsConnected(status === "SUBSCRIBED");
			});

		channelRef.current = channel;
	}, [roomId, onNewMessage, supabase]);

	const unsubscribe = useCallback(() => {
		if (channelRef.current) {
			supabase.removeChannel(channelRef.current);
			channelRef.current = null;
			setIsConnected(false);
		}
	}, [supabase]);

	useEffect(() => {
		subscribe();

		return () => {
			unsubscribe();
		};
	}, [subscribe, unsubscribe]);

	return {
		isConnected,
		reconnect: subscribe,
		disconnect: unsubscribe,
	};
}

/**
 * Broadcast 기반 채팅 훅 (더 가벼움)
 *
 * PostgreSQL Changes 대신 Broadcast Channel을 사용합니다.
 * 메시지 전송 시 직접 broadcast해야 합니다.
 */
export function useChatBroadcast(
	roomId: string | null,
	onNewMessage?: (message: ChatMessage) => void,
) {
	const supabase = createSupabaseBrowserClient();
	const channelRef = useRef<RealtimeChannel | null>(null);
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		if (!roomId) return;

		const channel = supabase
			.channel(`chat-broadcast:${roomId}`)
			.on("broadcast", { event: "new_message" }, ({ payload }) => {
				onNewMessage?.(payload as ChatMessage);
			})
			.subscribe((status) => {
				setIsConnected(status === "SUBSCRIBED");
			});

		channelRef.current = channel;

		return () => {
			supabase.removeChannel(channel);
		};
	}, [roomId, onNewMessage, supabase]);

	const sendMessage = useCallback(
		async (message: ChatMessage) => {
			if (!channelRef.current) return;

			await channelRef.current.send({
				type: "broadcast",
				event: "new_message",
				payload: message,
			});
		},
		[],
	);

	return {
		isConnected,
		sendMessage,
	};
}

/**
 * Presence 기반 온라인 상태 훅
 *
 * 채팅방에 누가 접속해 있는지 확인합니다.
 */
export function useChatPresence(
	roomId: string | null,
	userId: string | null,
	userInfo: { nickname: string; profileImage: string | null },
) {
	const supabase = createSupabaseBrowserClient();
	const channelRef = useRef<RealtimeChannel | null>(null);
	const [onlineUsers, setOnlineUsers] = useState<
		Array<{
			id: string;
			nickname: string;
			profileImage: string | null;
		}>
	>([]);

	useEffect(() => {
		if (!roomId || !userId) return;

		const channel = supabase.channel(`presence:${roomId}`, {
			config: {
				presence: {
					key: userId,
				},
			},
		});

		channel
			.on("presence", { event: "sync" }, () => {
				const state = channel.presenceState();
				const users = Object.values(state).flatMap((presences) =>
					(presences as unknown as Array<{ user_id: string; nickname: string; profile_image: string | null }>).map((p) => ({
						id: p.user_id,
						nickname: p.nickname,
						profileImage: p.profile_image,
					})),
				);
				setOnlineUsers(users);
			})
			.subscribe(async (status) => {
				if (status === "SUBSCRIBED") {
					await channel.track({
						user_id: userId,
						nickname: userInfo.nickname,
						profile_image: userInfo.profileImage,
						online_at: new Date().toISOString(),
					});
				}
			});

		channelRef.current = channel;

		return () => {
			supabase.removeChannel(channel);
		};
	}, [roomId, userId, userInfo, supabase]);

	return { onlineUsers };
}
