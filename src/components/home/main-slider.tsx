"use client";

import * as stylex from "@stylexjs/stylex";
import { A11y, Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const VisualMotion = stylex.keyframes({
	"0%": {
		opacity: 0,
		transform: "translate3d(8%, 0, 0)",
	},
	"100%": {
		opacity: 1,
		transform: "translateZ(0)",
	},
});

const styles = stylex.create({
	mainSlide: {},
	slide: {
		position: "relative",
		height: "100%",
	},
	slideImage: {
		width: "100%",
		height: "100%",
		objectFit: "cover",
	},
	slideTxt: {
		position: "absolute",
		top: "60%",
		left: 0,
		marginLeft: "14px",
		color: "#fff",
		fontWeight: 700,
		fontSize: "24px",
		letterSpacing: "-0.05em",
		cursor: "default",
		opacity: 0,
	},
	slideTxtActive: {
		opacity: 1,
		animationName: VisualMotion,
		animationDuration: "1s",
		animationTimingFunction: "ease-in-out",
		animationFillMode: "both",
		animationDelay: "0.3s",
	},
	slideTxtH3: {
		margin: 0,
		fontSize: "24px",
		fontWeight: 700,
	},
	slideTxtH4: {
		margin: 0,
		fontSize: "24px",
		fontWeight: 700,
	},
});

const slides = [
	{
		id: 1,
		image: "/main_slide_bn1.png",
		alt: "메인 배너 01",
		title: "포~카즈! 런칭 기념",
		subtitle: "더보이즈 포카 구경하러 가기 🥰",
	},
	{
		id: 2,
		image: "/main_slide_bn2.jpeg",
		alt: "메인 배너 02",
		title: "르세라핌 컴백",
		subtitle: "랜덤 포토카드 5종 출시❗️",
	},
	{
		id: 3,
		image: "/main_slide_bn3.jpeg",
		alt: "메인 배너 03",
		title: "MZ 세대들의 중심",
		subtitle: "뉴진스 본격 분석 💙",
	},
];

export default function MainSlider() {
	return (
		<div {...stylex.props(styles.mainSlide)}>
			<Swiper
				modules={[Navigation, Pagination, A11y, Autoplay]}
				navigation
				pagination={{ clickable: true, type: "fraction" }}
				autoplay={{
					delay: 6000,
					disableOnInteraction: false,
				}}
				className="mainSlideSwiper"
				style={{ height: "288px" }}
			>
				{slides.map((slide) => (
					<SwiperSlide key={slide.id} className="mainSlideItem">
						{({ isActive }) => (
							<div {...stylex.props(styles.slide)}>
								<img
									{...stylex.props(styles.slideImage)}
									src={slide.image}
									alt={slide.alt}
								/>
								<div
									{...stylex.props(
										styles.slideTxt,
										isActive && styles.slideTxtActive,
									)}
								>
									<h3 {...stylex.props(styles.slideTxtH3)}>{slide.title}</h3>
									<h4 {...stylex.props(styles.slideTxtH4)}>{slide.subtitle}</h4>
								</div>
							</div>
						)}
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
}
