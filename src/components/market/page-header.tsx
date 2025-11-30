import * as stylex from "@stylexjs/stylex";
import Link from "next/link";

import { colors, fontSize, fontWeight, iconSize, radius, spacing } from "@/app/global-tokens.stylex";

const styles = stylex.create({
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: spacing.sm,
	},
	title: {
		fontSize: fontSize.xl,
		fontWeight: fontWeight.extrabold,
		color: colors.textPrimary,
		margin: 0,
	},
	registerButton: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxxs,
		paddingTop: spacing.xxs,
		paddingBottom: spacing.xxs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.textInverse,
		backgroundColor: colors.bgInverse,
		borderRadius: radius.sm,
		textDecoration: "none",
		transition: "background-color 0.2s ease",
	},
	registerIcon: {
		fontSize: iconSize.sm,
	},
});

export default function PageHeader() {
	return (
		<div {...stylex.props(styles.header)}>
			<h1 {...stylex.props(styles.title)}>마켓</h1>
			<Link href="/market/register" {...stylex.props(styles.registerButton)}>
				<i className="ri-add-line" {...stylex.props(styles.registerIcon)} />
				등록하기
			</Link>
		</div>
	);
}
