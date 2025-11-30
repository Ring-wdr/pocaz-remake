import * as stylex from "@stylexjs/stylex";
import { Suspense } from "react";
import { Footer } from "@/components/home";
import { PageHeader, SearchBar } from "@/components/market";
import {
	FilterTabsSection,
	ProductGridSection,
} from "@/components/market/sections";
import { ProductGridSkeleton } from "@/components/market/skeletons";

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: "#fff",
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
