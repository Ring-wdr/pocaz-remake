import * as stylex from "@stylexjs/stylex";

import { colors, radius, spacing } from "@/app/global-tokens.stylex";
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
		width: "80px",
		height: "28px",
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
		width: "180px",
		height: "18px",
		borderRadius: radius.xs,
		backgroundColor: colors.skeletonBase,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	grid: {
		display: "grid",
		gridTemplateColumns: "repeat(3, 1fr)",
		gridTemplateRows: "repeat(3, 1fr)",
		margin: 0,
		padding: 0,
	},
	gridItem: {
		height: "144px",
		backgroundColor: colors.skeletonBase,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
});

export default function BoastGallerySkeleton() {
	return (
		<div {...stylex.props(styles.container, layoutStyles.boastGridMinHeight)}>
			<div {...stylex.props(styles.header)}>
				<div {...stylex.props(styles.titleSkeleton)} />
				<div {...stylex.props(styles.descSkeleton)} />
			</div>
			<div {...stylex.props(styles.grid)}>
				{Array.from({ length: 9 }).map((_, index) => (
					<div key={index} {...stylex.props(styles.gridItem)} />
				))}
			</div>
		</div>
	);
}
