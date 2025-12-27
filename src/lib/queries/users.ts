import { queryOptions } from "@tanstack/react-query";
import { api } from "@/utils/eden";

/**
 * 프로필 정보 쿼리 옵션
 * - staleTime: 5분 (프로필은 자주 변경되지 않음)
 * - gcTime: 15분 (메모리에 캐시 유지)
 * - refetchOnWindowFocus: true (stale한 경우 윈도우 포커스 시 다시 요청)
 */
export const userProfileQueryOptions = () =>
	queryOptions({
		queryKey: ["users", "me", "profile"] as const,
		queryFn: async () => {
			const { data, error } = await api.users.me.get();
			if (error || !data) {
				throw new Error("Failed to fetch user profile");
			}
			return data;
		},
		staleTime: 5 * 60 * 1000,
		gcTime: 15 * 60 * 1000,
		refetchOnWindowFocus: true,
	});

/**
 * 사용자 통계 쿼리 옵션
 * - staleTime: 5분 (통계는 실시간으로 변경되지 않음)
 * - gcTime: 15분
 * - refetchOnWindowFocus: true (stale한 경우 윈도우 포커스 시 다시 요청)
 */
export const userStatsQueryOptions = () =>
	queryOptions({
		queryKey: ["users", "me", "stats"] as const,
		queryFn: async () => {
			const { data, error } = await api.users.me.summary.get();
			if (error || !data) {
				throw new Error("Failed to fetch user stats");
			}
			return data;
		},
		staleTime: 5 * 60 * 1000,
		gcTime: 15 * 60 * 1000,
		refetchOnWindowFocus: true,
	});

/**
 * 사용자 활동 내역 쿼리 옵션
 * - staleTime: 2분 (활동은 더 자주 업데이트될 수 있음)
 * - gcTime: 10분
 * - refetchOnWindowFocus: true (stale한 경우 윈도우 포커스 시 다시 요청)
 */
export const userActivityQueryOptions = () =>
	queryOptions({
		queryKey: ["users", "me", "activity"] as const,
		queryFn: async () => {
			const { data, error } = await api.users.me.activity.get({
				query: { limit: "5" },
			});
			if (error) {
				throw new Error("Failed to fetch user activity");
			}
			return data ?? { items: [], nextCursor: null, hasMore: false };
		},
		staleTime: 2 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		refetchOnWindowFocus: true,
	});
