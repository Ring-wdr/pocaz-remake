"use client";

import * as stylex from "@stylexjs/stylex";
import { spacing } from "@/app/global-tokens.stylex";
import { marketConditionOptions } from "@/components/market/market-condition";
import type { MarketConditionFilterValue } from "../types";
import FilterChip from "./filter-chip";

const options: { id: MarketConditionFilterValue; name: string }[] = [
	{ id: "all", name: "전체" },
	...marketConditionOptions,
];

const styles = stylex.create({
	// fieldset의 기본 테두리·여백·최소 너비를 없앤 칩 묶음
	group: {
		minWidth: 0,
		marginTop: 0,
		marginLeft: 0,
		marginRight: 0,
		marginBottom: spacing.sm,
		padding: 0,
		borderWidth: 0,
	},
	srOnly: {
		position: "absolute",
		width: "1px",
		height: "1px",
		padding: 0,
		margin: "-1px",
		overflow: "hidden",
		clip: "rect(0, 0, 0, 0)",
		whiteSpace: "nowrap",
		borderWidth: 0,
	},
	chips: {
		display: "flex",
		gap: spacing.xxs,
		overflowX: "auto",
	},
});

type ConditionFilterProps = {
	value: MarketConditionFilterValue;
	onChange: (value: MarketConditionFilterValue) => void;
};

/** 상품 상태(새 상품~사용감 있음)로 거르는 칩 줄 */
export default function ConditionFilter({
	value,
	onChange,
}: ConditionFilterProps) {
	return (
		<fieldset {...stylex.props(styles.group)}>
			<legend {...stylex.props(styles.srOnly)}>상품 상태</legend>
			<div {...stylex.props(styles.chips)}>
				{options.map((option) => (
					<FilterChip
						key={option.id}
						active={value === option.id}
						onClick={() => onChange(option.id)}
					>
						{option.name}
					</FilterChip>
				))}
			</div>
		</fieldset>
	);
}
