import { api } from "@/utils/eden";
import type {
	MarketFilterValue,
	MarketListResult,
	MarketSortValue,
} from "./types";

export interface MarketListQuery {
	keyword?: string;
	status?: MarketFilterValue;
	sort?: MarketSortValue;
	cursor?: string | null;
	limit?: number;
}

export async function fetchMarketList({
	keyword,
	status = "all",
	sort = "latest",
	cursor,
	limit = 20,
}: MarketListQuery): Promise<{
	data: MarketListResult | null;
	error: string | null;
}> {
	const limitString = limit.toString();

	try {
		let response: Awaited<ReturnType<typeof api.markets.get>>;

		if (keyword) {
			response = await api.markets.search.get({
				query: {
					keyword,
					cursor: cursor ?? undefined,
					limit: limitString,
					sort,
				},
			});
		} else if (status && status !== "all") {
			response = await api.markets
				.status({ status })
				.get({
					query: { cursor: cursor ?? undefined, limit: limitString, sort },
				});
		} else {
			response = await api.markets.get({
				query: { cursor: cursor ?? undefined, limit: limitString, sort },
			});
		}

		if (response.error || !response.data) {
			return { data: null, error: "상품을 불러올 수 없습니다" };
		}

		return { data: response.data, error: null };
	} catch (error) {
		console.error("fetchMarketList failed", error);
		return { data: null, error: "상품을 불러오는 중 오류가 발생했습니다" };
	}
}
