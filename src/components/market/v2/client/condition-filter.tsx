"use client";

import { marketConditionOptions } from "@/components/market/market-condition";
import type { MarketConditionFilterValue } from "../types";
import ChipGroup from "./chip-group";
import FilterChip from "./filter-chip";

const options: { id: MarketConditionFilterValue; name: string }[] = [
	{ id: "all", name: "전체" },
	...marketConditionOptions,
];

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
		<ChipGroup label="상품 상태">
			{options.map((option) => (
				<FilterChip
					key={option.id}
					active={value === option.id}
					onClick={() => onChange(option.id)}
				>
					{option.name}
				</FilterChip>
			))}
		</ChipGroup>
	);
}
