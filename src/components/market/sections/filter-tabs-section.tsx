"use client";

import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { colors, fontWeight, spacing } from "@/app/global-tokens.stylex";

const filters = [
	{ id: 0, name: "전체", value: "all" },
	{ id: 1, name: "양도", value: "sell" },
	{ id: 2, name: "구해요", value: "buy" },
	{ id: 3, name: "교환", value: "trade" },
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
	onFilterChange?: (filter: string) => void;
}

export default function FilterTabsSection({
	onFilterChange,
}: FilterTabsSectionProps) {
	const [activeFilter, setActiveFilter] = useState("all");

	const handleClick = (value: string) => {
		setActiveFilter(value);
		onFilterChange?.(value);
	};

	return (
		<div {...stylex.props(styles.container)}>
			{filters.map((filter) => (
				<button
					key={filter.id}
					type="button"
					onClick={() => handleClick(filter.value)}
					{...stylex.props(
						styles.tab,
						activeFilter === filter.value && styles.tabActive,
					)}
				>
					{filter.name}
				</button>
			))}
		</div>
	);
}
