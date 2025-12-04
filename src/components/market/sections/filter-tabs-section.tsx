"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { colors, fontWeight, spacing } from "@/app/global-tokens.stylex";
import type { MarketFilterValue } from "./types";

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
	tab: {
		paddingTop: "6px",
		paddingBottom: "6px",
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		borderRadius: "16px",
		fontSize: "13px",
		fontWeight: fontWeight.medium,
		backgroundColor: colors.bgTertiary,
		color: colors.textMuted,
		borderWidth: 0,
		cursor: "pointer",
		whiteSpace: "nowrap",
		transition: "all 0.2s ease",
	},
	tabActive: {
		backgroundColor: colors.bgInverse,
		color: colors.textInverse,
	},
});

interface FilterTabsSectionProps {
	value?: MarketFilterValue;
	onFilterChange?: (filter: MarketFilterValue) => void;
}

export default function FilterTabsSection({
	value = "all",
	onFilterChange,
}: FilterTabsSectionProps) {
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
				<button
					key={filter.id}
					type="button"
					onClick={() => handleClick(filter.id)}
					{...stylex.props(
						styles.tab,
						activeFilter === filter.id && styles.tabActive,
					)}
				>
					{filter.name}
				</button>
			))}
		</div>
	);
}
