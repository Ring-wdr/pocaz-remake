import type { ArtistTag } from "@/types/entities";

/** 그룹·멤버 태그가 달린 상품. 목록·상세 응답이 이 모양을 갖고 있다 */
type TaggedMarket = {
	group: ArtistTag | null;
	artist: ArtistTag | null;
};

/** 상품의 태그를 "르세라핌 · 김채원"으로 적는다. 멤버가 없으면 그룹만, 둘 다 없으면 null */
export function formatArtistTag({
	group,
	artist,
}: TaggedMarket): string | null {
	const names = [group?.name, artist?.name].filter((name): name is string =>
		Boolean(name),
	);
	return names.length > 0 ? names.join(" · ") : null;
}

/** 태그를 누르면 가는 마켓 목록 주소. 그 그룹·멤버로 거른다. 태그가 없으면 null */
export function getArtistTagHref({
	group,
	artist,
}: TaggedMarket): string | null {
	const params = new URLSearchParams();
	if (group) params.set("groupId", group.id);
	if (artist) params.set("artistId", artist.id);
	const query = params.toString();
	return query ? `/market?${query}` : null;
}
