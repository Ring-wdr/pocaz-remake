"use client";

import * as stylex from "@stylexjs/stylex";
import { DoorOpen } from "lucide-react";
import { useRef } from "react";
import { colors, fontSize, radius, spacing } from "@/app/global-tokens.stylex";
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
		borderTopLeftRadius: radius.lg,
		borderTopRightRadius: radius.lg,
		paddingTop: spacing.sm,
		paddingBottom: spacing.lg,
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
	handle: {
		width: "40px",
		height: "4px",
		backgroundColor: colors.borderSecondary,
		borderRadius: radius.sm,
		margin: "0 auto",
		marginBottom: spacing.sm,
	},
	menuItem: {
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
		width: "100%",
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.md,
		paddingRight: spacing.md,
		fontSize: fontSize.base,
		color: colors.textSecondary,
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
		textAlign: "left",
		":focus-visible": {
			outlineWidth: 2,
			outlineStyle: "solid",
			outlineColor: colors.accentPrimary,
			outlineOffset: "-2px",
		},
	},
	menuItemDanger: {
		color: colors.statusError,
	},
	menuItemDisabled: {
		opacity: 0.5,
		cursor: "default",
	},
});

export interface ChatRoomMenuBottomSheetProps {
	isLeaving: boolean;
	onLeaveRoom: () => void;
	onClose: () => void;
}

export function ChatRoomMenuBottomSheet({
	isLeaving,
	onLeaveRoom,
	onClose,
}: ChatRoomMenuBottomSheetProps) {
	const sheetRef = useRef<HTMLDivElement>(null);
	const firstButtonRef = useRef<HTMLButtonElement>(null);

	useBodyScrollLock();
	useFocusManagement(true, { initialFocusRef: firstButtonRef });

	const handleOverlayClick = () => {
		if (!isLeaving) {
			onClose();
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape" && !isLeaving) {
			onClose();
		}
	};

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-label="채팅방 메뉴"
			{...stylex.props(styles.overlay)}
			onClick={handleOverlayClick}
			onKeyDown={handleKeyDown}
		>
			<div
				ref={sheetRef}
				role="menu"
				{...stylex.props(styles.sheet)}
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<div {...stylex.props(styles.handle)} />
				<button
					ref={firstButtonRef}
					type="button"
					role="menuitem"
					onClick={onLeaveRoom}
					disabled={isLeaving}
					{...stylex.props(
						styles.menuItem,
						styles.menuItemDanger,
						isLeaving && styles.menuItemDisabled,
					)}
				>
					<DoorOpen size={20} />
					{isLeaving ? "나가는 중..." : "채팅방 나가기"}
				</button>
			</div>
		</div>
	);
}
