export type MarketFilterValue = "all" | "available" | "reserved" | "sold";

export type MarketSortValue = "latest" | "priceAsc" | "priceDesc";

export type MarketListItem = {
	id: string;
	title: string;
	description: string | null;
	price: number | null;
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
	sort: MarketSortValue;
	cursor: string | null;
	limit?: number;
};
