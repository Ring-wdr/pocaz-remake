"use client";

import * as stylex from "@stylexjs/stylex";
import { colors, fontSize, fontWeight, radius, spacing } from "@/app/global-tokens.stylex";
import type { MarketSortValue } from "./types";

const styles = stylex.create({
	container: {
		display: "flex",
		alignItems: "center",
		justifyContent: "flex-end",
		marginBottom: spacing.sm,
		gap: spacing.xxs,
	},
	label: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
		margin: 0,
	},
	select: {
		paddingTop: spacing.xxxs,
		paddingBottom: spacing.xxxs,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		fontSize: fontSize.sm,
		fontWeight: fontWeight.medium,
		color: colors.textSecondary,
		backgroundColor: colors.bgTertiary,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		borderRadius: radius.sm,
	},
});

interface SortSelectProps {
	value?: MarketSortValue;
	onChange?: (value: MarketSortValue) => void;
	disabled?: boolean;
}

export default function SortSelect({
	value = "latest",
	onChange,
	disabled,
}: SortSelectProps) {
	return (
		<div {...stylex.props(styles.container)}>
			<span {...stylex.props(styles.label)}>정렬</span>
			<select
				value={value}
				onChange={(event) => onChange?.(event.target.value as MarketSortValue)}
				disabled={disabled}
				{...stylex.props(styles.select)}
			>
				<option value="latest">최신순</option>
				<option value="priceAsc">낮은 가격순</option>
				<option value="priceDesc">높은 가격순</option>
			</select>
		</div>
	);
}
