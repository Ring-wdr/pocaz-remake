import { queryOptions } from "@tanstack/react-query";
import { api } from "@/utils/eden";

/**
 * 안 읽은 채팅 메시지 수 쿼리의 키. 채팅방을 읽음 처리한 뒤 이 키로 무효화한다.
 */
export const chatUnreadCountQueryKey = ["chat", "unread-count"] as const;

/**
 * 내 모든 채팅방의 안 읽은 메시지 수 쿼리 옵션 (하단 탭 뱃지)
 * - 30초마다, 그리고 창에 다시 포커스가 올 때 새로 받는다
 * - 로그인하지 않았거나(401) 요청이 실패하면 뱃지를 숨기면 되므로 0으로 취급한다.
 *   호출하는 곳은 로그인 여부를 모르는 하단 탭이라 오류를 던지지 않는다
 * - retry: false. 실패하면 다음 주기에 다시 받는다
 */
export const chatUnreadCountQueryOptions = queryOptions({
	queryKey: chatUnreadCountQueryKey,
	queryFn: async (): Promise<number> => {
		try {
			const { data, error } = await api.chat["unread-count"].get();
			if (error || !data) {
				return 0;
			}
			return data.count;
		} catch {
			return 0;
		}
	},
	refetchInterval: 30_000,
	refetchOnWindowFocus: true,
	retry: false,
});
