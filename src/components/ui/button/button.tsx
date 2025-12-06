"use client";

import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";

const styles = stylex.create({
	base: {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.xxs,
		fontWeight: fontWeight.medium,
		borderRadius: radius.sm,
		borderWidth: 0,
		cursor: "pointer",
		transition: "background-color 0.15s ease, transform 0.1s ease",
		":focus-visible": {
			outlineWidth: 0,
			boxShadow: `0 0 0 2px ${colors.bgPrimary}, 0 0 0 4px ${colors.accentPrimary}`,
		},
		":active": {
			transform: "scale(0.98)",
		},
		":disabled": {
			opacity: 0.5,
			cursor: "not-allowed",
			transform: "none",
		},
	},
	// Variants
	primary: {
		backgroundColor: colors.accentPrimary,
		color: "#ffffff",
		":hover": {
			backgroundColor: "#1d4ed8",
		},
	},
	secondary: {
		backgroundColor: colors.bgTertiary,
		color: colors.textSecondary,
		":hover": {
			backgroundColor: colors.borderPrimary,
		},
	},
	ghost: {
		backgroundColor: "transparent",
		color: colors.textSecondary,
		":hover": {
			backgroundColor: colors.bgTertiary,
		},
	},
	danger: {
		backgroundColor: colors.statusError,
		color: "#ffffff",
		":hover": {
			backgroundColor: "#b91c1c",
		},
	},
	outline: {
		backgroundColor: "transparent",
		color: colors.textPrimary,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		":hover": {
			backgroundColor: colors.bgTertiary,
		},
	},
	// Sizes
	sm: {
		paddingTop: spacing.xxxs,
		paddingBottom: spacing.xxxs,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		fontSize: fontSize.sm,
	},
	md: {
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.md,
		paddingRight: spacing.md,
		fontSize: fontSize.md,
	},
	lg: {
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.lg,
		paddingRight: spacing.lg,
		fontSize: fontSize.base,
	},
	// Full width
	fullWidth: {
		width: "100%",
	},
	// Icon only
	iconOnly: {
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
	},
});

export type ButtonVariant =
	| "primary"
	| "secondary"
	| "ghost"
	| "danger"
	| "outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ComponentProps<"button"> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	fullWidth?: boolean;
	iconOnly?: boolean;
}

export function Button({
	variant = "primary",
	size = "md",
	fullWidth = false,
	iconOnly = false,
	children,
	...props
}: ButtonProps) {
	return (
		<button
			{...stylex.props(
				styles.base,
				styles[variant],
				styles[size],
				fullWidth && styles.fullWidth,
				iconOnly && styles.iconOnly,
			)}
			{...props}
		>
			{children}
		</button>
	);
}
