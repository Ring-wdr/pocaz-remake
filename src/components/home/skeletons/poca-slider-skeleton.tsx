import * as stylex from "@stylexjs/stylex";

import {
	colors,
	fontSize,
	lineHeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import { layoutStyles } from "../layout-constants.stylex";

const shimmer = stylex.keyframes({
	"0%": { backgroundPosition: "-200% 0" },
	"100%": { backgroundPosition: "200% 0" },
});

const styles = stylex.create({
	container: {
		marginBottom: spacing.md,
	},
	header: {
		marginBottom: spacing.sm,
	},
	titleSkeleton: {
		width: "42%",
		height: `calc(${fontSize.xl} * ${lineHeight.snug})`,
		marginBottom: spacing.xxxs,
		borderRadius: radius.xs,
		backgroundColor: colors.skeletonBase,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	descSkeleton: {
		width: "60%",
		height: `calc(${fontSize.md} * ${lineHeight.normal})`,
		borderRadius: radius.xs,
		backgroundColor: colors.skeletonBase,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	sliderContainer: {
		display: "flex",
		gap: spacing.sm,
		overflow: "hidden",
	},
	card: {
		flexShrink: 0,
		width: "calc((100% - 28px) / 2.4)",
	},
	imageSkeleton: {
		borderRadius: radius.md,
		backgroundColor: colors.skeletonBase,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	infoContainer: {
		marginTop: spacing.xxxs,
	},
	groupSkeleton: {
		width: "38%",
		height: `calc(${fontSize.sm} * ${lineHeight.normal})`,
		marginBottom: spacing.xxxs,
		borderRadius: radius.xs,
		backgroundColor: colors.skeletonBase,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	nameSkeleton: {
		width: "44%",
		height: `calc(${fontSize.md} * ${lineHeight.normal})`,
		marginBottom: spacing.xxxs,
		borderRadius: radius.xs,
		backgroundColor: colors.skeletonBase,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	descLineSkeleton: {
		width: "70%",
		height: `calc(${fontSize.sm} * ${lineHeight.normal})`,
		marginBottom: spacing.xxxs,
		borderRadius: radius.xs,
		backgroundColor: colors.skeletonBase,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	priceSkeleton: {
		width: "64%",
		height: `calc(${fontSize.lg} * ${lineHeight.normal})`,
		borderRadius: radius.xs,
		backgroundColor: colors.skeletonBase,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
});

export default function PocaSliderSkeleton() {
	return (
		<div {...stylex.props(styles.container, layoutStyles.pocaSectionMinHeight)}>
			<div {...stylex.props(styles.header)}>
				<div {...stylex.props(styles.titleSkeleton)} />
				<div {...stylex.props(styles.descSkeleton)} />
			</div>
			<div {...stylex.props(styles.sliderContainer)}>
				{Array.from({ length: 3 }).map((_, index) => (
					<div key={index} {...stylex.props(styles.card)}>
						<div
							{...stylex.props(styles.imageSkeleton, layoutStyles.sliderImageHeight)}
						/>
						<div {...stylex.props(styles.infoContainer)}>
							<div {...stylex.props(styles.groupSkeleton)} />
							<div {...stylex.props(styles.nameSkeleton)} />
							<div {...stylex.props(styles.descLineSkeleton)} />
							<div {...stylex.props(styles.priceSkeleton)} />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
