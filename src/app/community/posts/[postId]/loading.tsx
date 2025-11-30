import * as stylex from "@stylexjs/stylex";

import {
	colors,
	fontSize,
	fontWeight,
	radius,
	size,
	spacing,
} from "@/app/global-tokens.stylex";

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: colors.bgPrimary,
		minHeight: "100vh",
	},
	header: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
	},
	placeholder: {
		width: size.touchTarget,
		height: size.touchTarget,
	},
	headerTitle: {
		fontSize: fontSize.lg,
		fontWeight: fontWeight.bold,
		color: colors.textPrimary,
		margin: 0,
	},
	content: {
		flex: 1,
		paddingTop: spacing.md,
		paddingBottom: spacing.lg,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
	},
	skeletonAuthor: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		marginBottom: spacing.md,
	},
	skeletonAvatar: {
		width: size.avatarMd,
		height: size.avatarMd,
		borderRadius: radius.full,
		backgroundColor: colors.bgTertiary,
	},
	skeletonInfo: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xxxs,
	},
	skeletonName: {
		width: 80,
		height: 16,
		borderRadius: radius.sm,
		backgroundColor: colors.bgTertiary,
	},
	skeletonDate: {
		width: 120,
		height: 14,
		borderRadius: radius.sm,
		backgroundColor: colors.bgTertiary,
	},
	skeletonContent: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xs,
		marginBottom: spacing.md,
	},
	skeletonLine: {
		height: 16,
		borderRadius: radius.sm,
		backgroundColor: colors.bgTertiary,
	},
	skeletonLineFull: {
		width: "100%",
	},
	skeletonLineHalf: {
		width: "60%",
	},
});

export default function PostDetailLoading() {
	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<div {...stylex.props(styles.placeholder)} />
				<h1 {...stylex.props(styles.headerTitle)}>게시글</h1>
				<div {...stylex.props(styles.placeholder)} />
			</header>

			<div {...stylex.props(styles.content)}>
				<div {...stylex.props(styles.skeletonAuthor)}>
					<div {...stylex.props(styles.skeletonAvatar)} />
					<div {...stylex.props(styles.skeletonInfo)}>
						<div {...stylex.props(styles.skeletonName)} />
						<div {...stylex.props(styles.skeletonDate)} />
					</div>
				</div>

				<div {...stylex.props(styles.skeletonContent)}>
					<div
						{...stylex.props(styles.skeletonLine, styles.skeletonLineFull)}
					/>
					<div
						{...stylex.props(styles.skeletonLine, styles.skeletonLineFull)}
					/>
					<div
						{...stylex.props(styles.skeletonLine, styles.skeletonLineHalf)}
					/>
				</div>
			</div>
		</div>
	);
}
