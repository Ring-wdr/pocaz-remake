type MarketQuery = {
	keyword: string;
	status: string;
	sort: string;
};

const DEFAULT_STATUS = "all";
const DEFAULT_SORT = "latest";

export function updateMarketQueryString({ keyword, status, sort }: MarketQuery) {
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
