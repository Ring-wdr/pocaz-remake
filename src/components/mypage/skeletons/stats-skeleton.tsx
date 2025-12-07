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
		display: "grid",
		gridTemplateColumns: "repeat(3, 1fr)",
		gap: spacing.xs,
		marginBottom: spacing.md,
	},
	item: {
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
		textAlign: "center",
	},
	number: {
		width: "52%",
		height: `calc(${fontSize.xl} * ${lineHeight.snug})`,
		margin: "0 auto",
		marginBottom: spacing.xxxs,
		borderRadius: radius.xs,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	label: {
		width: "60%",
		height: `calc(${fontSize.sm} * ${lineHeight.normal})`,
		margin: "0 auto",
		borderRadius: radius.xs,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
});

export default function StatsSkeleton() {
	return (
		<div {...stylex.props(styles.container)}>
			{Array.from({ length: 3 }).map((_, index) => (
				<div key={index} {...stylex.props(styles.item)}>
					<div {...stylex.props(styles.number)} />
					<div {...stylex.props(styles.label)} />
				</div>
			))}
		</div>
	);
}
