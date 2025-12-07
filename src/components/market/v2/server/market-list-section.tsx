import type { MarketSearchFilters, MarketListState } from "../types";
import { getMarketList } from "../data/get-market-list";
import MarketListClient from "../client/market-list-client";

type MarketListSectionProps = MarketSearchFilters & {
	limit?: number;
};

export default async function MarketListSection({
	keyword,
	status,
	sort,
	cursor,
	limit = 20,
}: MarketListSectionProps) {
	const { data, error } = await getMarketList({
		keyword,
		status,
		sort,
		cursor,
		limit,
	});

	const initialState: MarketListState = {
		items: data?.items ?? [],
		nextCursor: data?.nextCursor ?? null,
		hasMore: data?.hasMore ?? false,
		error: error || !data ? "상품을 불러올 수 없습니다" : null,
	};

	return (
		<MarketListClient
			initialState={initialState}
			initialFilters={{ keyword, status, sort }}
			limit={limit}
		/>
	);
}
