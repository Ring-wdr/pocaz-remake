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
