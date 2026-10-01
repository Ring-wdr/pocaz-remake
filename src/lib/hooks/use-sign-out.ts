"use client";

import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "@/lib/auth/actions";

/**
 * 로그아웃. 같은 기기의 다음 사용자에게 이전 사용자의 채팅 목록·프로필이 캐시에서 보이지 않도록
 * React Query 캐시를 먼저 비운다(signOut은 리다이렉트로 끝나므로 그 뒤에는 실행되지 않는다).
 */
export function useSignOut() {
	const queryClient = useQueryClient();
	return async () => {
		queryClient.clear();
		await signOut();
	};
}
