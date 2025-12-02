import * as stylex from "@stylexjs/stylex";
import { colors, radius, spacing } from "@/app/global-tokens.stylex";

const shimmer = stylex.keyframes({
	"0%": { backgroundPosition: "-200% 0" },
	"100%": { backgroundPosition: "200% 0" },
});

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: colors.bgPrimary,
	},
	header: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		padding: spacing.sm,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
	},
	backButton: {
		width: "36px",
		height: "36px",
		borderRadius: "18px",
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	headerTitle: {
		flex: 1,
		height: "24px",
		borderRadius: radius.sm,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	content: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		gap: spacing.sm,
		paddingTop: spacing.md,
		paddingBottom: spacing.md,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
	},
	chipRow: {
		display: "flex",
		flexWrap: "wrap",
		gap: spacing.xs,
	},
	chip: {
		width: "72px",
		height: "28px",
		borderRadius: radius.lg,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	helpLine: {
		width: "60%",
		height: "12px",
		borderRadius: radius.sm,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	list: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xs,
	},
	item: {
		display: "flex",
		alignItems: "flex-start",
		gap: spacing.xs,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
	},
	icon: {
		width: "36px",
		height: "36px",
		borderRadius: "18px",
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	contentCol: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		gap: spacing.xxxs,
	},
	titleLine: {
		width: "75%",
		height: "16px",
		borderRadius: radius.sm,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	subLine: {
		width: "40%",
		height: "12px",
		borderRadius: radius.sm,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
});

export default function Loading() {
	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<div {...stylex.props(styles.backButton)} />
				<div {...stylex.props(styles.headerTitle)} />
			</header>

			<div {...stylex.props(styles.content)}>
				<div {...stylex.props(styles.chipRow)}>
					{Array.from({ length: 5 }).map((_, index) => (
						<div key={index} {...stylex.props(styles.chip)} />
					))}
				</div>
				<div {...stylex.props(styles.helpLine)} />

				<div {...stylex.props(styles.list)}>
					{Array.from({ length: 4 }).map((_, index) => (
						<div key={index} {...stylex.props(styles.item)}>
							<div {...stylex.props(styles.icon)} />
							<div {...stylex.props(styles.contentCol)}>
								<div {...stylex.props(styles.titleLine)} />
								<div {...stylex.props(styles.subLine)} />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
