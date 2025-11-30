import * as stylex from "@stylexjs/stylex";
import { Pencil } from "lucide-react";
import Link from "next/link";

import { colors, fontSize, fontWeight, radius, spacing } from "@/app/global-tokens.stylex";

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
	writeButton: {
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
	writeIcon: {
		flexShrink: 0,
	},
});

export default function PageHeader() {
	return (
		<div {...stylex.props(styles.header)}>
			<h1 {...stylex.props(styles.title)}>커뮤니티</h1>
			<Link href="/community/write" {...stylex.props(styles.writeButton)}>
				<Pencil size={16} {...stylex.props(styles.writeIcon)} />
				글쓰기
			</Link>
		</div>
	);
}
