import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { myUserQueryKey } from "@/lib/queries/users";
import type {
	NotificationSettings,
	PaginatedNotifications,
} from "@/types/entities";
import { api } from "@/utils/eden";

/**
 * 알림함 쿼리들(목록, 안 읽음 수)의 공통 키. 알림을 읽음 처리하거나 새 알림이 생겼을 수 있을 때
 * 이 키로 무효화하면 목록과 종 아이콘 뱃지가 함께 바뀐다.
 */
export const notificationsQueryKey = ["notifications"] as const;

/**
 * 안 읽은 알림 수 쿼리의 키. 알림을 읽음 처리하는 즉시 뱃지를 줄일 때 쓴다.
 */
export const notificationUnreadCountQueryKey = [
	...notificationsQueryKey,
	"unread-count",
] as const;

/** 알림함에서 한 번에 받는 알림 수 */
const PAGE_SIZE = 20;

/**
 * 알림 목록 무한 쿼리 옵션 (최신순, cursor 기반 페이지네이션)
 * - 항상 새로 받는다(staleTime 기본값 0). 캐시가 있으면 먼저 보여 주고 뒤에서 갱신한다
 * - 창에 다시 포커스가 올 때 새로 받는다
 */
export const notificationsInfiniteQueryOptions = () =>
	infiniteQueryOptions({
		queryKey: [...notificationsQueryKey, "list"] as const,
		initialPageParam: null as string | null,
		queryFn: async ({ pageParam }): Promise<PaginatedNotifications> => {
			const { data, error } = await api.notifications.get({
				query: {
					limit: PAGE_SIZE,
					...(pageParam ? { cursor: pageParam } : null),
				},
			});
			if (error || !data) {
				throw new Error("Failed to fetch notifications");
			}
			return data;
		},
		getNextPageParam: (lastPage) =>
			lastPage.hasMore ? lastPage.nextCursor : null,
		gcTime: 10 * 60 * 1000,
		refetchOnWindowFocus: true,
	});

/**
 * 안 읽은 알림 수 쿼리 옵션 (종 아이콘 뱃지)
 * - 60초마다, 그리고 창에 다시 포커스가 올 때 새로 받는다
 * - 로그인하지 않았거나(401) 요청이 실패하면 뱃지를 숨기면 되므로 0으로 취급한다.
 *   호출하는 곳은 로그인 여부를 모르는 홈 헤더라 오류를 던지지 않는다
 * - retry: false. 실패하면 다음 주기에 다시 받는다
 */
export const notificationUnreadCountQueryOptions = () =>
	queryOptions({
		queryKey: notificationUnreadCountQueryKey,
		queryFn: async (): Promise<number> => {
			try {
				const { data, error } = await api.notifications["unread-count"].get();
				if (error || !data) {
					return 0;
				}
				return data.count;
			} catch {
				return 0;
			}
		},
		refetchInterval: 60_000,
		refetchOnWindowFocus: true,
		retry: false,
	});

/**
 * 내 알림 설정 쿼리 옵션
 * - 내 정보(`["users", "me"]`) 아래에 둔다. 알림함 쿼리 키(`["notifications"]`)와 달리 읽음 처리로 무효화되지 않는다
 * - staleTime: 5분. 토글하면 캐시를 직접 고치므로 이 기기에서 바꾼 값은 항상 맞다
 * - gcTime: 15분
 */
export const notificationSettingsQueryOptions = () =>
	queryOptions({
		queryKey: [...myUserQueryKey, "notification-settings"] as const,
		queryFn: async (): Promise<NotificationSettings> => {
			const { data, error } = await api.users.me["notification-settings"].get();
			if (error || !data) {
				throw new Error("Failed to fetch notification settings");
			}
			return data;
		},
		staleTime: 5 * 60 * 1000,
		gcTime: 15 * 60 * 1000,
	});
