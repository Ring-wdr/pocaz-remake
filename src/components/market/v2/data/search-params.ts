import type { MarketFilterValue, MarketSearchFilters, MarketSortValue } from "../types";

type MarketSearchParams = Awaited<PageProps<"/market">["searchParams"]>;

const statusValues = new Set<MarketFilterValue>([
	"all",
	"available",
	"reserved",
	"sold",
]);

const sortValues = new Set<MarketSortValue>([
	"latest",
	"priceAsc",
	"priceDesc",
]);

function pickFirst(value?: string | string[]) {
	if (!value) return undefined;
	return Array.isArray(value) ? value[0] : value;
}

export function normalizeMarketSearchParams(params: MarketSearchParams): MarketSearchFilters {
	const keyword = pickFirst(params?.keyword) ?? "";
	const statusParam = pickFirst(params?.status);
	const sortParam = pickFirst(params?.sort);
	const cursor = pickFirst(params?.cursor) ?? null;

	const status = statusParam && statusValues.has(statusParam as MarketFilterValue)
		? (statusParam as MarketFilterValue)
		: "all";

	const sort = sortParam && sortValues.has(sortParam as MarketSortValue)
		? (sortParam as MarketSortValue)
		: "latest";

	return {
		keyword,
		status,
		sort,
		cursor,
	};
}
