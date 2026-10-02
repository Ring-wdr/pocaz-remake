"use client";

import * as stylex from "@stylexjs/stylex";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { fontSize, fontWeight, spacing } from "@/app/global-tokens.stylex";

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
	viewport: {
		height: "288px",
		overflow: "hidden",
	},
	container: {
		display: "flex",
		height: "100%",
	},
	slide: {
		position: "relative",
		flexGrow: 0,
		flexShrink: 0,
		flexBasis: "100%",
		minWidth: 0,
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
	pagination: {
		position: "absolute",
		bottom: "8px",
		left: 0,
		zIndex: 1,
		width: "100%",
		textAlign: "center",
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
	// 마지막 슬라이드에서는 처음으로 돌아가고, 사용자가 넘긴 뒤에도 자동 재생을 이어 간다
	const [emblaRef, emblaApi] = useEmblaCarousel({}, [
		Autoplay({ delay: 6000, stopOnInteraction: false }),
	]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [canScrollPrev, setCanScrollPrev] = useState(false);
	const [canScrollNext, setCanScrollNext] = useState(slides.length > 1);

	useEffect(() => {
		if (!emblaApi) return;
		const onSelect = () => {
			setSelectedIndex(emblaApi.selectedScrollSnap());
			setCanScrollPrev(emblaApi.canScrollPrev());
			setCanScrollNext(emblaApi.canScrollNext());
		};
		onSelect();
		emblaApi.on("select", onSelect).on("reInit", onSelect);
		return () => {
			emblaApi.off("select", onSelect).off("reInit", onSelect);
		};
	}, [emblaApi]);

	const scrollBy = (direction: "prev" | "next") => {
		if (!emblaApi) return;
		if (direction === "prev") emblaApi.scrollPrev();
		else emblaApi.scrollNext();
		// 버튼으로 넘긴 직후 바로 다음 슬라이드로 넘어가지 않도록 타이머를 다시 잰다
		emblaApi.plugins().autoplay?.reset();
	};

	return (
		<section
			{...stylex.props(styles.mainSlide)}
			aria-roledescription="carousel"
			aria-label="메인 배너"
		>
			<div ref={emblaRef} {...stylex.props(styles.viewport)}>
				<div {...stylex.props(styles.container)}>
					{slides.map((slide, index) => (
						<div key={slide.id} {...stylex.props(styles.slide)}>
							<img
								{...stylex.props(styles.slideImage)}
								src={slide.image}
								alt={slide.alt}
							/>
							<div
								{...stylex.props(
									styles.slideTxt,
									index === selectedIndex && styles.slideTxtActive,
								)}
							>
								<h3 {...stylex.props(styles.slideTxtH3)}>{slide.title}</h3>
								<h4 {...stylex.props(styles.slideTxtH4)}>{slide.subtitle}</h4>
							</div>
						</div>
					))}
				</div>
			</div>
			<button
				type="button"
				aria-label="이전 슬라이드"
				disabled={!canScrollPrev}
				onClick={() => scrollBy("prev")}
				{...stylex.props(styles.navigationButton, styles.navButtonPrev)}
			>
				<span {...stylex.props(styles.navIcon)}>
					<ChevronLeft size={48} />
				</span>
			</button>
			<button
				type="button"
				aria-label="다음 슬라이드"
				disabled={!canScrollNext}
				onClick={() => scrollBy("next")}
				{...stylex.props(styles.navigationButton, styles.navButtonNext)}
			>
				<span {...stylex.props(styles.navIcon)}>
					<ChevronRight size={48} />
				</span>
			</button>
			<div {...stylex.props(styles.pagination)}>
				{selectedIndex + 1} / {slides.length}
			</div>
		</section>
	);
}
