import { unstable_rethrow } from "next/navigation";
import { api } from "@/utils/eden";
import type {
	MarketConditionFilterValue,
	MarketFilterValue,
	MarketListResult,
	MarketSortValue,
} from "../types";

export type MarketListQuery = {
	keyword?: string;
	status?: MarketFilterValue;
	condition?: MarketConditionFilterValue;
	negotiable?: boolean;
	groupId?: string | null;
	artistId?: string | null;
	sort?: MarketSortValue;
	cursor?: string | null;
	limit?: number;
};

export async function getMarketList({
	keyword,
	status = "all",
	condition = "all",
	negotiable = false,
	groupId,
	artistId,
	sort = "latest",
	cursor,
	limit = 20,
}: MarketListQuery): Promise<{
	data: MarketListResult | null;
	error: string | null;
}> {
	try {
		let response: Awaited<ReturnType<typeof api.markets.get>>;

		// 세 조회(검색·상태별·기본 목록)가 같은 쿼리를 쓰므로 상품 상태·협상 가능·그룹·멤버 필터가 빠지는 경로가 없다
		const query = {
			cursor: cursor ?? undefined,
			limit,
			sort,
			condition: condition !== "all" ? condition : undefined,
			negotiable: negotiable ? true : undefined,
			groupId: groupId ?? undefined,
			artistId: artistId ?? undefined,
		};

		if (keyword) {
			response = await api.markets.search.get({
				query: {
					...query,
					keyword,
					status: status !== "all" ? status : undefined,
				},
			});
		} else if (status && status !== "all") {
			response = await api.markets.status({ status }).get({ query });
		} else {
			response = await api.markets.get({ query });
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
