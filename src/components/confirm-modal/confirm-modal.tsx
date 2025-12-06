"use client";

import * as stylex from "@stylexjs/stylex";
import { X } from "lucide-react";
import { type FormEvent, useId, useRef, useState } from "react";
import {
	colors,
	fontSize,
	fontWeight,
	lineHeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import { useBodyScrollLock, useFocusManagement } from "@/hooks";

const REDUCED_MOTION = "@media (prefers-reduced-motion: reduce)" as const;

const fadeIn = stylex.keyframes({
	"0%": { opacity: 0 },
	"100%": { opacity: 1 },
});

const slideUp = stylex.keyframes({
	"0%": { opacity: 0, transform: "translateY(16px) scale(0.96)" },
	"100%": { opacity: 1, transform: "translateY(0) scale(1)" },
});

const styles = stylex.create({
	overlay: {
		position: "fixed",
		inset: 0,
		zIndex: 9999,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		animationName: {
			default: fadeIn,
			[REDUCED_MOTION]: "none",
		},
		animationDuration: {
			default: "200ms",
			[REDUCED_MOTION]: "0ms",
		},
		animationTimingFunction: "ease-out",
		animationFillMode: "forwards",
	},
	dialog: {
		position: "relative",
		width: "100%",
		maxWidth: "400px",
		maxHeight: "85vh",
		marginLeft: spacing.md,
		marginRight: spacing.md,
		display: "flex",
		flexDirection: "column",
		backgroundColor: colors.bgPrimary,
		borderRadius: radius.md,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
		animationName: {
			default: slideUp,
			[REDUCED_MOTION]: "none",
		},
		animationDuration: {
			default: "250ms",
			[REDUCED_MOTION]: "0ms",
		},
		animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
		animationFillMode: "forwards",
	},
	header: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		paddingTop: spacing.md,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.md,
		paddingRight: spacing.md,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
	},
	title: {
		margin: 0,
		fontSize: fontSize.lg,
		fontWeight: fontWeight.semibold,
		color: colors.textPrimary,
		lineHeight: lineHeight.snug,
	},
	closeButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "32px",
		height: "32px",
		padding: 0,
		backgroundColor: "transparent",
		borderWidth: 0,
		borderRadius: radius.xs,
		color: colors.textMuted,
		cursor: "pointer",
		transition: "background-color 0.15s ease, color 0.15s ease",
		":hover": {
			backgroundColor: colors.bgTertiary,
			color: colors.textPrimary,
		},
		":focus-visible": {
			outlineWidth: 2,
			outlineStyle: "solid",
			outlineColor: colors.accentPrimary,
			outlineOffset: "2px",
		},
	},
	content: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.sm,
		flex: 1,
		overflowY: "auto",
		paddingTop: spacing.md,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.md,
		paddingRight: spacing.md,
	},
	description: {
		margin: 0,
		fontSize: fontSize.md,
		color: colors.textTertiary,
		lineHeight: lineHeight.normal,
	},
	form: {
		display: "flex",
		flexDirection: "column",
		flex: 1,
		minHeight: 0,
	},
	fieldGroup: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xxs,
	},
	label: {
		fontSize: fontSize.sm,
		fontWeight: fontWeight.medium,
		color: colors.textSecondary,
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
	},
	inputError: {
		borderColor: colors.statusError,
		":focus": {
			borderColor: colors.statusError,
			boxShadow: "0 0 0 3px rgba(220, 38, 38, 0.1)",
		},
	},
	errorMessage: {
		fontSize: fontSize.xs,
		color: colors.statusError,
		marginTop: spacing.xxxs,
	},
	footer: {
		display: "flex",
		justifyContent: "flex-end",
		gap: spacing.xs,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.md,
		paddingRight: spacing.md,
	},
	button: {
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.md,
		paddingRight: spacing.md,
		fontSize: fontSize.md,
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
	},
	cancelButton: {
		backgroundColor: colors.bgTertiary,
		color: colors.textSecondary,
		":hover": {
			backgroundColor: colors.borderPrimary,
		},
	},
	confirmButton: {
		backgroundColor: colors.accentPrimary,
		color: "#ffffff",
		":hover": {
			backgroundColor: "#1d4ed8",
		},
	},
	srOnly: {
		position: "absolute",
		width: "1px",
		height: "1px",
		padding: 0,
		margin: "-1px",
		overflow: "hidden",
		clip: "rect(0, 0, 0, 0)",
		whiteSpace: "nowrap",
		borderWidth: 0,
	},
});

export interface ConfirmModalField {
	name: string;
	label: string;
	type?: "text" | "email" | "password" | "number";
	placeholder?: string;
	required?: boolean;
	validate?: (value: string) => string | null;
}

export interface ConfirmModalProps {
	title: string;
	description?: string;
	fields?: ConfirmModalField[];
	confirmText?: string;
	cancelText?: string;
	onConfirm: (data: Record<string, string> | null) => void;
	onClose: () => void;
}

export function ConfirmModal({
	title,
	description,
	fields = [],
	confirmText = "확인",
	cancelText = "취소",
	onConfirm,
	onClose,
}: ConfirmModalProps) {
	const modalId = useId();
	const titleId = `${modalId}-title`;
	const descriptionId = `${modalId}-description`;

	const dialogRef = useRef<HTMLDivElement>(null);
	const titleRef = useRef<HTMLHeadingElement>(null);

	const [formData, setFormData] = useState<Record<string, string>>(() =>
		fields.reduce(
			(acc, field) => {
				acc[field.name] = "";
				return acc;
			},
			{} as Record<string, string>,
		),
	);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [announcement, setAnnouncement] = useState("");

	useBodyScrollLock();
	useFocusManagement(true, { initialFocusRef: titleRef });

	const validateEmail = (value: string): string | null => {
		if (!value.trim()) return null;
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(value) ? null : "올바른 이메일 형식이 아닙니다";
	};

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const newErrors: Record<string, string> = {};

		for (const field of fields) {
			const value = formData[field.name] || "";

			if (field.required && !value.trim()) {
				newErrors[field.name] = `${field.label}을(를) 입력해주세요`;
				continue;
			}
			if (field.type === "email" && value.trim()) {
				const emailError = validateEmail(value);
				if (emailError) {
					newErrors[field.name] = emailError;
					continue;
				}
			}

			if (field.validate) {
				const customError = field.validate(value);
				if (customError) {
					newErrors[field.name] = customError;
				}
			}
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			const errorMessages = Object.values(newErrors).join(". ");
			setAnnouncement(`오류가 발생했습니다. ${errorMessages}`);
			return;
		}

		setErrors({});
		onConfirm(fields.length > 0 ? formData : null);
	};

	const handleInputChange = (name: string, value: string) => {
		setFormData((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[name];
				return newErrors;
			});
		}
	};

	const handleCancel = () => {
		onConfirm(null);
	};

	const hasError = (fieldName: string) => !!errors[fieldName];

	return (
		<div {...stylex.props(styles.overlay)} role="presentation">
			<div
				ref={dialogRef}
				{...stylex.props(styles.dialog)}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				aria-describedby={description ? descriptionId : undefined}
			>
				<div {...stylex.props(styles.header)}>
					<h2
						ref={titleRef}
						id={titleId}
						{...stylex.props(styles.title)}
						tabIndex={-1}
					>
						{title}
					</h2>
					<button
						type="button"
						{...stylex.props(styles.closeButton)}
						onClick={onClose}
						aria-label="닫기"
					>
						<X size={20} />
					</button>
				</div>

				<form
					{...stylex.props(styles.form)}
					onSubmit={handleSubmit}
					noValidate
				>
					<div {...stylex.props(styles.content)}>
						{description && (
							<p id={descriptionId} {...stylex.props(styles.description)}>
								{description}
							</p>
						)}

						{fields.map((field) => (
							<div key={field.name} {...stylex.props(styles.fieldGroup)}>
								<label
									htmlFor={`${modalId}-${field.name}`}
									{...stylex.props(styles.label)}
								>
									{field.label}
									{field.required && <span aria-hidden="true"> *</span>}
								</label>
								<input
									id={`${modalId}-${field.name}`}
									type={field.type || "text"}
									name={field.name}
									placeholder={field.placeholder}
									value={formData[field.name] || ""}
									onChange={(e) =>
										handleInputChange(field.name, e.target.value)
									}
									aria-required={field.required}
									aria-invalid={hasError(field.name)}
									aria-describedby={
										hasError(field.name)
											? `${modalId}-${field.name}-error`
											: undefined
									}
									{...stylex.props(
										styles.input,
										hasError(field.name) ? styles.inputError : null,
									)}
								/>
								{hasError(field.name) && (
									<span
										id={`${modalId}-${field.name}-error`}
										{...stylex.props(styles.errorMessage)}
										role="alert"
									>
										{errors[field.name]}
									</span>
								)}
							</div>
						))}
					</div>

					<div {...stylex.props(styles.footer)}>
						<button
							type="button"
							{...stylex.props(styles.button, styles.cancelButton)}
							onClick={handleCancel}
						>
							{cancelText}
						</button>
						<button
							type="submit"
							{...stylex.props(styles.button, styles.confirmButton)}
						>
							{confirmText}
						</button>
					</div>
				</form>
			</div>

			{/* 스크린리더를 위한 라이브 리전 */}
			<output
				aria-live="assertive"
				aria-atomic="true"
				{...stylex.props(styles.srOnly)}
			>
				{announcement}
			</output>
		</div>
	);
}
