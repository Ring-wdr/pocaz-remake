import * as stylex from "@stylexjs/stylex";
import type { HTMLAttributes } from "react";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import { capitalize } from "@/utils/string";

const styles = stylex.create({
	base: {
		display: "inline-flex",
		alignItems: "center",
		gap: spacing.xxxs,
		paddingTop: spacing.xxxs,
		paddingBottom: spacing.xxxs,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		fontSize: fontSize.sm,
		fontWeight: fontWeight.medium,
		borderRadius: radius.sm,
		whiteSpace: "nowrap",
	},
	// Variants
	default: {
		color: colors.textSecondary,
		backgroundColor: colors.bgTertiary,
	},
	primary: {
		color: colors.accentPrimary,
		backgroundColor: colors.accentPrimaryBg,
	},
	success: {
		color: colors.statusSuccess,
		backgroundColor: colors.statusSuccessBg,
	},
	warning: {
		color: colors.statusWarning,
		backgroundColor: colors.statusWarningBg,
	},
	error: {
		color: colors.statusError,
		backgroundColor: colors.statusErrorBg,
	},
	info: {
		color: colors.statusInfo,
		backgroundColor: colors.statusInfoBg,
	},
	// Sizes
	sm: {
		paddingTop: "2px",
		paddingBottom: "2px",
		paddingLeft: spacing.xxs,
		paddingRight: spacing.xxs,
		fontSize: fontSize.xs,
	},
	md: {
		paddingTop: spacing.xxxs,
		paddingBottom: spacing.xxxs,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		fontSize: fontSize.sm,
	},
	lg: {
		paddingTop: spacing.xxs,
		paddingBottom: spacing.xxs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		fontSize: fontSize.md,
	},
	// Outline variant modifier
	outline: {
		backgroundColor: "transparent",
		borderWidth: 1,
		borderStyle: "solid",
	},
	outlineDefault: {
		borderColor: colors.borderPrimary,
	},
	outlinePrimary: {
		borderColor: colors.accentPrimary,
	},
	outlineSuccess: {
		borderColor: colors.statusSuccess,
	},
	outlineWarning: {
		borderColor: colors.statusWarning,
	},
	outlineError: {
		borderColor: colors.statusError,
	},
	outlineInfo: {
		borderColor: colors.statusInfo,
	},
	// Dot indicator
	dot: {
		width: "6px",
		height: "6px",
		borderRadius: radius.full,
	},
	dotDefault: {
		backgroundColor: colors.textMuted,
	},
	dotPrimary: {
		backgroundColor: colors.accentPrimary,
	},
	dotSuccess: {
		backgroundColor: colors.statusSuccess,
	},
	dotWarning: {
		backgroundColor: colors.statusWarning,
	},
	dotError: {
		backgroundColor: colors.statusError,
	},
	dotInfo: {
		backgroundColor: colors.statusInfo,
	},
});

export type BadgeVariant =
	| "default"
	| "primary"
	| "success"
	| "warning"
	| "error"
	| "info";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	variant?: BadgeVariant;
	size?: BadgeSize;
	outline?: boolean;
	dot?: boolean;
}

const convertVariantToStyleKey = <T extends string>(
	prefix: T,
	variant: BadgeVariant,
): `${T}${Capitalize<BadgeVariant>}` => `${prefix}${capitalize(variant)}`;

export function Badge({
	variant = "default",
	size = "md",
	outline = false,
	dot = false,
	children,
	...props
}: BadgeProps) {
	const outlineStyleKey = convertVariantToStyleKey("outline", variant);
	const dotStyleKey = convertVariantToStyleKey("dot", variant);

	return (
		<span
			{...stylex.props(
				styles.base,
				styles[variant],
				styles[size],
				outline && styles.outline,
				outline && styles[outlineStyleKey],
			)}
			{...props}
		>
			{dot && <span {...stylex.props(styles.dot, styles[dotStyleKey])} />}
			{children}
		</span>
	);
}
