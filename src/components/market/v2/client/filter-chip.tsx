"use client";

import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { colors, fontWeight, spacing } from "@/app/global-tokens.stylex";

const styles = stylex.create({
	chip: {
		paddingTop: "6px",
		paddingBottom: "6px",
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		borderRadius: "16px",
		fontSize: "13px",
		fontWeight: fontWeight.medium,
		backgroundColor: colors.bgTertiary,
		color: colors.textMuted,
		borderWidth: 0,
		cursor: "pointer",
		whiteSpace: "nowrap",
		transition: "all 0.2s ease",
	},
	chipActive: {
		backgroundColor: colors.bgInverse,
		color: colors.textInverse,
	},
});

type FilterChipProps = {
	/** 지금 선택된(켜진) 칩인지. 스크린리더에도 눌림 상태로 전달된다 */
	active: boolean;
	onClick: () => void;
	children: ReactNode;
};

/** 목록 필터에 쓰는 알약 모양 버튼 (판매 상태 탭, 상품 상태 칩, 협상 가능 토글) */
export default function FilterChip({
	active,
	onClick,
	children,
}: FilterChipProps) {
	return (
		<button
			type="button"
			aria-pressed={active}
			onClick={onClick}
			{...stylex.props(styles.chip, active && styles.chipActive)}
		>
			{children}
		</button>
	);
}
