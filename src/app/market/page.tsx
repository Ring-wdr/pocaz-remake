import * as stylex from "@stylexjs/stylex";
import { Suspense } from "react";
import { Footer } from "@/components/home";
import { PageHeader, SearchBar } from "@/components/market";
import {
	FilterTabsSection,
	ProductGridSection,
} from "@/components/market/sections";
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

export default function MarketPage() {
	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.content)}>
				<PageHeader />
				<SearchBar />
				<FilterTabsSection />
				<Suspense fallback={<ProductGridSkeleton />}>
					<ProductGridSection />
				</Suspense>
			</div>
			<Footer />
		</div>
	);
}
