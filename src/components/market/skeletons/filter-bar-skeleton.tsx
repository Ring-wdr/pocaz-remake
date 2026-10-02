import * as stylex from "@stylexjs/stylex";
import {
	colors,
	fontSize,
	lineHeight,
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
	// 협상 가능 토글은 왼쪽, 정렬은 오른쪽
	optionRow: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: spacing.sm,
	},
	toggle: {
		width: "92px",
		height: `calc(${fontSize.sm} * ${lineHeight.normal} + ${spacing.xxxs} * 2)`,
		borderRadius: radius.lg,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
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
			{/* 그룹 칩 줄, 판매 상태 탭, 상품 상태 칩 줄 */}
			<FilterTabsSkeleton />
			<FilterTabsSkeleton />
			<FilterTabsSkeleton />
			<div {...stylex.props(styles.optionRow)}>
				<div {...stylex.props(styles.toggle)} />
				<div {...stylex.props(styles.sort)} />
			</div>
		</div>
	);
}
