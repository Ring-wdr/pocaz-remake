"use client";

import * as stylex from "@stylexjs/stylex";
import { Store } from "lucide-react";
import Link from "next/link";

import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import type { MarketListItem } from "../types";

const styles = stylex.create({
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

type MarketGridItemProps = {
	item: MarketListItem;
};

export default function MarketGridItem({ item }: MarketGridItemProps) {
	const statusKey = (item.status as MarketStatus) ?? "available";

	return (
		<Link
			href={`/market/${item.id}`}
			aria-label={`${item.title}, ${statusLabels[statusKey]}, ${formatPrice(item.price)}`}
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
				<span {...stylex.props(styles.price)}>{formatPrice(item.price)}</span>
			</div>
		</Link>
	);
}
