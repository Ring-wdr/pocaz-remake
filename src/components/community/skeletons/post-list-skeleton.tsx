import * as stylex from "@stylexjs/stylex";

import { colors, radius, size, spacing } from "@/app/global-tokens.stylex";

const shimmer = stylex.keyframes({
	"0%": { backgroundPosition: "-200% 0" },
	"100%": { backgroundPosition: "200% 0" },
});

const styles = stylex.create({
	container: {
		marginBottom: spacing.sm,
	},
	item: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
	},
	thumbnail: {
		width: size.avatarLg,
		height: size.avatarLg,
		borderRadius: radius.sm,
		backgroundColor: colors.skeletonBase,
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
		minWidth: 0,
	},
	title: {
		height: "20px",
		marginBottom: spacing.xxs,
		borderRadius: radius.xs,
		backgroundColor: colors.skeletonBase,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	meta: {
		display: "flex",
		gap: spacing.xxs,
	},
	metaItem: {
		width: "60px",
		height: "14px",
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

export default function PostListSkeleton() {
	return (
		<div {...stylex.props(styles.container)}>
			{Array.from({ length: 6 }).map((_, index) => (
				<div key={index} {...stylex.props(styles.item)}>
					<div {...stylex.props(styles.thumbnail)} />
					<div {...stylex.props(styles.content)}>
						<div {...stylex.props(styles.title)} />
						<div {...stylex.props(styles.meta)}>
							<div {...stylex.props(styles.metaItem)} />
							<div {...stylex.props(styles.metaItem)} />
							<div {...stylex.props(styles.metaItem)} />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
