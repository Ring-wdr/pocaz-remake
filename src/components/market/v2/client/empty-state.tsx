"use client";

import * as stylex from "@stylexjs/stylex";
import { Store } from "lucide-react";

import { colors, fontSize, spacing } from "@/app/global-tokens.stylex";

const styles = stylex.create({
	container: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		textAlign: "center",
		paddingTop: spacing.xl,
		paddingBottom: spacing.xl,
		color: colors.textPlaceholder,
	},
	icon: {
		fontSize: "48px",
		marginBottom: spacing.xs,
	},
	text: {
		fontSize: fontSize.md,
		margin: 0,
	},
	error: {
		marginTop: spacing.sm,
		textAlign: "center",
		color: colors.statusError,
		fontSize: fontSize.sm,
	},
});

type EmptyStateProps = {
	error?: string | null;
};

export default function EmptyState({ error }: EmptyStateProps) {
	return (
		<output aria-live="polite" {...stylex.props(styles.container)}>
			<Store size={48} {...stylex.props(styles.icon)} />
			<p {...stylex.props(styles.text)}>조건에 맞는 상품이 없습니다</p>
			{error && <p {...stylex.props(styles.error)}>{error}</p>}
		</output>
	);
}
