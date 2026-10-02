import * as stylex from "@stylexjs/stylex";
import {
	colors,
	fontSize,
	lineHeight,
	radius,
	size,
	spacing,
} from "@/app/global-tokens.stylex";

const shimmer = stylex.keyframes({
	"0%": { backgroundPosition: "-200% 0" },
	"100%": { backgroundPosition: "200% 0" },
});

const styles = stylex.create({
	container: {
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
	},
	avatar: {
		flexShrink: 0,
		width: size.avatarLg,
		height: size.avatarLg,
		borderRadius: radius.full,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	info: {
		flex: 1,
		minWidth: 0,
	},
	name: {
		width: "64%",
		height: `calc(${fontSize.lg} * ${lineHeight.snug})`,
		marginBottom: spacing.xxxs,
		borderRadius: radius.xs,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	email: {
		width: "70%",
		height: `calc(${fontSize.md} * ${lineHeight.normal})`,
		borderRadius: radius.xs,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
});

export default function ProfileSkeleton() {
	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.avatar)} />
			<div {...stylex.props(styles.info)}>
				<div {...stylex.props(styles.name)} />
				<div {...stylex.props(styles.email)} />
			</div>
		</div>
	);
}
