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
		marginBottom: spacing.md,
	},
	title: {
		width: "40%",
		height: `calc(${fontSize.base} * ${lineHeight.snug})`,
		marginBottom: spacing.sm,
		borderRadius: radius.xs,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	list: {},
	item: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.bgTertiary,
	},
	thumbnail: {
		width: "48px",
		height: "48px",
		borderRadius: radius.sm,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
		flexShrink: 0,
	},
	content: {
		flex: 1,
	},
	contentTitle: {
		height: `calc(${fontSize.md} * ${lineHeight.normal})`,
		marginBottom: spacing.xxxs,
		borderRadius: radius.xs,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	meta: {
		width: "36%",
		height: `calc(${fontSize.sm} * ${lineHeight.normal})`,
		borderRadius: radius.xs,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
});

export default function ActivitySkeleton() {
	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.title)} />
			<div {...stylex.props(styles.list)}>
				{Array.from({ length: 4 }).map((_, index) => (
					<div key={index} {...stylex.props(styles.item)}>
						<div {...stylex.props(styles.thumbnail)} />
						<div {...stylex.props(styles.content)}>
							<div {...stylex.props(styles.contentTitle)} />
							<div {...stylex.props(styles.meta)} />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
