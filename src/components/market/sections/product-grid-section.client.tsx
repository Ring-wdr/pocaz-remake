"use client";

import * as stylex from "@stylexjs/stylex";
import { Store } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import { loadMoreMarkets } from "./load-more-action";
import type {
	MarketFilterValue,
	MarketListItem,
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
	status: MarketFilterValue;
	keyword: string;
	sort: MarketSortValue;
	limit: number;
}

export default function ProductGridClient({
	initialState,
	status,
	keyword,
	sort,
	limit,
}: ProductGridClientProps) {
	const [state, formAction, pending] = useActionState<
		MarketListState,
		FormData
	>(loadMoreMarkets, initialState);

	const hasItems = state.items.length > 0;

	if (!hasItems) {
		return (
			<div {...stylex.props(styles.emptyState)}>
				<Store size={48} {...stylex.props(styles.emptyIcon)} />
				<p {...stylex.props(styles.emptyText)}>조건에 맞는 상품이 없습니다</p>
			</div>
		);
	}

	return (
		<>
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
						<input type="hidden" name="keyword" value={keyword} />
						<input type="hidden" name="status" value={status} />
						<input type="hidden" name="sort" value={sort} />
						<input type="hidden" name="limit" value={limit} />
						<input type="hidden" name="cursor" value={state.nextCursor ?? ""} />
						<button
							type="submit"
							disabled={pending || !state.nextCursor}
							{...stylex.props(
								styles.loadMoreButton,
								(pending || !state.nextCursor) && styles.loadMoreDisabled,
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
