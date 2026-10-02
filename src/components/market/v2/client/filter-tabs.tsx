"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { spacing } from "@/app/global-tokens.stylex";
import type { MarketFilterValue } from "../types";
import FilterChip from "./filter-chip";

const filters: { id: MarketFilterValue; name: string }[] = [
	{ id: "all", name: "전체" },
	{ id: "available", name: "판매중" },
	{ id: "reserved", name: "예약중" },
	{ id: "sold", name: "판매완료" },
];

const styles = stylex.create({
	container: {
		display: "flex",
		gap: spacing.xxs,
		marginBottom: spacing.sm,
		overflowX: "auto",
	},
});

type FilterTabsProps = {
	value?: MarketFilterValue;
	onFilterChange?: (filter: MarketFilterValue) => void;
};

export default function FilterTabs({
	value = "all",
	onFilterChange,
}: FilterTabsProps) {
	const [activeFilter, setActiveFilter] = useState<MarketFilterValue>(value);

	useEffect(() => {
		setActiveFilter(value);
	}, [value]);

	const handleClick = (nextValue: MarketFilterValue) => {
		setActiveFilter(nextValue);
		onFilterChange?.(nextValue);
	};

	return (
		<div {...stylex.props(styles.container)}>
			{filters.map((filter) => (
				<FilterChip
					key={filter.id}
					active={activeFilter === filter.id}
					onClick={() => handleClick(filter.id)}
				>
					{filter.name}
				</FilterChip>
			))}
		</div>
	);
}
