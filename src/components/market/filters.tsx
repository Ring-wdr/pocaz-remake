"use client";

import * as stylex from "@stylexjs/stylex";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

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
	keyword?: string;
	status?: MarketFilterValue;
	sort?: MarketSortValue;
}

const DEFAULT_STATUS: MarketFilterValue = "all";
const DEFAULT_SORT: MarketSortValue = "latest";

export default function MarketFilters({
	keyword,
	status,
	sort,
}: MarketFiltersProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();

	const updateParams = (updates: {
		keyword?: string;
		status?: MarketFilterValue;
		sort?: MarketSortValue;
	}) => {
		const params = new URLSearchParams(searchParams);

		if (updates.keyword !== undefined) {
			const trimmed = updates.keyword.trim();
			if (trimmed) {
				params.set("keyword", trimmed);
			} else {
				params.delete("keyword");
			}
		}

		if (updates.status !== undefined) {
			if (updates.status === DEFAULT_STATUS) {
				params.delete("status");
			} else {
				params.set("status", updates.status);
			}
		}

		if (updates.sort !== undefined) {
			if (updates.sort === DEFAULT_SORT) {
				params.delete("sort");
			} else {
				params.set("sort", updates.sort);
			}
		}

		params.delete("cursor");

		const queryString = params.toString();
		startTransition(() => {
			router.replace(queryString ? `/market?${queryString}` : "/market");
		});
	};

	return (
		<div {...stylex.props(styles.container)}>
			<SearchBar initialValue={keyword ?? ""} onSearch={(value) => updateParams({ keyword: value })} />
			<FilterTabsSection
				value={status ?? DEFAULT_STATUS}
				onFilterChange={(value) => updateParams({ status: value })}
			/>
			<SortSelect
				value={sort ?? DEFAULT_SORT}
				onChange={(value) => updateParams({ sort: value })}
				disabled={isPending}
			/>
		</div>
	);
}
