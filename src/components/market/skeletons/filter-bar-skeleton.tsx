import * as stylex from "@stylexjs/stylex";
import {
	colors,
	fontSize,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import FilterTabsSkeleton from "./filter-tabs-skeleton";

const shimmer = stylex.keyframes({
	"0%": { backgroundPosition: "-200% 0" },
	"100%": { backgroundPosition: "200% 0" },
});

const styles = stylex.create({
	container: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xxs,
		marginBottom: spacing.sm,
	},
	search: {
		height: "44px",
		borderRadius: radius.sm,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	sortRow: {
		display: "flex",
		justifyContent: "flex-end",
	},
	sort: {
		width: "120px",
		height: `calc(${fontSize.sm} * 1.2 + ${spacing.xxxs} * 2)`,
		borderRadius: radius.sm,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
});

export default function FilterBarSkeleton() {
	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.search)} />
			<FilterTabsSkeleton />
			<div {...stylex.props(styles.sortRow)}>
				<div {...stylex.props(styles.sort)} />
			</div>
		</div>
	);
}
