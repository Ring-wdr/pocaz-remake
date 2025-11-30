"use client";

import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const MOBILE = "@media (max-width: 767px)" as const;
const TABLET = "@media (max-width: 1023px)" as const;

// Placeholder data - 서버에서 가져와야 하는 이미지는 placeholder로 대체
const placeholderData = [
	{
		id: 1,
		groupName: "LE SSERAFIM",
		stageName: "김채원",
		pocaName: "FEARLESS 앨범 포카",
		price: 15000,
		pocaImg: "https://placehold.co/300x400/e2e8f0/64748b?text=PHOTOCARD",
	},
	{
		id: 2,
		groupName: "NewJeans",
		stageName: "하니",
		pocaName: "OMG 특전 포카",
		price: 25000,
		pocaImg: "https://placehold.co/300x400/e2e8f0/64748b?text=PHOTOCARD",
	},
	{
		id: 3,
		groupName: "IVE",
		stageName: "장원영",
		pocaName: "I AM 앨범 포카",
		price: 18000,
		pocaImg: "https://placehold.co/300x400/e2e8f0/64748b?text=PHOTOCARD",
	},
	{
		id: 4,
		groupName: "aespa",
		stageName: "카리나",
		pocaName: "MY WORLD 포카",
		price: 22000,
		pocaImg: "https://placehold.co/300x400/e2e8f0/64748b?text=PHOTOCARD",
	},
	{
		id: 5,
		groupName: "THE BOYZ",
		stageName: "주연",
		pocaName: "PHANTASY 포카",
		price: 12000,
		pocaImg: "https://placehold.co/300x400/e2e8f0/64748b?text=PHOTOCARD",
	},
];

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
	priceLabel: {
		marginRight: "6px",
		color: "#6b7280",
	},
	won: {},
});

export default function MainPocaItem() {
	return (
		<Swiper slidesPerView={2.4} spaceBetween={14}>
			{placeholderData.map((poca) => (
				<SwiperSlide key={poca.id}>
					<Link
						href={`/market/${poca.id}`}
						{...stylex.props(styles.slideButton)}
					>
						<div {...stylex.props(styles.pocaThumb)}>
							<img
								src={poca.pocaImg}
								{...stylex.props(styles.pocaImage)}
								alt="장터 이미지"
							/>
						</div>
						<div {...stylex.props(styles.pocaListWrap)}>
							<p {...stylex.props(styles.groupName)}>{poca.groupName}</p>
							<p {...stylex.props(styles.memberName)}>{poca.stageName}</p>
							<p {...stylex.props(styles.pocaDesc)}>{poca.pocaName}</p>
							<p {...stylex.props(styles.pocaPrice)}>
								<span {...stylex.props(styles.priceLabel)}>평균 거래가</span>
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
