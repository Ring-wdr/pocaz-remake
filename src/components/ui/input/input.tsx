"use client";

import * as stylex from "@stylexjs/stylex";
import { type ComponentProps, type ReactNode, useId } from "react";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";

const styles = stylex.create({
	wrapper: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xxs,
	},
	label: {
		fontSize: fontSize.sm,
		fontWeight: fontWeight.medium,
		color: colors.textSecondary,
	},
	required: {
		color: colors.statusError,
	},
	inputWrapper: {
		position: "relative",
		display: "flex",
		alignItems: "center",
	},
	input: {
		width: "100%",
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		fontSize: fontSize.md,
		color: colors.textPrimary,
		backgroundColor: colors.bgPrimary,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		borderRadius: radius.sm,
		transition: "border-color 0.15s ease, box-shadow 0.15s ease",
		"::placeholder": {
			color: colors.textPlaceholder,
		},
		":focus": {
			outlineWidth: 0,
			borderColor: colors.accentPrimary,
			boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
		},
		":disabled": {
			opacity: 0.5,
			cursor: "not-allowed",
			backgroundColor: colors.bgTertiary,
		},
	},
	inputError: {
		borderColor: colors.statusError,
		":focus": {
			borderColor: colors.statusError,
			boxShadow: "0 0 0 3px rgba(220, 38, 38, 0.1)",
		},
	},
	inputWithLeftIcon: {
		paddingLeft: spacing.xl,
	},
	inputWithRightIcon: {
		paddingRight: spacing.xl,
	},
	leftIcon: {
		position: "absolute",
		left: spacing.sm,
		display: "flex",
		alignItems: "center",
		color: colors.textPlaceholder,
		pointerEvents: "none",
	},
	rightIcon: {
		position: "absolute",
		right: spacing.sm,
		display: "flex",
		alignItems: "center",
		color: colors.textPlaceholder,
	},
	errorMessage: {
		fontSize: fontSize.xs,
		color: colors.statusError,
	},
	helperText: {
		fontSize: fontSize.xs,
		color: colors.textMuted,
	},
	// Sizes
	sm: {
		paddingTop: spacing.xxxs,
		paddingBottom: spacing.xxxs,
		fontSize: fontSize.sm,
	},
	md: {
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		fontSize: fontSize.md,
	},
	lg: {
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		fontSize: fontSize.base,
	},
});

export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends Omit<ComponentProps<"input">, "size"> {
	label?: string;
	error?: string;
	helperText?: string;
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
	size?: InputSize;
}

export function Input({
	label,
	error,
	helperText,
	leftIcon,
	rightIcon,
	size = "md",
	required,
	id,
	...props
}: InputProps) {
	const reactId = useId();
	const inputId = id || `input-${reactId}`;
	const errorId = error ? `${inputId}-error` : undefined;
	const helperId = helperText ? `${inputId}-helper` : undefined;

	return (
		<div {...stylex.props(styles.wrapper)}>
			{label && (
				<label htmlFor={inputId} {...stylex.props(styles.label)}>
					{label}
					{required && (
						<span {...stylex.props(styles.required)} aria-hidden="true">
							{" "}
							*
						</span>
					)}
				</label>
			)}

			<div {...stylex.props(styles.inputWrapper)}>
				{leftIcon && <span {...stylex.props(styles.leftIcon)}>{leftIcon}</span>}

				<input
					id={inputId}
					aria-required={required}
					aria-invalid={!!error}
					aria-describedby={
						[errorId, helperId].filter(Boolean).join(" ") || undefined
					}
					{...stylex.props(
						styles.input,
						styles[size],
						Boolean(error) && styles.inputError,
						Boolean(leftIcon) && styles.inputWithLeftIcon,
						Boolean(rightIcon) && styles.inputWithRightIcon,
					)}
					{...props}
				/>

				{rightIcon && (
					<span {...stylex.props(styles.rightIcon)}>{rightIcon}</span>
				)}
			</div>

			{error && (
				<span id={errorId} {...stylex.props(styles.errorMessage)} role="alert">
					{error}
				</span>
			)}

			{!error && helperText && (
				<span id={helperId} {...stylex.props(styles.helperText)}>
					{helperText}
				</span>
			)}
		</div>
	);
}
