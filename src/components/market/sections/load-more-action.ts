"use server";

import { fetchMarketList } from "./fetch-market-list";
import type {
	MarketFilterValue,
	MarketListItem,
	MarketListState,
	MarketSortValue,
} from "./types";

function mergeItems(
	existing: MarketListItem[],
	incoming: MarketListItem[],
): MarketListItem[] {
	const map = new Map<string, MarketListItem>();
	existing.forEach((item) => {
		map.set(item.id, item);
	});
	incoming.forEach((item) => {
		map.set(item.id, item);
	});
	return Array.from(map.values());
}

export async function loadMoreMarkets(
	prevState: MarketListState,
	formData: FormData,
): Promise<MarketListState> {
	const cursor = prevState.nextCursor ?? formData.get("cursor")?.toString();
	if (!cursor) {
		return { ...prevState, hasMore: false, nextCursor: null };
	}

	const keyword = formData.get("keyword")?.toString() ?? "";
	const status =
		(formData.get("status")?.toString() as MarketFilterValue | undefined) ??
		"all";
	const sort =
		(formData.get("sort")?.toString() as MarketSortValue | undefined) ??
		"latest";
	const limit =
		Number.parseInt(formData.get("limit")?.toString() ?? "20", 10) || 20;

	try {
		const { data, error: fetchError } = await fetchMarketList({
			keyword,
			status,
			sort,
			cursor,
			limit,
		});

		if (fetchError || !data) {
			return {
				...prevState,
				error: "상품을 더 불러오지 못했습니다. 다시 시도해 주세요.",
			};
		}

		const mergedItems = mergeItems(prevState.items, data.items);

		return {
			items: mergedItems,
			nextCursor: data.nextCursor,
			hasMore: data.hasMore,
			error: null,
		};
	} catch (error) {
		console.error("Failed to load more markets:", error);
		return {
			...prevState,
			error: "상품을 불러오는 중 문제가 발생했습니다.",
		};
	}
}
