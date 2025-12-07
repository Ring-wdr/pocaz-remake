"use server";

import { getMarketList } from "../data/get-market-list";
import type {
	MarketFilterValue,
	MarketListItem,
	MarketListState,
	MarketSortValue,
} from "../types";

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

type MarketActionMode = "append" | "replace";

const APPEND_ERROR_MESSAGE = "상품을 더 불러오지 못했습니다. 다시 시도해 주세요.";
const REPLACE_ERROR_MESSAGE = "상품을 불러오는 중 문제가 발생했습니다.";

function getActionMode(value: string | null): MarketActionMode {
	if (value === "append") return "append";
	return "replace";
}

function parseFilters(formData: FormData) {
	const keyword = formData.get("keyword")?.toString().trim() ?? "";
	const status =
		(formData.get("status")?.toString() as MarketFilterValue | undefined) ??
		"all";
	const sort =
		(formData.get("sort")?.toString() as MarketSortValue | undefined) ??
		"latest";
	const limit =
		Number.parseInt(formData.get("limit")?.toString() ?? "20", 10) || 20;

	return { keyword, status, sort, limit };
}

export async function updateMarketList(
	prevState: MarketListState,
	formData: FormData,
): Promise<MarketListState> {
	const mode = getActionMode(formData.get("mode")?.toString() ?? null);
	const cursorInput = formData.get("cursor")?.toString() ?? undefined;
	const cursor = mode === "append" ? cursorInput ?? prevState.nextCursor : null;
	const { keyword, status, sort, limit } = parseFilters(formData);

	if (mode === "append" && !cursor) {
		return { ...prevState, hasMore: false, nextCursor: null };
	}

	try {
		const { data, error: fetchError } = await getMarketList({
			keyword,
			status,
			sort,
			cursor,
			limit,
		});

		if (fetchError || !data) {
			const errorMessage =
				mode === "append" ? APPEND_ERROR_MESSAGE : REPLACE_ERROR_MESSAGE;

			return {
				...prevState,
				error: errorMessage,
			};
		}

		if (mode === "append") {
			const mergedItems = mergeItems(prevState.items, data.items);

			return {
				items: mergedItems,
				nextCursor: data.nextCursor,
				hasMore: data.hasMore,
				error: null,
			};
		}

		return {
			items: data.items,
			nextCursor: data.nextCursor,
			hasMore: data.hasMore,
			error: null,
		};
	} catch (error) {
		console.error("Failed to update markets:", error);
		return {
			...prevState,
			error:
				mode === "append"
					? APPEND_ERROR_MESSAGE
					: "상품을 불러오는 중 문제가 발생했습니다.",
		};
	}
}
