import { normalizeMarketSearchParams } from "@/components/market/v2/data/search-params";
import MarketPageContent from "@/components/market/v2/server/market-page-content";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
	title: "마켓 | POCAZ",
	description: "최신 포토카드 거래를 검색하고 필터링해 보세요.",
	path: "/market",
	ogTitle: "Market",
});

export default async function MarketPage({
	searchParams,
}: PageProps<"/market">) {
	const params = await searchParams;
	const filters = normalizeMarketSearchParams(params);

	return <MarketPageContent filters={filters} />;
}
