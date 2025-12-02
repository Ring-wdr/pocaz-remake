import * as stylex from "@stylexjs/stylex";
import { Store } from "lucide-react";
import { colors, fontSize, spacing } from "@/app/global-tokens.stylex";
import type { MarketFilterValue, MarketListState } from "./types";
import ProductGridClient from "./product-grid-section.client";
import type { MarketSortValue } from "./types";
import { fetchMarketList } from "./fetch-market-list";

const styles = stylex.create({
	emptyState: {
		textAlign: "center",
		paddingTop: spacing.xl,
		paddingBottom: spacing.xl,
		color: colors.textPlaceholder,
	},
	emptyIcon: {
		fontSize: "48px",
		marginBottom: spacing.xs,
	},
	emptyText: {
		fontSize: fontSize.md,
		margin: 0,
	},
});

interface ProductGridSectionProps {
	keyword?: string;
	status?: MarketFilterValue;
	sort?: MarketSortValue;
	cursor?: string | null;
	limit?: number;
}

export default async function ProductGridSection({
	keyword,
	status = "all",
	sort = "latest",
	cursor,
	limit = 20,
}: ProductGridSectionProps) {
	const { data, error } = await fetchMarketList({
		keyword,
		status,
		sort,
		cursor,
		limit,
	});

	if (error || !data) {
		return (
			<div {...stylex.props(styles.emptyState)}>
				<Store size={48} {...stylex.props(styles.emptyIcon)} />
				<p {...stylex.props(styles.emptyText)}>상품을 불러올 수 없습니다</p>
			</div>
		);
	}

	const initialState: MarketListState = {
		items: data.items,
		nextCursor: data.nextCursor,
		hasMore: data.hasMore,
		error: null,
	};

	return (
		<ProductGridClient
			key={`${keyword ?? ""}|${status}|${sort}`}
			initialState={initialState}
			status={status}
			keyword={keyword ?? ""}
			sort={sort}
			limit={limit}
		/>
	);
}
