import * as stylex from "@stylexjs/stylex";

import {
	colors,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";

const shimmer = stylex.keyframes({
	"0%": { backgroundPosition: "-200% 0" },
	"100%": { backgroundPosition: "200% 0" },
});

const styles = stylex.create({
	marketInfo: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		marginBottom: spacing.sm,
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.sm,
	},
	marketImage: {
		width: "48px",
		height: "48px",
		borderRadius: radius.xs,
		flexShrink: 0,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	marketDetails: {
		flex: 1,
		minWidth: 0,
	},
	marketTitle: {
		height: "20px",
		borderRadius: radius.xs,
		marginBottom: spacing.xxs,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	marketPrice: {
		height: "16px",
		width: "40%",
		borderRadius: radius.xs,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
});

export function MarketInfoSkeleton() {
	return (
		<div {...stylex.props(styles.marketInfo)}>
			<div {...stylex.props(styles.marketImage)} />
			<div {...stylex.props(styles.marketDetails)}>
				<div {...stylex.props(styles.marketTitle)} />
				<div {...stylex.props(styles.marketPrice)} />
			</div>
		</div>
	);
}
