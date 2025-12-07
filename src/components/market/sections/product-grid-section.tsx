import type { MarketFilterValue, MarketListState } from "./types";
import ProductGridClient from "./product-grid-section.client";
import type { MarketSortValue } from "./types";
import { fetchMarketList } from "./fetch-market-list";

interface ProductGridSectionProps {
	keyword?: string;
	status?: MarketFilterValue;
	sort?: MarketSortValue;
	cursor?: string | null;
	limit?: number;
}

export default async function ProductGridSection({
	keyword,
	status = "all",
	sort = "latest",
	cursor,
	limit = 20,
}: ProductGridSectionProps) {
	const { data, error } = await fetchMarketList({
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
		<ProductGridClient
			key={`${keyword ?? ""}|${status}|${sort}`}
			initialState={initialState}
			initialStatus={status}
			initialKeyword={keyword ?? ""}
			initialSort={sort}
			limit={limit}
		/>
	);
}
