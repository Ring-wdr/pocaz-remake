"use client";

import * as stylex from "@stylexjs/stylex";

import { spacing } from "@/app/global-tokens.stylex";
import SearchBar from "@/components/market/search-bar";
import type { MarketFilterValue, MarketSortValue } from "../types";
import FilterTabs from "./filter-tabs";
import SortSelect from "./sort-select";

const styles = stylex.create({
	container: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xxs,
		marginBottom: spacing.sm,
	},
});

type FilterBarProps = {
	keyword: string;
	status: MarketFilterValue;
	sort: MarketSortValue;
	onKeywordChange: (value: string) => void;
	onKeywordSubmit: (value: string) => void;
	onStatusChange: (value: MarketFilterValue) => void;
	onSortChange: (value: MarketSortValue) => void;
	disabled?: boolean;
};

export default function FilterBar({
	keyword,
	status,
	sort,
	onKeywordChange,
	onKeywordSubmit,
	onStatusChange,
	onSortChange,
	disabled,
}: FilterBarProps) {
	return (
		<div {...stylex.props(styles.container)}>
			<SearchBar
				value={keyword}
				onChange={onKeywordChange}
				onSearch={onKeywordSubmit}
			/>
			<FilterTabs value={status} onFilterChange={onStatusChange} />
			<SortSelect value={sort} onChange={onSortChange} disabled={disabled} />
		</div>
	);
}
