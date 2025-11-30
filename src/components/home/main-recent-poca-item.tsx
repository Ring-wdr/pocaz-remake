"use client";

import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import { colors, fontSize, fontWeight, radius, spacing } from "@/app/global-tokens.stylex";
import type { MarketItem } from "@/types/entities";

const MOBILE = "@media (max-width: 767px)" as const;
const TABLET = "@media (max-width: 1023px)" as const;

const styles = stylex.create({
	slideButton: {
		cursor: "pointer",
		width: "100%",
		backgroundColor: "transparent",
		borderWidth: 0,
		padding: 0,
		textAlign: "left",
	},
	pocaThumb: {
		position: "relative",
		height: {
			default: "288px",
			[TABLET]: "384px",
			[MOBILE]: "240px",
		},
		borderRadius: radius.md,
		overflow: "hidden",
	},
	pocaImage: {
		width: "100%",
		height: "100%",
		objectFit: "cover",
	},
	placeholderImage: {
		width: "100%",
		height: "100%",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.bgSecondary,
		color: colors.textMuted,
		fontSize: fontSize.sm,
	},
	pocaListWrap: {
		marginTop: spacing.xxxs,
		fontSize: fontSize.sm,
		textAlign: "left",
	},
	sellerName: {
		fontWeight: fontWeight.extrabold,
		margin: 0,
	},
	pocaTitle: {
		fontSize: fontSize.md,
		margin: 0,
		whiteSpace: "nowrap",
		textOverflow: "ellipsis",
		overflow: "hidden",
	},
	pocaDesc: {
		marginBottom: spacing.xxxs,
		color: colors.textMuted,
		margin: 0,
	},
	pocaPrice: {
		fontWeight: fontWeight.medium,
		fontSize: fontSize.base,
		margin: 0,
	},
	won: {},
});

interface MainRecentPocaItemProps {
	items: MarketItem[];
}

export default function MainRecentPocaItem({ items }: MainRecentPocaItemProps) {
	return (
		<Swiper slidesPerView={2.4} spaceBetween={14}>
			{items.map((market) => {
				const thumbnail = market.images[0]?.imageUrl;
				return (
					<SwiperSlide key={market.id}>
						<Link
							href={`/market/${market.id}`}
							{...stylex.props(styles.slideButton)}
						>
							<div {...stylex.props(styles.pocaThumb)}>
								{thumbnail ? (
									<img
										src={thumbnail}
										{...stylex.props(styles.pocaImage)}
										alt={market.title}
									/>
								) : (
									<div {...stylex.props(styles.placeholderImage)}>
										이미지 없음
									</div>
								)}
							</div>
							<div {...stylex.props(styles.pocaListWrap)}>
								<p {...stylex.props(styles.sellerName)}>{market.user.nickname}</p>
								<p {...stylex.props(styles.pocaTitle)}>{market.title}</p>
								{market.description && (
									<p {...stylex.props(styles.pocaDesc)}>
										{market.description.length > 20
											? `${market.description.slice(0, 20)}...`
											: market.description}
									</p>
								)}
								<p {...stylex.props(styles.pocaPrice)}>
									<span>{market.price?.toLocaleString() ?? "-"}</span>
									<span {...stylex.props(styles.won)}>원</span>
								</p>
							</div>
						</Link>
					</SwiperSlide>
				);
			})}
		</Swiper>
	);
}
