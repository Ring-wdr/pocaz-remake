import { queryOptions } from "@tanstack/react-query";
import type { MarketSummary } from "@/types/entities";
import { api } from "@/utils/eden";

/**
 * 마켓 정보 쿼리 옵션
 * - marketId가 필수 파라미터
 * - staleTime: 10분 (마켓 정보는 자주 변경되지 않음)
 * - gcTime: 30분
 * - refetchOnWindowFocus: true
 */
/**
 * 특정 마켓의 채팅방 목록 쿼리 옵션
 * - marketId가 필수 파라미터
 * - staleTime: 2분 (채팅은 실시간으로 변함)
 * - gcTime: 10분
 * - 페이지네이션 미지원
 */
export const chatListMarketQueryOptions = (marketId: string) =>
	queryOptions({
		queryKey: ["chat", "rooms", "market", marketId] as const,
		queryFn: async () => {
			const { data, error } = await api.chat.rooms.market({ marketId }).get();
			if (error || !data) {
				throw new Error("Failed to fetch market chat rooms");
			}
			return data.rooms;
		},
		staleTime: 2 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		refetchOnWindowFocus: true,
	});

/**
 * 사용자의 모든 채팅방 목록 쿼리 옵션
 * - staleTime: 1분 (일반 채팅도 실시간으로 변함)
 * - gcTime: 10분
 * - 페이지네이션 지원 (cursor 기반)
 */
export const chatListAllQueryOptions = (cursor?: string | null) =>
	queryOptions({
		queryKey: ["chat", "rooms", "all", cursor ?? "initial"] as const,
		queryFn: async () => {
			const { data, error } = await api.chat.rooms.get({
				query: { limit: "20", ...(cursor ? { cursor } : {}) },
			});
			if (error || !data) {
				throw new Error("Failed to fetch chat rooms");
			}
			return {
				rooms: data.rooms,
				hasMore: data.hasMore ?? false,
				nextCursor: data.nextCursor ?? null,
			};
		},
		staleTime: 1 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		refetchOnWindowFocus: true,
	});

export const marketInfoQueryOptions = (marketId: string) =>
	queryOptions({
		queryKey: ["markets", marketId, "info"] as const,
		queryFn: async (): Promise<MarketSummary> => {
			const { data, error } = await api.markets({ id: marketId }).get();
			if (error || !data) {
				throw new Error("Failed to fetch market info");
			}
			return {
				id: data.id,
				title: data.title,
				price: data.price ?? null,
				thumbnail: data.images[0]?.imageUrl ?? null,
			};
		},
		staleTime: 10 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		refetchOnWindowFocus: true,
	});
