import * as stylex from "@stylexjs/stylex";

import { colors, radius, spacing } from "@/app/global-tokens.stylex";

const shimmer = stylex.keyframes({
	"0%": { backgroundPosition: "-200% 0" },
	"100%": { backgroundPosition: "200% 0" },
});

const styles = stylex.create({
	container: {
		display: "flex",
		gap: spacing.xxs,
		marginBottom: spacing.sm,
		paddingBottom: spacing.xs,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
	},
	tab: {
		width: "80px",
		height: "36px",
		borderRadius: radius.lg,
		backgroundColor: colors.skeletonBase,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
});

export default function CategoryTabsSkeleton() {
	return (
		<div {...stylex.props(styles.container)}>
			{Array.from({ length: 4 }).map((_, index) => (
				<div key={index} {...stylex.props(styles.tab)} />
			))}
		</div>
	);
}
