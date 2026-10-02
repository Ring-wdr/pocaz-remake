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
import { formatArtistTag } from "@/components/market/artist-tag";
import { formatMarketTraits } from "@/components/market/market-condition";
import { formatRelativeTime } from "@/utils/date";
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
	// 판매자 이름과 올린 지 얼마나 됐는지를 한 줄에 놓는다. 이름이 길면 이름만 줄이고 시간은 남긴다
	seller: {
		display: "flex",
		alignItems: "baseline",
		columnGap: spacing.xxxs,
		marginBottom: "2px",
		fontSize: fontSize.sm,
		color: colors.textMuted,
	},
	sellerName: {
		minWidth: 0,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	postedAt: {
		flexShrink: 0,
		whiteSpace: "nowrap",
	},
	// "그룹 · 멤버" 태그. 판매자 이름 아래에 흐리게 놓고, 길면 줄여서 한 줄만 쓴다
	artistTag: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
		marginBottom: "2px",
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
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
	// 가격과 상태·협상 문구는 한 줄에 놓고, 좁으면 문구가 아래로 내려간다
	priceRow: {
		display: "flex",
		flexWrap: "wrap",
		alignItems: "baseline",
		columnGap: spacing.xxs,
	},
	price: {
		fontSize: "15px",
		fontWeight: fontWeight.bold,
		color: colors.textPrimary,
	},
	traits: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
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

/**
 * `<time dateTime>`에 넣는 ISO 시각. Eden은 응답의 날짜 문자열을 Date로 바꿔 주므로 문자열과 Date를 모두 받는다
 * (Date를 그대로 속성에 넣으면 서버와 브라우저의 시간대에 따라 다른 글자가 된다). 읽을 수 없는 값이면 undefined.
 */
function toDateTime(value: string | Date): string | undefined {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

type MarketGridItemProps = {
	item: MarketListItem;
};

export default function MarketGridItem({ item }: MarketGridItemProps) {
	const statusKey = (item.status as MarketStatus) ?? "available";
	const traits = formatMarketTraits(item);
	const artistTag = formatArtistTag(item);
	const label = [
		item.title,
		artistTag,
		statusLabels[statusKey],
		formatPrice(item.price),
		traits,
	]
		.filter(Boolean)
		.join(", ");

	return (
		<Link
			href={`/market/${item.id}`}
			aria-label={label}
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
					{...stylex.props(styles.statusBadge, styles[statusStyles[statusKey]])}
				>
					{statusLabels[statusKey]}
				</span>
			</div>
			<div {...stylex.props(styles.info)}>
				<p {...stylex.props(styles.seller)}>
					<span {...stylex.props(styles.sellerName)}>{item.user.nickname}</span>
					<span aria-hidden="true">·</span>
					{/* 서버가 그린 시각과 브라우저가 이어받는 시각이 분 경계에서 어긋날 수 있어 불일치 경고를 끈다 */}
					<time
						dateTime={toDateTime(item.createdAt)}
						suppressHydrationWarning
						{...stylex.props(styles.postedAt)}
					>
						{formatRelativeTime(item.createdAt)}
					</time>
				</p>
				{artistTag && <p {...stylex.props(styles.artistTag)}>{artistTag}</p>}
				<h3 {...stylex.props(styles.title)}>{item.title}</h3>
				<div {...stylex.props(styles.priceRow)}>
					<span {...stylex.props(styles.price)}>{formatPrice(item.price)}</span>
					{traits && <span {...stylex.props(styles.traits)}>{traits}</span>}
				</div>
			</div>
		</Link>
	);
}
