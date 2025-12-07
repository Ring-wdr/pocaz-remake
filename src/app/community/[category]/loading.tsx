import * as stylex from "@stylexjs/stylex";

import { colors, radius, spacing } from "../../global-tokens.stylex";

const styles = stylex.create({
	content: {
		flex: 1,
		paddingTop: "20px",
		paddingLeft: "14px",
		paddingRight: "14px",
		paddingBottom: "24px",
		display: "flex",
		flexDirection: "column",
		gap: spacing.sm,
	},
	tabSkeletonRow: {
		display: "flex",
		gap: spacing.xxs,
	},
	tabSkeleton: {
		height: "32px",
		minWidth: "76px",
		borderRadius: radius.lg,
		backgroundColor: colors.bgSecondary,
	},
	listSkeleton: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.sm,
	},
	itemSkeleton: {
		display: "flex",
		gap: spacing.xs,
		alignItems: "center",
	},
	thumbnail: {
		width: "72px",
		height: "72px",
		borderRadius: radius.sm,
		backgroundColor: colors.bgSecondary,
	},
	lines: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		gap: spacing.xxs,
	},
	line: {
		height: "12px",
		borderRadius: radius.xs,
		backgroundColor: colors.bgSecondary,
	},
	lineWide: {
		width: "80%",
	},
	lineNarrow: {
		width: "60%",
	},
});

export default function Loading() {
	return (
		<div {...stylex.props(styles.content)}>
			<div {...stylex.props(styles.tabSkeletonRow)}>
				{Array.from({ length: 4 }).map((_, index) => (
					<div key={index} {...stylex.props(styles.tabSkeleton)} />
				))}
			</div>

			<div {...stylex.props(styles.listSkeleton)}>
				{Array.from({ length: 6 }).map((_, index) => (
					<div key={index} {...stylex.props(styles.itemSkeleton)}>
						<div {...stylex.props(styles.thumbnail)} />
						<div {...stylex.props(styles.lines)}>
							<div {...stylex.props(styles.line, styles.lineWide)} />
							<div {...stylex.props(styles.line, styles.lineNarrow)} />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
