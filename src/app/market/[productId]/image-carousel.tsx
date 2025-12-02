"use client";

import * as stylex from "@stylexjs/stylex";
import { ChevronLeft, ChevronRight, Store } from "lucide-react";
import { useEffect, useState } from "react";

import { colors, radius, spacing } from "@/app/global-tokens.stylex";

interface MarketImageCarouselProps {
	images: { id: string; imageUrl: string }[];
	title: string;
}

const styles = stylex.create({
	image: {
		width: "100%",
		height: "100%",
		objectFit: "cover",
	},
	placeholder: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
		height: "100%",
		color: colors.textPlaceholder,
	},
	imageNav: {
		position: "absolute",
		top: "50%",
		transform: "translateY(-50%)",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "32px",
		height: "32px",
		backgroundColor: "rgba(0,0,0,0.3)",
		borderWidth: 0,
		borderRadius: "16px",
		color: colors.textInverse,
		cursor: "pointer",
	},
	imageNavLeft: {
		left: spacing.xs,
	},
	imageNavRight: {
		right: spacing.xs,
	},
	imageIndicator: {
		position: "absolute",
		bottom: spacing.xs,
		left: "50%",
		transform: "translateX(-50%)",
		display: "flex",
		gap: spacing.xxxs,
	},
	indicatorDot: {
		width: "6px",
		height: "6px",
		borderRadius: "3px",
		backgroundColor: "rgba(255,255,255,0.5)",
	},
	indicatorDotActive: {
		backgroundColor: colors.textInverse,
	},
	imageWrapper: {
		position: "relative",
		width: "100%",
		height: "100%",
		borderRadius: radius.sm,
		overflow: "hidden",
	},
});

export default function MarketImageCarousel({
	images,
	title,
}: MarketImageCarouselProps) {
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		setCurrentIndex(0);
	}, [images]);

	if (!images || images.length === 0) {
		return (
			<div {...stylex.props(styles.placeholder)}>
				<Store size={48} />
			</div>
		);
	}

	const hasMultipleImages = images.length > 1;
	const handlePrev = () => {
		setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
	};
	const handleNext = () => {
		setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
	};

	return (
		<div {...stylex.props(styles.imageWrapper)}>
			<img
				src={images[currentIndex].imageUrl}
				alt={title}
				{...stylex.props(styles.image)}
			/>

			{hasMultipleImages && (
				<>
					<button
						type="button"
						onClick={handlePrev}
						{...stylex.props(styles.imageNav, styles.imageNavLeft)}
					>
						<ChevronLeft size={20} />
					</button>
					<button
						type="button"
						onClick={handleNext}
						{...stylex.props(styles.imageNav, styles.imageNavRight)}
					>
						<ChevronRight size={20} />
					</button>
					<div {...stylex.props(styles.imageIndicator)}>
						{images.map((image, index) => (
							<span
								key={image.id}
								{...stylex.props(
									styles.indicatorDot,
									index === currentIndex && styles.indicatorDotActive,
								)}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
}
