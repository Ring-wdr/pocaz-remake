"use client";

import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

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
		borderRadius: "12px",
		overflow: "hidden",
	},
	pocaImage: {
		width: "100%",
		height: "100%",
		objectFit: "cover",
	},
	pocaListWrap: {
		marginTop: "4px",
		fontSize: "12px",
		textAlign: "left",
	},
	groupName: {
		fontWeight: 800,
		margin: 0,
	},
	memberName: {
		fontSize: "14px",
		margin: 0,
	},
	pocaDesc: {
		marginBottom: "4px",
		color: "#6b7280",
		margin: 0,
	},
	pocaPrice: {
		fontWeight: 500,
		fontSize: "16px",
		margin: 0,
	},
	won: {},
});

export interface RecentPocaItemData {
	id: number;
	groupName: string;
	stageName: string;
	pocaName: string;
	price: number;
	filePath: string;
}

interface MainRecentPocaItemProps {
	items: RecentPocaItemData[];
}

export default function MainRecentPocaItem({ items }: MainRecentPocaItemProps) {
	return (
		<Swiper slidesPerView={2.4} spaceBetween={14}>
			{items.map((poca) => (
				<SwiperSlide key={poca.id}>
					<Link
						href={`/market/${poca.id}`}
						{...stylex.props(styles.slideButton)}
					>
						<div {...stylex.props(styles.pocaThumb)}>
							<img
								src={poca.filePath}
								{...stylex.props(styles.pocaImage)}
								alt="장터 업로드 이미지"
							/>
						</div>
						<div {...stylex.props(styles.pocaListWrap)}>
							<p {...stylex.props(styles.groupName)}>{poca.groupName}</p>
							<p {...stylex.props(styles.memberName)}>{poca.stageName}</p>
							<p {...stylex.props(styles.pocaDesc)}>{poca.pocaName}</p>
							<p {...stylex.props(styles.pocaPrice)}>
								<span>{poca.price.toLocaleString()}</span>
								<span {...stylex.props(styles.won)}>원</span>
							</p>
						</div>
					</Link>
				</SwiperSlide>
			))}
		</Swiper>
	);
}
