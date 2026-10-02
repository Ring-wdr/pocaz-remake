"use client";

import * as stylex from "@stylexjs/stylex";

import { spacing } from "@/app/global-tokens.stylex";
import SearchBar from "@/components/market/search-bar";
import type {
	MarketConditionFilterValue,
	MarketFilterValue,
	MarketSortValue,
} from "../types";
import ConditionFilter from "./condition-filter";
import FilterChip from "./filter-chip";
import FilterTabs from "./filter-tabs";
import SortSelect from "./sort-select";

const styles = stylex.create({
	container: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xxs,
		marginBottom: spacing.sm,
	},
	// 협상 가능 토글은 왼쪽, 정렬은 오른쪽
	optionRow: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: spacing.xxs,
		marginBottom: spacing.sm,
	},
});

type FilterBarProps = {
	keyword: string;
	status: MarketFilterValue;
	condition: MarketConditionFilterValue;
	negotiable: boolean;
	sort: MarketSortValue;
	onKeywordChange: (value: string) => void;
	onKeywordSubmit: (value: string) => void;
	onStatusChange: (value: MarketFilterValue) => void;
	onConditionChange: (value: MarketConditionFilterValue) => void;
	onNegotiableChange: (value: boolean) => void;
	onSortChange: (value: MarketSortValue) => void;
	disabled?: boolean;
};

export default function FilterBar({
	keyword,
	status,
	condition,
	negotiable,
	sort,
	onKeywordChange,
	onKeywordSubmit,
	onStatusChange,
	onConditionChange,
	onNegotiableChange,
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
			<ConditionFilter value={condition} onChange={onConditionChange} />
			<div {...stylex.props(styles.optionRow)}>
				<FilterChip
					active={negotiable}
					onClick={() => onNegotiableChange(!negotiable)}
				>
					협상 가능만
				</FilterChip>
				<SortSelect value={sort} onChange={onSortChange} disabled={disabled} />
			</div>
		</div>
	);
}
