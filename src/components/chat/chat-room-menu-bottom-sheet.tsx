"use client";

import * as stylex from "@stylexjs/stylex";
import { DoorOpen } from "lucide-react";
import { colors, fontSize, spacing } from "@/app/global-tokens.stylex";
import { BottomSheet } from "@/components/ui";

const styles = stylex.create({
	content: {
		paddingTop: spacing.sm,
		paddingBottom: spacing.lg,
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
	return (
		<BottomSheet
			isOpen
			onClose={onClose}
			title="채팅방 메뉴"
			closeOnOverlayClick={!isLeaving}
			closeOnEscape={!isLeaving}
			noPadding
		>
			<div {...stylex.props(styles.content)}>
				<button
					type="button"
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
		</BottomSheet>
	);
}
