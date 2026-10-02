import { unstable_rethrow } from "next/navigation";
import { fetchGroupArtists } from "@/lib/queries/artists";
import type { ArtistCatalogGroup, ArtistTag } from "@/types/entities";
import { api } from "@/utils/eden";

/**
 * 서버 컴포넌트가 그룹·멤버 카탈로그를 가져오는 함수들.
 * 태그는 선택 사항이라 불러오지 못해도 페이지는 그대로 뜨게 하고, 그 영역만 비운다.
 */

/** 그룹 목록. 불러오지 못하면 빈 배열 */
export async function getArtistGroups(): Promise<ArtistTag[]> {
	try {
		const { data, error } = await api.groups.get();
		if (error || !data) return [];
		return data.items.map(({ id, name }) => ({ id, name }));
	} catch (error) {
		// 서버 렌더링 중 cookies()가 던지는 동적 렌더링 신호 같은 Next 내부 오류는 삼키지 않는다
		unstable_rethrow(error);
		console.error("getArtistGroups failed", error);
		return [];
	}
}

/** 그룹 하나의 멤버 목록. 불러오지 못하면 null (멤버가 없는 그룹의 빈 배열과 구분한다) */
export async function getGroupArtists(
	groupId: string,
): Promise<ArtistTag[] | null> {
	try {
		return await fetchGroupArtists(groupId);
	} catch (error) {
		unstable_rethrow(error);
		console.error("getGroupArtists failed", error);
		return null;
	}
}

/**
 * 등록·수정 폼의 선택지. 그룹마다 멤버를 묶어서 한 번에 돌려준다.
 * 멤버가 그룹에 속하지 않은 아티스트는 그룹을 먼저 고르는 폼에서 고를 수 없으므로 뺀다. 불러오지 못하면 빈 배열
 */
export async function getArtistCatalog(): Promise<ArtistCatalogGroup[]> {
	try {
		const [groupsResult, artistsResult] = await Promise.all([
			api.groups.get(),
			api.artists.get(),
		]);
		if (groupsResult.error || !groupsResult.data) return [];
		if (artistsResult.error || !artistsResult.data) return [];

		const artistsByGroup = new Map<string, ArtistTag[]>();
		for (const artist of artistsResult.data.items) {
			if (!artist.group) continue;
			const members = artistsByGroup.get(artist.group.id) ?? [];
			members.push({ id: artist.id, name: artist.name });
			artistsByGroup.set(artist.group.id, members);
		}

		return groupsResult.data.items.map((group) => ({
			id: group.id,
			name: group.name,
			artists: artistsByGroup.get(group.id) ?? [],
		}));
	} catch (error) {
		unstable_rethrow(error);
		console.error("getArtistCatalog failed", error);
		return [];
	}
}
