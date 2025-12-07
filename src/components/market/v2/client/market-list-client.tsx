"use client";

import * as stylex from "@stylexjs/stylex";
import { useMemo, useState, useTransition } from "react";

import { colors, fontSize, spacing } from "@/app/global-tokens.stylex";
import { getMarketList } from "../data/get-market-list";
import type {
	MarketFilterValue,
	MarketListItem,
	MarketListState,
	MarketSortValue,
} from "../types";
import EmptyState from "./empty-state";
import FilterBar from "./filter-bar";
import LoadMoreForm from "./load-more-form";
import MarketGrid from "./market-grid";

const styles = stylex.create({
	errorText: {
		marginTop: spacing.sm,
		textAlign: "center",
		color: colors.statusError,
		fontSize: fontSize.sm,
	},
});

type MarketListClientProps = {
	initialState: MarketListState;
	initialFilters: {
		keyword: string;
		status: MarketFilterValue;
		sort: MarketSortValue;
	};
	limit: number;
};

const mergeItems = (existing: MarketListItem[], incoming: MarketListItem[]) => {
	const map = new Map<string, MarketListItem>();
	existing.forEach((item) => {
		map.set(item.id, item);
	});
	incoming.forEach((item) => {
		map.set(item.id, item);
	});
	return Array.from(map.values());
};

export default function MarketListClient({
	initialState,
	initialFilters,
	limit,
}: MarketListClientProps) {
	const [state, setState] = useState<MarketListState>(initialState);
	const [status, setStatus] = useState<MarketFilterValue>(
		initialFilters.status,
	);
	const [sort, setSort] = useState<MarketSortValue>(initialFilters.sort);
	const [keywordInput, setKeywordInput] = useState(initialFilters.keyword);
	const [appliedFilters, setAppliedFilters] = useState(initialFilters);
	const [isPending, startTransition] = useTransition();

	const replaceList = (nextFilters: {
		keyword: string;
		status: MarketFilterValue;
		sort: MarketSortValue;
	}) => {
		setAppliedFilters(nextFilters);
		startTransition(async () => {
			const { data, error } = await getMarketList({
				...nextFilters,
				cursor: null,
				limit,
			});

			if (error || !data) {
				setState((prev) => ({ ...prev, error: "상품을 불러올 수 없습니다" }));
				return;
			}

			setState({
				items: data.items,
				nextCursor: data.nextCursor,
				hasMore: data.hasMore,
				error: null,
			});
		});
	};

	const appendList = () => {
		if (!state.nextCursor || isPending) return;

		startTransition(async () => {
			const { data, error } = await getMarketList({
				...appliedFilters,
				cursor: state.nextCursor,
				limit,
			});

			if (error || !data) {
				setState((prev) => ({
					...prev,
					error: "상품을 더 불러오지 못했습니다. 다시 시도해 주세요.",
				}));
				return;
			}

			setState((prev) => ({
				items: mergeItems(prev.items, data.items),
				nextCursor: data.nextCursor,
				hasMore: data.hasMore,
				error: null,
			}));
		});
	};

	const handleKeywordSubmit = (value: string) => {
		const nextKeyword = value.trim();
		setKeywordInput(nextKeyword);
		replaceList({ keyword: nextKeyword, status, sort });
	};

	const handleStatusChange = (value: MarketFilterValue) => {
		setStatus(value);
		replaceList({ keyword: keywordInput.trim(), status: value, sort });
	};

	const handleSortChange = (value: MarketSortValue) => {
		setSort(value);
		replaceList({ keyword: keywordInput.trim(), status, sort: value });
	};

	const hasItems = state.items.length > 0;
	const loadMoreDisabled = isPending || !state.nextCursor;

	if (!hasItems) {
		return (
			<>
				<FilterBar
					keyword={keywordInput}
					status={status}
					sort={sort}
					onKeywordChange={setKeywordInput}
					onKeywordSubmit={handleKeywordSubmit}
					onStatusChange={handleStatusChange}
					onSortChange={handleSortChange}
					disabled={isPending}
				/>
				<EmptyState error={state.error} />
			</>
		);
	}

	return (
		<>
			<FilterBar
				keyword={keywordInput}
				status={status}
				sort={sort}
				onKeywordChange={setKeywordInput}
				onKeywordSubmit={handleKeywordSubmit}
				onStatusChange={handleStatusChange}
				onSortChange={handleSortChange}
				disabled={isPending}
			/>

			<MarketGrid items={state.items} pending={isPending} />

			{state.error && (
				<output aria-live="polite" {...stylex.props(styles.errorText)}>
					{state.error}
				</output>
			)}

			{state.hasMore && (
				<LoadMoreForm
					onLoadMore={appendList}
					pending={isPending}
					disabled={loadMoreDisabled}
				/>
			)}
		</>
	);
}
