import * as stylex from "@stylexjs/stylex";

import { colors, radius, spacing } from "@/app/global-tokens.stylex";

const shimmer = stylex.keyframes({
	"0%": { backgroundPosition: "-200% 0" },
	"100%": { backgroundPosition: "200% 0" },
});

const styles = stylex.create({
	container: {
		marginBottom: spacing.md,
	},
	titleSkeleton: {
		width: "120px",
		height: "28px",
		marginBottom: spacing.sm,
		borderRadius: radius.xs,
		backgroundColor: colors.skeletonBase,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	list: {
		listStyle: "none",
		margin: 0,
		padding: 0,
	},
	listItem: {
		display: "flex",
		justifyContent: "space-between",
		marginBottom: spacing.xxxs,
	},
	titleLine: {
		flex: 1,
		height: "18px",
		marginRight: spacing.sm,
		borderRadius: radius.xs,
		backgroundColor: colors.skeletonBase,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	dateLine: {
		width: "80px",
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
});

export default function RecentPostsSkeleton() {
	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.titleSkeleton)} />
			<ul {...stylex.props(styles.list)}>
				{Array.from({ length: 5 }).map((_, index) => (
					<li key={index} {...stylex.props(styles.listItem)}>
						<div {...stylex.props(styles.titleLine)} />
						<div {...stylex.props(styles.dateLine)} />
					</li>
				))}
			</ul>
		</div>
	);
}
