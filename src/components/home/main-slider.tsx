"use client";

import * as stylex from "@stylexjs/stylex";
import { A11y, Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";
import {
	colors,
	fontSize,
	fontWeight,
	spacing,
} from "@/app/global-tokens.stylex";

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
	mainSlide: {
		position: "relative",
	},
	swiper: {
		height: "288px",
		"--swiper-pagination-color": colors.textInverse,
	},
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
		marginLeft: spacing.xs,
		color: "#fff",
		fontWeight: fontWeight.bold,
		fontSize: fontSize.xl,
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
		fontSize: fontSize.xl,
		fontWeight: fontWeight.bold,
	},
	slideTxtH4: {
		margin: 0,
		fontSize: fontSize.xl,
		fontWeight: fontWeight.bold,
	},
	navigationButton: {
		position: "absolute",
		top: "50%",
		transform: "translateY(-50%)",
		zIndex: 1,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: "#fff",
		borderWidth: 0,
		borderStyle: "none",
		paddingTop: "12px",
		paddingRight: "12px",
		paddingBottom: "12px",
		paddingLeft: "12px",
		cursor: {
			":disabled": "not-allowed",
			":not(:disabled)": "pointer",
		},
		opacity: {
			":disabled": 0.5,
		},
	},
	navButtonPrev: {
		left: 0,
	},
	navButtonNext: {
		right: 0,
	},
	navIcon: {
		lineHeight: 1,
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
const prevClassName = "mainSlidePrev";
const nextClassName = "mainSlideNext";

const swiperProps: ComponentProps<typeof Swiper> = {
	modules: [Navigation, Pagination, A11y, Autoplay],
	navigation: {
		prevEl: `.${prevClassName}`,
		nextEl: `.${nextClassName}`,
	},
	pagination: { clickable: true, type: "fraction" },
	autoplay: {
		delay: 6000,
		disableOnInteraction: false,
	},
};

export default function MainSlider() {
	const { className: prevStyleClassName, ...prevButtonStyleProps } =
		stylex.props(styles.navigationButton, styles.navButtonPrev);
	const { className: nextStyleClassName, ...nextButtonStyleProps } =
		stylex.props(styles.navigationButton, styles.navButtonNext);

	return (
		<div {...stylex.props(styles.mainSlide)}>
			<Swiper {...swiperProps} {...stylex.props(styles.swiper)}>
				{slides.map((slide) => (
					<SwiperSlide key={slide.id}>
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
			<button
				type="button"
				className={`${prevClassName} ${prevStyleClassName}`.trim()}
				aria-label="이전 슬라이드"
				{...prevButtonStyleProps}
			>
				<span {...stylex.props(styles.navIcon)}>
					<ChevronLeft size={48} />
				</span>
			</button>
			<button
				type="button"
				className={`${nextClassName} ${nextStyleClassName}`.trim()}
				aria-label="다음 슬라이드"
				{...nextButtonStyleProps}
			>
				<span {...stylex.props(styles.navIcon)}>
					<ChevronRight size={48} />
				</span>
			</button>
		</div>
	);
}
