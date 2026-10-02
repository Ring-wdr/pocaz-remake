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
		borderTopWidth: 1,
		borderTopStyle: "solid",
		borderTopColor: colors.borderPrimary,
	},
	item: {
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
	},
	divider: {
		borderLeftWidth: 1,
		borderLeftStyle: "solid",
		borderLeftColor: colors.borderPrimary,
	},
	number: {
		width: "52%",
		height: `calc(${fontSize.xl} * ${lineHeight.snug})`,
		marginTop: 0,
		marginLeft: "auto",
		marginRight: "auto",
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
		marginLeft: "auto",
		marginRight: "auto",
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
				<div
					key={index}
					{...stylex.props(styles.item, index > 0 && styles.divider)}
				>
					<div {...stylex.props(styles.number)} />
					<div {...stylex.props(styles.label)} />
				</div>
			))}
		</div>
	);
}
