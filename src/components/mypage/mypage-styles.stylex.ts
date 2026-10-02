import * as stylex from "@stylexjs/stylex";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";

// Shared by mypage sections and their skeletons so loaded and loading states line up.
export const mypageStyles = stylex.create({
	card: {
		backgroundColor: colors.bgSurface,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		borderRadius: radius.md,
		overflow: "hidden",
	},
	section: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xs,
	},
	sectionHeader: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		paddingLeft: spacing.xxxs,
		paddingRight: spacing.xxxs,
	},
	sectionTitle: {
		margin: 0,
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.textMuted,
	},
	moreLink: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
		textDecoration: "none",
	},
	row: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		textDecoration: "none",
		color: colors.textSecondary,
		borderBottomWidth: {
			default: 1,
			":last-child": 0,
		},
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
	},
	interactive: {
		backgroundColor: {
			default: "transparent",
			":hover": colors.bgTertiary,
		},
		transition: "background-color 0.2s ease",
	},
});
