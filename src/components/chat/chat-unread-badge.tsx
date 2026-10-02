"use client";

import * as stylex from "@stylexjs/stylex";
import { useQuery } from "@tanstack/react-query";
import {
	colors,
	fontSize,
	fontWeight,
	iconSize,
	lineHeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import { chatUnreadCountQueryOptions } from "@/lib/queries/chat";

/** 이 개수를 넘으면 "99+"로 줄여 보여 준다 */
const MAX_DISPLAY_COUNT = 99;

const styles = stylex.create({
	badge: {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		boxSizing: "border-box",
		flexShrink: 0,
		minWidth: iconSize.md,
		height: iconSize.md,
		paddingLeft: spacing.xxxs,
		paddingRight: spacing.xxxs,
		borderRadius: radius.lg,
		backgroundColor: colors.accentPrimary,
		color: colors.textInverse,
		fontSize: fontSize.xs,
		fontWeight: fontWeight.bold,
		lineHeight: lineHeight.tight,
	},
	// 하단 탭 아이콘의 오른쪽 위 모서리에 걸친다. 부모(아이콘 상자)가 position: relative여야 한다
	tabPosition: {
		position: "absolute",
		top: "-6px",
		left: "14px",
	},
});

interface ChatUnreadBadgeProps {
	/** 안 읽은 메시지 수. 0 이하면 아무것도 그리지 않는다 */
	count: number;
}

/**
 * 안 읽은 메시지 수를 보여 주는 원형 뱃지. 채팅 목록 항목과 하단 탭이 함께 쓴다.
 */
export function ChatUnreadBadge({ count }: ChatUnreadBadgeProps) {
	if (count <= 0) {
		return null;
	}

	return (
		<span
			role="img"
			aria-label={`안 읽은 메시지 ${count}개`}
			{...stylex.props(styles.badge)}
		>
			{count > MAX_DISPLAY_COUNT ? `${MAX_DISPLAY_COUNT}+` : count}
		</span>
	);
}

/**
 * 하단 탭의 채팅 아이콘에 붙는 안 읽음 수 뱃지.
 * 로그인하지 않았거나 요청이 실패하면 수가 0이라 아무것도 그리지 않는다.
 */
export function ChatTabUnreadBadge() {
	const { data: count = 0 } = useQuery(chatUnreadCountQueryOptions);

	if (count <= 0) {
		return null;
	}

	return (
		<span {...stylex.props(styles.tabPosition)}>
			<ChatUnreadBadge count={count} />
		</span>
	);
}
