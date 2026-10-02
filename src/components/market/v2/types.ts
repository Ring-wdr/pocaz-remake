import type { ArtistTag, MarketCondition } from "@/types/entities";

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
	group: ArtistTag | null;
	artist: ArtistTag | null;
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
	/** 고른 그룹의 id. 전체면 null */
	groupId: string | null;
	/** 고른 멤버의 id. 그룹 전체(또는 그룹을 고르지 않음)면 null */
	artistId: string | null;
	sort: MarketSortValue;
	cursor: string | null;
	limit?: number;
};

/** 서버가 미리 가져온 그룹 하나의 멤버 목록. 주소창에 그룹이 있을 때 멤버 칩이 처음부터 보이게 한다 */
export type InitialGroupArtists = {
	groupId: string;
	artists: ArtistTag[];
};

/** 화면에 적용된 필터 값. 페이지 위치(cursor, limit)는 포함하지 않는다 */
export type MarketListFilters = Omit<MarketSearchFilters, "cursor" | "limit">;
