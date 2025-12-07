import * as stylex from "@stylexjs/stylex";
import {
	colors,
	fontSize,
	lineHeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";

const shimmer = stylex.keyframes({
	"0%": { backgroundPosition: "-200% 0" },
	"100%": { backgroundPosition: "200% 0" },
});

const styles = stylex.create({
	container: {
		display: "flex",
		gap: spacing.xxs,
		marginBottom: spacing.sm,
		overflowX: "auto",
	},
	tab: {
		height: `calc(${fontSize.sm} * ${lineHeight.normal} + ${spacing.xxxs} * 2)`,
		borderRadius: radius.lg,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
		flexShrink: 0,
	},
	tabWidthNarrow: {
		width: "18%",
	},
	tabWidthMedium: {
		width: "22%",
	},
	tabWidthWide: {
		width: "26%",
	},
});

export default function FilterTabsSkeleton() {
	const tabWidths = [
		styles.tabWidthMedium,
		styles.tabWidthWide,
		styles.tabWidthMedium,
		styles.tabWidthNarrow,
	];

	return (
		<div {...stylex.props(styles.container)}>
			{tabWidths.map((widthStyle, index) => (
				<div key={index} {...stylex.props(styles.tab, widthStyle)} />
			))}
		</div>
	);
}
