"use client";

import type { InfiniteData } from "@tanstack/react-query";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

import type { ChatMessage, PaginatedMessages } from "@/types/entities";
import { api } from "@/utils/eden";
import { useChatRealtime } from "./use-chat-realtime";

export interface ChatMessageView extends ChatMessage {
	status?: "sending" | "sent" | "failed";
	clientId?: string;
	receivedAt?: number;
}

type PageParam = string | null;

interface UseChatMessagesOptions {
	roomId: string;
	initialPage?: PaginatedMessages;
	currentUserId: string;
	pageSize?: number;
}

interface UseChatMessagesResult {
	items: ChatMessageView[];
	hasPrev: boolean;
	isFetchingPrev: boolean;
	fetchPrev: () => Promise<unknown>;
	isAtBottom: boolean;
	setIsAtBottom: (value: boolean) => void;
	newMessageCount: number;
	resetNewMessageCount: () => void;
	appendLocal: (content: string) => { clientId: string };
	markAsSent: (clientId: string, serverMessage: ChatMessage) => void;
	markAsFailed: (clientId: string) => void;
	removePending: (clientId: string) => void;
}

const queryKey = (roomId: string) => ["chat", roomId, "messages"];

const getEffectiveTime = (item: { createdAt: string; receivedAt?: number }) => {
	const created = new Date(item.createdAt).getTime();
	return Math.max(created, item.receivedAt ?? created);
};

const sortByEffectiveAsc = (
	a: { createdAt: string; receivedAt?: number; id: string },
	b: { createdAt: string; receivedAt?: number; id: string },
) => {
	const diff = getEffectiveTime(a) - getEffectiveTime(b);
	if (diff !== 0) return diff;
	return a.id.localeCompare(b.id);
};

function useRoomMessagesInfiniteQuery({
	roomId,
	initialPage,
	pageSize = 50,
}: Pick<UseChatMessagesOptions, "roomId" | "initialPage" | "pageSize">) {
	return useInfiniteQuery<
		PaginatedMessages,
		Error,
		InfiniteData<PaginatedMessages>,
		ReturnType<typeof queryKey>,
		PageParam
	>({
		queryKey: queryKey(roomId),
		queryFn: async ({ pageParam }) => {
			const { data: messagesData, error } = await api.chat
				.rooms({ id: roomId })
				.messages.get({
					query: {
						cursor: pageParam ?? undefined,
						limit: String(pageSize),
					},
				});

			if (error || !messagesData) {
				throw new Error("Failed to fetch messages");
			}

			return messagesData;
		},
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
		initialPageParam: null,
		initialData: initialPage
			? { pages: [initialPage], pageParams: [null] }
			: undefined,
		refetchOnWindowFocus: false,
	});
}

function useRoomMessagesRealtime({
	roomId,
	currentUserId,
	onMessage,
}: {
	roomId: string;
	currentUserId: string;
	onMessage: (message: ChatMessage & { receivedAt?: number }) => void;
}) {
	useChatRealtime(roomId, (message) => {
		if (message.user.id === currentUserId) return;
		onMessage({ ...message, receivedAt: Date.now() });
	});
}

const withReceivedAt = (
	message: ChatMessage,
): ChatMessage & { receivedAt: number } => ({
	...message,
	receivedAt: Date.now(),
});

export function useChatMessages({
	roomId,
	initialPage,
	currentUserId,
	pageSize = 50,
}: UseChatMessagesOptions): UseChatMessagesResult {
	const queryClient = useQueryClient();
	const [pendingMessages, setPendingMessages] = useState<ChatMessageView[]>([]);
	const [isAtBottom, setIsAtBottom] = useState(true);
	const [newMessageCount, setNewMessageCount] = useState(0);
	const isAtBottomRef = useRef(isAtBottom);

	useEffect(() => {
		isAtBottomRef.current = isAtBottom;
	}, [isAtBottom]);

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useRoomMessagesInfiniteQuery({ roomId, initialPage, pageSize });

	const addIncomingMessageToCache = (message: ChatMessage) => {
		queryClient.setQueryData<InfiniteData<PaginatedMessages>>(
			queryKey(roomId),
			(prev) => {
				if (!prev) return prev;

				const alreadyExists = prev.pages.some((page) =>
					page.messages.some((m) => m.id === message.id),
				);
				if (alreadyExists) return prev;

				const lastIndex = prev.pages.length - 1;
				const updatedPages = [...prev.pages];
				const lastPage = updatedPages[lastIndex];

				updatedPages[lastIndex] = {
					...lastPage,
					messages: [
						...lastPage.messages,
						withReceivedAt(message) as PaginatedMessages["messages"][number] & {
							receivedAt?: number;
						},
					],
				};

				return { ...prev, pages: updatedPages };
			},
		);
	};

	useRoomMessagesRealtime({
		roomId,
		currentUserId,
		onMessage: (message) => {
			addIncomingMessageToCache(message);
			if (!isAtBottomRef.current) {
				setNewMessageCount((count) => count + 1);
			}
		},
	});

	const items = useMemo<ChatMessageView[]>(() => {
		const fetchedMessages =
			data?.pages.flatMap((page) =>
				page.messages.map<ChatMessageView>((msg) => {
					const received =
						"receivedAt" in msg && typeof msg.receivedAt === "number"
							? (msg as ChatMessage & { receivedAt: number }).receivedAt
							: new Date(msg.createdAt).getTime();

					return {
						...msg,
						status: "sent",
						receivedAt: received,
					};
				}),
			) ?? [];

		const merged = [...fetchedMessages, ...pendingMessages];

		return merged.slice().sort(sortByEffectiveAsc);
	}, [data?.pages, pendingMessages]);

	const appendLocal = (content: string) => {
		const clientId = crypto.randomUUID();
		const optimisticMessage: ChatMessageView = {
			id: `temp-${clientId}`,
			clientId,
			content,
			createdAt: new Date().toISOString(),
			receivedAt: Date.now(),
			user: {
				id: currentUserId,
				nickname: "",
				profileImage: null,
			},
			status: "sending",
		};

		setPendingMessages((prev) => [...prev, optimisticMessage]);
		return { clientId };
	};

	const markAsSent = (clientId: string, serverMessage: ChatMessage) => {
		setPendingMessages((prev) =>
			prev.filter((message) => message.clientId !== clientId),
		);
		addIncomingMessageToCache(serverMessage);
	};

	const markAsFailed = (clientId: string) => {
		setPendingMessages((prev) =>
			prev.map((message) =>
				message.clientId === clientId
					? { ...message, status: "failed" }
					: message,
			),
		);
	};

	const removePending = (clientId: string) => {
		setPendingMessages((prev) =>
			prev.filter((message) => message.clientId !== clientId),
		);
	};

	return {
		items,
		hasPrev: Boolean(hasNextPage),
		isFetchingPrev: isFetchingNextPage,
		fetchPrev: fetchNextPage,
		isAtBottom,
		setIsAtBottom,
		newMessageCount,
		resetNewMessageCount: () => setNewMessageCount(0),
		appendLocal,
		markAsSent,
		markAsFailed,
		removePending,
	};
}

export { useRoomMessagesInfiniteQuery, useRoomMessagesRealtime };
