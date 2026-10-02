type MarketQuery = {
	keyword: string;
	status: string;
	condition: string;
	negotiable: boolean;
	groupId: string | null;
	artistId: string | null;
	sort: string;
};

const DEFAULT_STATUS = "all";
const DEFAULT_CONDITION = "all";
const DEFAULT_SORT = "latest";

export function updateMarketQueryString({
	keyword,
	status,
	condition,
	negotiable,
	groupId,
	artistId,
	sort,
}: MarketQuery) {
	if (typeof window === "undefined") return;

	const url = new URL(window.location.href);
	const params = url.searchParams;

	const normalizedKeyword = keyword.trim();

	if (normalizedKeyword) {
		params.set("keyword", normalizedKeyword);
	} else {
		params.delete("keyword");
	}

	if (status && status !== DEFAULT_STATUS) {
		params.set("status", status);
	} else {
		params.delete("status");
	}

	if (condition && condition !== DEFAULT_CONDITION) {
		params.set("condition", condition);
	} else {
		params.delete("condition");
	}

	if (negotiable) {
		params.set("negotiable", "true");
	} else {
		params.delete("negotiable");
	}

	if (groupId) {
		params.set("groupId", groupId);
	} else {
		params.delete("groupId");
	}

	if (artistId) {
		params.set("artistId", artistId);
	} else {
		params.delete("artistId");
	}

	if (sort && sort !== DEFAULT_SORT) {
		params.set("sort", sort);
	} else {
		params.delete("sort");
	}

	// 리스트 이동 시 서버 커서와 어긋나지 않도록 클라이언트 관리
	params.delete("cursor");

	const nextSearch = params.toString();
	const nextUrl = `${url.pathname}${nextSearch ? `?${nextSearch}` : ""}${url.hash}`;

	window.history.replaceState({}, "", nextUrl);
}
