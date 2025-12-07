import * as stylex from "@stylexjs/stylex";
import { Suspense } from "react";
import { colors } from "@/app/global-tokens.stylex";
import { Footer } from "@/components/home";
import { PageHeader } from "@/components/market";
import {
	FilterBarSkeleton,
	ProductGridSkeleton,
} from "@/components/market/skeletons";
import type { MarketSearchFilters } from "../types";
import MarketListSection from "./market-list-section";

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

type MarketPageContentProps = {
	filters: MarketSearchFilters;
};

export default function MarketPageContent({ filters }: MarketPageContentProps) {
	return (
		<div {...stylex.props(styles.container)}>
			<PageHeader />
			<main {...stylex.props(styles.content)}>
				<Suspense
					fallback={
						<>
							<FilterBarSkeleton />
							<ProductGridSkeleton />
						</>
					}
				>
					<MarketListSection {...filters} />
				</Suspense>
			</main>
			<Footer />
		</div>
	);
}
