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
		id: 6,
		groupName: "SEVENTEEN",
		stageName: "민규",
		pocaName: "FML 앨범 포카",
		price: 19000,
		filePath: "https://placehold.co/300x400/dbeafe/3b82f6?text=RECENT",
	},
	{
		id: 7,
		groupName: "Stray Kids",
		stageName: "방찬",
		pocaName: "ROCK-STAR 포카",
		price: 16000,
		filePath: "https://placehold.co/300x400/dbeafe/3b82f6?text=RECENT",
	},
	{
		id: 8,
		groupName: "NCT DREAM",
		stageName: "마크",
		pocaName: "ISTJ 앨범 포카",
		price: 14000,
		filePath: "https://placehold.co/300x400/dbeafe/3b82f6?text=RECENT",
	},
	{
		id: 9,
		groupName: "ENHYPEN",
		stageName: "성훈",
		pocaName: "DARK BLOOD 포카",
		price: 17000,
		filePath: "https://placehold.co/300x400/dbeafe/3b82f6?text=RECENT",
	},
	{
		id: 10,
		groupName: "TXT",
		stageName: "수빈",
		pocaName: "이름의 장 포카",
		price: 13000,
		filePath: "https://placehold.co/300x400/dbeafe/3b82f6?text=RECENT",
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
	won: {},
});

export default function MainRecentPocaItem() {
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
