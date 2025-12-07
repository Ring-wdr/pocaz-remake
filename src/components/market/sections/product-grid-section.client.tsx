"use client";

import * as stylex from "@stylexjs/stylex";
import { Store } from "lucide-react";
import Link from "next/link";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";

import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import { useDebounce } from "@/hooks/use-debounce";
import MarketFilters from "../filters";
import { updateMarketList } from "./load-more-action";
import type {
	MarketFilterValue,
	MarketListState,
	MarketSortValue,
} from "./types";

const styles = stylex.create({
	grid: {
		display: "grid",
		gridTemplateColumns: "repeat(2, 1fr)",
		gap: spacing.xs,
	},
	item: {
		display: "flex",
		flexDirection: "column",
		textDecoration: "none",
		color: "inherit",
	},
	imageWrap: {
		position: "relative",
		aspectRatio: "1",
		borderRadius: radius.sm,
		overflow: "hidden",
		backgroundColor: colors.bgTertiary,
	},
	image: {
		width: "100%",
		height: "100%",
		objectFit: "cover",
	},
	imagePlaceholder: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
		height: "100%",
		color: colors.textPlaceholder,
	},
	statusBadge: {
		position: "absolute",
		top: spacing.xxs,
		left: spacing.xxs,
		paddingTop: spacing.xxxs,
		paddingBottom: spacing.xxxs,
		paddingLeft: spacing.xxs,
		paddingRight: spacing.xxs,
		borderRadius: radius.xs,
		fontSize: "11px",
		fontWeight: fontWeight.semibold,
		color: colors.textInverse,
	},
	statusAvailable: {
		backgroundColor: colors.accentPrimary,
	},
	statusReserved: {
		backgroundColor: colors.purple,
	},
	statusSold: {
		backgroundColor: colors.textMuted,
	},
	info: {
		paddingTop: spacing.xxs,
	},
	seller: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
		marginBottom: "2px",
	},
	title: {
		fontSize: fontSize.md,
		fontWeight: fontWeight.medium,
		color: colors.textSecondary,
		margin: 0,
		marginBottom: spacing.xxxs,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	price: {
		fontSize: "15px",
		fontWeight: fontWeight.bold,
		color: colors.textPrimary,
	},
	emptyState: {
		textAlign: "center",
		paddingTop: spacing.xl,
		paddingBottom: spacing.xl,
		color: colors.textPlaceholder,
	},
	emptyIcon: {
		fontSize: "48px",
		marginBottom: spacing.xs,
	},
	emptyText: {
		fontSize: fontSize.md,
		margin: 0,
	},
	loadMoreWrap: {
		marginTop: spacing.md,
		display: "flex",
		justifyContent: "center",
	},
	loadMoreButton: {
		minWidth: "160px",
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.textInverse,
		backgroundColor: colors.bgInverse,
		borderWidth: 0,
		borderRadius: radius.sm,
		cursor: "pointer",
	},
	loadMoreDisabled: {
		opacity: 0.6,
		cursor: "not-allowed",
	},
	errorText: {
		marginTop: spacing.sm,
		textAlign: "center",
		color: colors.statusError,
		fontSize: fontSize.sm,
	},
});

type MarketStatus = "available" | "reserved" | "sold";

const statusLabels: Record<MarketStatus, string> = {
	available: "판매중",
	reserved: "예약중",
	sold: "판매완료",
};

const statusStyles: Record<MarketStatus, keyof typeof styles> = {
	available: "statusAvailable",
	reserved: "statusReserved",
	sold: "statusSold",
};

function formatPrice(price: number | null) {
	return price ? `${price.toLocaleString()}원` : "가격협의";
}

interface ProductGridClientProps {
	initialState: MarketListState;
	initialStatus: MarketFilterValue;
	initialKeyword: string;
	initialSort: MarketSortValue;
	limit: number;
}

export default function ProductGridClient({
	initialState,
	initialStatus,
	initialKeyword,
	initialSort,
	limit,
}: ProductGridClientProps) {
	const [state, formAction, pending] = useActionState<
		MarketListState,
		FormData
	>(updateMarketList, initialState);
	const [status, setStatus] = useState<MarketFilterValue>(initialStatus);
	const [sort, setSort] = useState<MarketSortValue>(initialSort);
	const [keywordInput, setKeywordInput] = useState(initialKeyword);
	const [appliedFilters, setAppliedFilters] = useState({
		keyword: initialKeyword,
		status: initialStatus,
		sort: initialSort,
	});
	const debouncedKeyword = useDebounce(keywordInput.trim());
	const isFirstUpdateRef = useRef(true);
	const filters = (
		<MarketFilters
			keyword={keywordInput}
			status={status}
			sort={sort}
			onKeywordChange={setKeywordInput}
			onStatusChange={setStatus}
			onSortChange={setSort}
			isPending={pending}
		/>
	);

	const submitFilters = useCallback(
		(nextFilters: {
			keyword: string;
			status: MarketFilterValue;
			sort: MarketSortValue;
		}) => {
			setAppliedFilters(nextFilters);
			const formData = new FormData();
			formData.set("mode", "replace");
			formData.set("keyword", nextFilters.keyword);
			formData.set("status", nextFilters.status);
			formData.set("sort", nextFilters.sort);
			formData.set("limit", limit.toString());
			formAction(formData);
		},
		[formAction, limit],
	);

	useEffect(() => {
		if (isFirstUpdateRef.current) {
			isFirstUpdateRef.current = false;
			return;
		}

		submitFilters({ keyword: debouncedKeyword, status, sort });
	}, [debouncedKeyword, sort, status, submitFilters]);

	const hasItems = state.items.length > 0;
	const loadMoreDisabled = pending || !state.nextCursor;

	if (!hasItems) {
		return (
			<>
				{filters}
				<div {...stylex.props(styles.emptyState)}>
					<Store size={48} {...stylex.props(styles.emptyIcon)} />
					<p {...stylex.props(styles.emptyText)}>조건에 맞는 상품이 없습니다</p>
					{state.error && <p {...stylex.props(styles.errorText)}>{state.error}</p>}
				</div>
			</>
		);
	}

	return (
		<>
			{filters}
			<div {...stylex.props(styles.grid)}>
				{state.items.map((item) => {
					const statusKey = (item.status as MarketStatus) ?? "available";
					return (
						<Link
							key={item.id}
							href={`/market/${item.id}`}
							{...stylex.props(styles.item)}
						>
							<div {...stylex.props(styles.imageWrap)}>
								{item.images[0] ? (
									<img
										src={item.images[0].imageUrl}
										alt={item.title}
										{...stylex.props(styles.image)}
									/>
								) : (
									<div {...stylex.props(styles.imagePlaceholder)}>
										<Store size={32} />
									</div>
								)}
								<span
									{...stylex.props(
										styles.statusBadge,
										styles[statusStyles[statusKey]],
									)}
								>
									{statusLabels[statusKey]}
								</span>
							</div>
							<div {...stylex.props(styles.info)}>
								<p {...stylex.props(styles.seller)}>{item.user.nickname}</p>
								<h3 {...stylex.props(styles.title)}>{item.title}</h3>
								<span {...stylex.props(styles.price)}>
									{formatPrice(item.price)}
								</span>
							</div>
						</Link>
					);
				})}
			</div>

			{state.error && <p {...stylex.props(styles.errorText)}>{state.error}</p>}

			{state.hasMore && (
				<div {...stylex.props(styles.loadMoreWrap)}>
					<form action={formAction}>
						<input type="hidden" name="mode" value="append" />
						<input type="hidden" name="keyword" value={appliedFilters.keyword} />
						<input type="hidden" name="status" value={appliedFilters.status} />
					<input type="hidden" name="sort" value={appliedFilters.sort} />
					<input type="hidden" name="limit" value={limit} />
					<input type="hidden" name="cursor" value={state.nextCursor ?? ""} />
					<button
						type="submit"
						disabled={loadMoreDisabled}
						{...stylex.props(
							styles.loadMoreButton,
							loadMoreDisabled && styles.loadMoreDisabled,
						)}
					>
							{pending ? "불러오는 중..." : "더 보기"}
						</button>
					</form>
				</div>
			)}
		</>
	);
}
