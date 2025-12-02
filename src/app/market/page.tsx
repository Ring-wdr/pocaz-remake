import * as stylex from "@stylexjs/stylex";
import { Suspense } from "react";
import { Footer } from "@/components/home";
import { MarketFilters, PageHeader } from "@/components/market";
import { ProductGridSection } from "@/components/market/sections";
import type {
	MarketFilterValue,
	MarketSortValue,
} from "@/components/market/sections/types";
import { ProductGridSkeleton } from "@/components/market/skeletons";
import { createMetadata } from "@/lib/metadata";
import { colors } from "../global-tokens.stylex";

export const metadata = createMetadata({
	title: "마켓 | POCAZ",
	description: "최신 포토카드 거래를 검색하고 필터링해 보세요.",
	path: "/market",
	ogTitle: "Market",
});

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: colors.bgPrimary,
	},
	content: {
		flex: 1,
		paddingTop: "20px",
		paddingLeft: "14px",
		paddingRight: "14px",
		paddingBottom: "24px",
	},
});

const statusValues: MarketFilterValue[] = [
	"all",
	"available",
	"reserved",
	"sold",
];
const sortValues: MarketSortValue[] = ["latest", "priceAsc", "priceDesc"];

function pickValue(param: string | string[] | undefined) {
	if (!param) return undefined;
	return Array.isArray(param) ? param[0] : param;
}

function parseStatus(status: string | undefined): MarketFilterValue {
	if (statusValues.includes(status as MarketFilterValue)) {
		return status as MarketFilterValue;
	}
	return "all";
}

function parseSort(sort: string | undefined): MarketSortValue {
	if (sortValues.includes(sort as MarketSortValue)) {
		return sort as MarketSortValue;
	}
	return "latest";
}

export default async function MarketPage({
	searchParams,
}: PageProps<"/market">) {
	const params = await searchParams;
	const keywordParam = pickValue(params?.keyword);
	const statusParam = pickValue(params?.status);
	const sortParam = pickValue(params?.sort);
	const cursorParam = pickValue(params?.cursor);

	const keyword = keywordParam ?? "";
	const status = parseStatus(statusParam);
	const sort = parseSort(sortParam);

	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.content)}>
				<PageHeader />
				<MarketFilters keyword={keyword} status={status} sort={sort} />
				<Suspense fallback={<ProductGridSkeleton />}>
					<ProductGridSection
						keyword={keyword}
						status={status}
						sort={sort}
						cursor={cursorParam}
					/>
				</Suspense>
			</div>
			<Footer />
		</div>
	);
}
