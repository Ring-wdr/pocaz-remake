"use client";

import * as stylex from "@stylexjs/stylex";
import { type ReactNode, useEffect, useRef } from "react";
import { spacing } from "@/app/global-tokens.stylex";

const styles = stylex.create({
	// fieldset의 기본 테두리·여백·최소 너비를 없앤 칩 묶음
	group: {
		minWidth: 0,
		marginTop: 0,
		marginLeft: 0,
		marginRight: 0,
		marginBottom: spacing.sm,
		padding: 0,
		borderWidth: 0,
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
	chips: {
		display: "flex",
		gap: spacing.xxs,
		overflowX: "auto",
	},
});

type ChipGroupProps = {
	/** 스크린리더에만 읽히는 묶음 이름 */
	label: string;
	children: ReactNode;
};

/**
 * 칩을 가로로 늘어놓는 묶음. 칩이 넘치면 가로로 스크롤한다.
 * 주소창의 필터로 시작해 선택된 칩이 화면 밖에 있으면, 처음 그릴 때 그 칩이 보이는 곳으로 스크롤한다.
 */
export default function ChipGroup({ label, children }: ChipGroupProps) {
	const rowRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const row = rowRef.current;
		const active = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
		if (!row || !active) return;
		// scrollIntoView는 페이지까지 움직일 수 있어서 칩 줄만 스크롤한다
		const rowRect = row.getBoundingClientRect();
		const activeRect = active.getBoundingClientRect();
		row.scrollLeft +=
			activeRect.left - rowRect.left - (rowRect.width - activeRect.width) / 2;
	}, []);

	return (
		<fieldset {...stylex.props(styles.group)}>
			<legend {...stylex.props(styles.srOnly)}>{label}</legend>
			<div ref={rowRef} {...stylex.props(styles.chips)}>
				{children}
			</div>
		</fieldset>
	);
}
