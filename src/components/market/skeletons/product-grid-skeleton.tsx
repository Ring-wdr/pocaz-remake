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
	grid: {
		display: "grid",
		gridTemplateColumns: "repeat(2, 1fr)",
		gap: spacing.xs,
	},
	item: {
		display: "flex",
		flexDirection: "column",
	},
	image: {
		aspectRatio: "1",
		borderRadius: radius.sm,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	info: {
		paddingTop: spacing.xxs,
	},
	title: {
		height: `calc(${fontSize.md} * ${lineHeight.normal})`,
		marginBottom: spacing.xxxs,
		borderRadius: radius.xs,
		width: "95%",
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	price: {
		width: "70%",
		height: `calc(${fontSize.base} * ${lineHeight.normal})`,
		borderRadius: radius.xs,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
});

export default function ProductGridSkeleton() {
	return (
		<div {...stylex.props(styles.grid)}>
			{Array.from({ length: 8 }).map((_, index) => (
				<div key={index} {...stylex.props(styles.item)}>
					<div {...stylex.props(styles.image)} />
					<div {...stylex.props(styles.info)}>
						<div {...stylex.props(styles.title)} />
						<div {...stylex.props(styles.price)} />
					</div>
				</div>
			))}
		</div>
	);
}
