import {
	getArtistGroups,
	getGroupArtists,
} from "@/components/market/get-artist-catalog";
import MarketListClient from "../client/market-list-client";
import { getMarketList } from "../data/get-market-list";
import type { MarketListState, MarketSearchFilters } from "../types";

type MarketListSectionProps = MarketSearchFilters & {
	limit?: number;
};

export default async function MarketListSection({
	keyword,
	status,
	condition,
	negotiable,
	groupId,
	artistId,
	sort,
	cursor,
	limit = 20,
}: MarketListSectionProps) {
	// 그룹 칩 줄과, 주소창에 그룹이 있으면 그 멤버 칩 줄도 첫 화면에 같이 나오도록 목록과 함께 가져온다
	const [{ data, error }, groups, groupArtists] = await Promise.all([
		getMarketList({
			keyword,
			status,
			condition,
			negotiable,
			groupId,
			artistId,
			sort,
			cursor,
			limit,
		}),
		getArtistGroups(),
		groupId ? getGroupArtists(groupId) : null,
	]);

	const initialState: MarketListState = {
		items: data?.items ?? [],
		nextCursor: data?.nextCursor ?? null,
		hasMore: data?.hasMore ?? false,
		error: error || !data ? "상품을 불러올 수 없습니다" : null,
	};

	return (
		<MarketListClient
			initialState={initialState}
			initialFilters={{
				keyword,
				status,
				condition,
				negotiable,
				groupId,
				artistId,
				sort,
			}}
			groups={groups}
			initialGroupArtists={
				groupId && groupArtists ? { groupId, artists: groupArtists } : null
			}
			limit={limit}
		/>
	);
}
