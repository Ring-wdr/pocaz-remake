import * as stylex from "@stylexjs/stylex";
import { Plus } from "lucide-react";
import Link from "next/link";

import { colors, fontSize, fontWeight, radius, spacing } from "@/app/global-tokens.stylex";
import { FixedPageHeader } from "@/components/ui";

const styles = stylex.create({
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
		flexShrink: 0,
	},
});

export default function PageHeader() {
	return (
		<FixedPageHeader
			title="마켓"
			trailing={
				<Link href="/market/register" {...stylex.props(styles.registerButton)}>
					<Plus size={16} {...stylex.props(styles.registerIcon)} />
					등록하기
				</Link>
			}
		/>
	);
}
