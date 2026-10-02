"use client";

import * as stylex from "@stylexjs/stylex";
import { useRef, useState, useTransition } from "react";

import { colors, fontSize, spacing } from "@/app/global-tokens.stylex";
import { getMarketList } from "../data/get-market-list";
import type {
	MarketConditionFilterValue,
	MarketFilterValue,
	MarketListFilters,
	MarketListItem,
	MarketListState,
	MarketSortValue,
} from "../types";
import EmptyState from "./empty-state";
import FilterBar from "./filter-bar";
import LoadMoreForm from "./load-more-form";
import MarketGrid from "./market-grid";
import { updateMarketQueryString } from "./update-query-string";

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
	initialFilters: MarketListFilters;
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
	const [condition, setCondition] = useState<MarketConditionFilterValue>(
		initialFilters.condition,
	);
	const [negotiable, setNegotiable] = useState(initialFilters.negotiable);
	const [sort, setSort] = useState<MarketSortValue>(initialFilters.sort);
	const [keywordInput, setKeywordInput] = useState(initialFilters.keyword);
	const [appliedFilters, setAppliedFilters] = useState(initialFilters);
	const [isPending, startTransition] = useTransition();
	// 필터를 빠르게 바꾸면 요청이 겹친다. 마지막에 보낸 요청의 응답만 반영한다.
	const latestRequestRef = useRef(0);

	const replaceList = (nextFilters: MarketListFilters) => {
		setAppliedFilters(nextFilters);
		updateMarketQueryString(nextFilters);
		const requestId = ++latestRequestRef.current;
		startTransition(async () => {
			const { data, error } = await getMarketList({
				...nextFilters,
				cursor: null,
				limit,
			});
			if (requestId !== latestRequestRef.current) return;

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

		const requestId = ++latestRequestRef.current;
		startTransition(async () => {
			const { data, error } = await getMarketList({
				...appliedFilters,
				cursor: state.nextCursor,
				limit,
			});
			// 그사이 필터가 바뀌었으면 이전 조건의 다음 페이지를 붙이지 않는다
			if (requestId !== latestRequestRef.current) return;

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

	// 입력창에 적어 둔 검색어까지 포함한, 지금 화면에 보이는 필터 값
	const currentFilters: MarketListFilters = {
		keyword: keywordInput.trim(),
		status,
		condition,
		negotiable,
		sort,
	};

	const handleKeywordSubmit = (value: string) => {
		const nextKeyword = value.trim();
		setKeywordInput(nextKeyword);
		replaceList({ ...currentFilters, keyword: nextKeyword });
	};

	const handleStatusChange = (value: MarketFilterValue) => {
		setStatus(value);
		replaceList({ ...currentFilters, status: value });
	};

	const handleConditionChange = (value: MarketConditionFilterValue) => {
		setCondition(value);
		replaceList({ ...currentFilters, condition: value });
	};

	const handleNegotiableChange = (value: boolean) => {
		setNegotiable(value);
		replaceList({ ...currentFilters, negotiable: value });
	};

	const handleSortChange = (value: MarketSortValue) => {
		setSort(value);
		replaceList({ ...currentFilters, sort: value });
	};

	const hasItems = state.items.length > 0;
	const loadMoreDisabled = isPending || !state.nextCursor;

	const filterBar = (
		<FilterBar
			keyword={keywordInput}
			status={status}
			condition={condition}
			negotiable={negotiable}
			sort={sort}
			onKeywordChange={setKeywordInput}
			onKeywordSubmit={handleKeywordSubmit}
			onStatusChange={handleStatusChange}
			onConditionChange={handleConditionChange}
			onNegotiableChange={handleNegotiableChange}
			onSortChange={handleSortChange}
			disabled={isPending}
		/>
	);

	if (!hasItems) {
		return (
			<>
				{filterBar}
				<EmptyState error={state.error} />
			</>
		);
	}

	return (
		<>
			{filterBar}

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
