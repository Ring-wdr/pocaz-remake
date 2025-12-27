import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";

type FixedPageHeaderProps = {
	title: string;
	leading?: ReactNode;
	trailing?: ReactNode;
};

const styles = stylex.create({
	root: {
		position: "sticky",
		top: 0,
		left: 0,
		right: 0,
		width: "100%",
		backgroundColor: colors.bgPrimary,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
		boxShadow: colors.shadowLight,
		zIndex: 501,
	},
	content: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: spacing.sm,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
	},
	leading: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		minHeight: "32px",
	},
	title: {
		margin: 0,
		fontSize: fontSize.xl,
		fontWeight: fontWeight.extrabold,
		color: colors.textPrimary,
	},
	trailing: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
	},
	roundButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "32px",
		height: "32px",
		borderWidth: 0,
		borderRadius: radius.sm,
		backgroundColor: "transparent",
		color: colors.textSecondary,
		cursor: "pointer",
		textDecoration: "none",
	},
});

export function FixedPageHeader({
	title,
	leading,
	trailing,
}: FixedPageHeaderProps) {
	return (
		<header {...stylex.props(styles.root)}>
			<div {...stylex.props(styles.content)}>
				<div {...stylex.props(styles.leading)}>
					{leading}
					<h1 {...stylex.props(styles.title)}>{title}</h1>
				</div>
				{trailing ? (
					<div {...stylex.props(styles.trailing)}>{trailing}</div>
				) : null}
			</div>
		</header>
	);
}

export const fixedHeaderStyles = styles;
