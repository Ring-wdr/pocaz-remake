import { queryOptions } from "@tanstack/react-query";
import type { ArtistTag } from "@/types/entities";
import { api } from "@/utils/eden";

/**
 * 그룹의 멤버 목록을 가져온다. 서버와 클라이언트에서 모두 쓰고, 실패하면 던진다.
 */
export async function fetchGroupArtists(groupId: string): Promise<ArtistTag[]> {
	const { data, error } = await api.groups({ id: groupId }).artists.get();
	if (error || !data) {
		throw new Error("Failed to fetch group artists");
	}
	return data.items.map(({ id, name }) => ({ id, name }));
}

/**
 * 그룹의 멤버 목록 쿼리 옵션
 * - groupId가 필수 파라미터
 * - staleTime: 30분 (카탈로그는 거의 바뀌지 않음)
 * - gcTime: 1시간
 */
export const groupArtistsQueryOptions = (groupId: string) =>
	queryOptions({
		queryKey: ["artists", "group", groupId] as const,
		queryFn: () => fetchGroupArtists(groupId),
		staleTime: 30 * 60 * 1000,
		gcTime: 60 * 60 * 1000,
	});
