import type { MarketCondition } from "@/types/entities";

export type MarketFilterValue = "all" | "available" | "reserved" | "sold";

export type MarketConditionFilterValue = "all" | MarketCondition;

export type MarketSortValue = "latest" | "priceAsc" | "priceDesc";

export type MarketListItem = {
	id: string;
	title: string;
	description: string | null;
	price: number | null;
	condition: MarketCondition | null;
	isNegotiable: boolean;
	status: string;
	createdAt: string;
	user: {
		id: string;
		nickname: string;
		profileImage: string | null;
	};
	images: {
		id: string;
		imageUrl: string;
	}[];
};

export type MarketListResult = {
	items: MarketListItem[];
	nextCursor: string | null;
	hasMore: boolean;
};

export type MarketListState = MarketListResult & {
	error: string | null;
};

export type MarketSearchFilters = {
	keyword: string;
	status: MarketFilterValue;
	condition: MarketConditionFilterValue;
	/** true면 협상 가능한 상품만 */
	negotiable: boolean;
	sort: MarketSortValue;
	cursor: string | null;
	limit?: number;
};

/** 화면에 적용된 필터 값. 페이지 위치(cursor, limit)는 포함하지 않는다 */
export type MarketListFilters = Omit<MarketSearchFilters, "cursor" | "limit">;
