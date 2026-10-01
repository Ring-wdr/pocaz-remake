import { unstable_rethrow } from "next/navigation";
import { api } from "@/utils/eden";
import type {
	MarketFilterValue,
	MarketListResult,
	MarketSortValue,
} from "../types";

export type MarketListQuery = {
	keyword?: string;
	status?: MarketFilterValue;
	sort?: MarketSortValue;
	cursor?: string | null;
	limit?: number;
};

export async function getMarketList({
	keyword,
	status = "all",
	sort = "latest",
	cursor,
	limit = 20,
}: MarketListQuery): Promise<{
	data: MarketListResult | null;
	error: string | null;
}> {
	try {
		let response: Awaited<ReturnType<typeof api.markets.get>>;

		if (keyword) {
			response = await api.markets.search.get({
				query: {
					keyword,
					cursor: cursor ?? undefined,
					limit,
					sort,
					status: status !== "all" ? status : undefined,
				},
			});
		} else if (status && status !== "all") {
			response = await api.markets.status({ status }).get({
				query: { cursor: cursor ?? undefined, limit, sort },
			});
		} else {
			response = await api.markets.get({
				query: { cursor: cursor ?? undefined, limit, sort },
			});
		}

		if (response.error || !response.data) {
			return { data: null, error: "상품을 불러올 수 없습니다" };
		}

		return { data: response.data, error: null };
	} catch (error) {
		// 서버 렌더링 중 cookies()가 던지는 동적 렌더링 신호 같은 Next 내부 오류는 삼키지 않는다
		unstable_rethrow(error);
		console.error("getMarketList failed", error);
		return { data: null, error: "상품을 불러오는 중 오류가 발생했습니다" };
	}
}
