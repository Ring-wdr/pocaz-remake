"use client";

import * as stylex from "@stylexjs/stylex";

import { spacing } from "@/app/global-tokens.stylex";
import SearchBar from "./search-bar";
import FilterTabsSection from "./sections/filter-tabs-section";
import SortSelect from "./sections/sort-select";
import type { MarketFilterValue, MarketSortValue } from "./sections/types";

const styles = stylex.create({
	container: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xxs,
		marginBottom: spacing.sm,
	},
});

interface MarketFiltersProps {
	keyword: string;
	status: MarketFilterValue;
	sort: MarketSortValue;
	onKeywordChange: (value: string) => void;
	onStatusChange: (value: MarketFilterValue) => void;
	onSortChange: (value: MarketSortValue) => void;
	isPending?: boolean;
}

export default function MarketFilters({
	keyword,
	status,
	sort,
	onKeywordChange,
	onStatusChange,
	onSortChange,
	isPending,
}: MarketFiltersProps) {
	return (
		<div {...stylex.props(styles.container)}>
			<SearchBar value={keyword} onChange={onKeywordChange} />
			<FilterTabsSection
				value={status}
				onFilterChange={onStatusChange}
			/>
			<SortSelect
				value={sort}
				onChange={onSortChange}
				disabled={isPending}
			/>
		</div>
	);
}
