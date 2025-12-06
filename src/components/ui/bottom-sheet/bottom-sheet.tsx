/** biome-ignore-all lint/a11y/useKeyWithClickEvents: backdrop click event */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: backdrop click event */
"use client";

import * as stylex from "@stylexjs/stylex";
import { X } from "lucide-react";
import {
	type HTMLAttributes,
	type ReactNode,
	useEffect,
	useEffectEvent,
	useRef,
} from "react";
import {
	colors,
	fontSize,
	fontWeight,
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
	"0%": { opacity: 0, transform: "translateY(100%)" },
	"100%": { opacity: 1, transform: "translateY(0)" },
});

const styles = stylex.create({
	overlay: {
		position: "fixed",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		display: "flex",
		alignItems: "flex-end",
		justifyContent: "center",
		zIndex: 9999,
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
	sheet: {
		width: "100%",
		maxWidth: "500px",
		backgroundColor: colors.bgPrimary,
		color: colors.textPrimary,
		borderTopLeftRadius: radius.lg,
		borderTopRightRadius: radius.lg,
		overflow: "hidden",
		display: "flex",
		flexDirection: "column",
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
	sheetSm: {
		minHeight: "50vh",
		maxHeight: "65vh",
	},
	sheetMd: {
		minHeight: "65vh",
		maxHeight: "80vh",
	},
	sheetLg: {
		minHeight: "80vh",
		maxHeight: "92vh",
	},
	sheetFull: {
		minHeight: "100vh",
		maxHeight: "100vh",
		borderTopLeftRadius: 0,
		borderTopRightRadius: 0,
	},
	handle: {
		width: "40px",
		height: "4px",
		backgroundColor: colors.borderSecondary,
		borderRadius: radius.sm,
		margin: "0 auto",
		marginTop: spacing.sm,
		marginBottom: spacing.xs,
		flexShrink: 0,
	},
	header: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.md,
		paddingRight: spacing.md,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
		flexShrink: 0,
	},
	headerWithHandle: {
		paddingTop: 0,
	},
	title: {
		fontSize: fontSize.lg,
		fontWeight: fontWeight.semibold,
		color: colors.textPrimary,
		margin: 0,
	},
	closeButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "32px",
		height: "32px",
		backgroundColor: "transparent",
		borderWidth: 0,
		borderRadius: radius.sm,
		cursor: "pointer",
		color: colors.textMuted,
		transition: "background-color 0.15s ease",
		":hover": {
			backgroundColor: colors.bgTertiary,
		},
		":focus-visible": {
			outlineWidth: 2,
			outlineStyle: "solid",
			outlineColor: colors.accentPrimary,
			outlineOffset: "-2px",
		},
	},
	content: {
		flex: 1,
		overflowY: "auto",
		paddingTop: spacing.md,
		paddingBottom: spacing.md,
		paddingLeft: spacing.md,
		paddingRight: spacing.md,
	},
	contentNoPadding: {
		paddingTop: 0,
		paddingBottom: 0,
		paddingLeft: 0,
		paddingRight: 0,
	},
	footer: {
		paddingTop: spacing.sm,
		paddingBottom: spacing.md,
		paddingLeft: spacing.md,
		paddingRight: spacing.md,
		borderTopWidth: 1,
		borderTopStyle: "solid",
		borderTopColor: colors.borderPrimary,
		flexShrink: 0,
	},
});

export type BottomSheetSize = "sm" | "md" | "lg" | "full";

export interface BottomSheetProps extends HTMLAttributes<HTMLDivElement> {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	showHandle?: boolean;
	showCloseButton?: boolean;
	size?: BottomSheetSize;
	closeOnOverlayClick?: boolean;
	closeOnEscape?: boolean;
	noPadding?: boolean;
	footer?: ReactNode;
	children: ReactNode;
}

const sizeStyles = {
	sm: styles.sheetSm,
	md: styles.sheetMd,
	lg: styles.sheetLg,
	full: styles.sheetFull,
};

export function BottomSheet({
	isOpen,
	onClose,
	title,
	showHandle = true,
	showCloseButton = false,
	size = "md",
	closeOnOverlayClick = true,
	closeOnEscape = true,
	noPadding = false,
	footer,
	children,
	...props
}: BottomSheetProps) {
	const sheetRef = useRef<HTMLDivElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	useBodyScrollLock(isOpen);
	useFocusManagement(isOpen, {
		initialFocusRef: showCloseButton ? closeButtonRef : undefined,
	});

	const closeCallback = useEffectEvent(onClose);

	useEffect(() => {
		if (!isOpen || !closeOnEscape) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				closeCallback();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, closeOnEscape]);

	if (!isOpen) return null;

	const handleOverlayClick = () => {
		if (closeOnOverlayClick) {
			onClose();
		}
	};

	const sizeStyle = sizeStyles[size];

	const showHeader = title || showCloseButton;

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-label={title || "바텀 시트"}
			{...stylex.props(styles.overlay)}
			onClick={handleOverlayClick}
		>
			<div
				ref={sheetRef}
				{...stylex.props(styles.sheet, sizeStyle)}
				onClick={(e) => e.stopPropagation()}
				{...props}
			>
				{showHandle && <div {...stylex.props(styles.handle)} />}

				{showHeader && (
					<div
						{...stylex.props(
							styles.header,
							showHandle && styles.headerWithHandle,
						)}
					>
						{title ? (
							<h2 {...stylex.props(styles.title)}>{title}</h2>
						) : (
							<span />
						)}
						{showCloseButton && (
							<button
								ref={closeButtonRef}
								type="button"
								onClick={onClose}
								aria-label="닫기"
								{...stylex.props(styles.closeButton)}
							>
								<X size={20} />
							</button>
						)}
					</div>
				)}

				<div
					{...stylex.props(
						styles.content,
						noPadding && styles.contentNoPadding,
					)}
				>
					{children}
				</div>

				{footer && <div {...stylex.props(styles.footer)}>{footer}</div>}
			</div>
		</div>
	);
}
