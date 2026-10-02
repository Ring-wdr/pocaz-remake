"use client";

import * as stylex from "@stylexjs/stylex";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import Link from "next/link";
import {
	colors,
	fontSize,
	fontWeight,
	iconSize,
	lineHeight,
	radius,
	size,
	spacing,
} from "@/app/global-tokens.stylex";
import { notificationUnreadCountQueryOptions } from "@/lib/queries/notifications";

/** 이 개수를 넘으면 "99+"로 줄여 보여 준다 */
const MAX_DISPLAY_COUNT = 99;

const styles = stylex.create({
	link: {
		// 뱃지가 아이콘 모서리를 기준으로 놓이도록 링크를 기준 상자로 둔다
		position: "relative",
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
		width: size.touchTarget,
		height: size.touchTarget,
		color: colors.textSecondary,
		textDecoration: "none",
	},
	badge: {
		position: "absolute",
		top: "2px",
		left: "20px",
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		boxSizing: "border-box",
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
});

/**
 * 알림함(`/notifications`)으로 가는 종 아이콘과 안 읽은 알림 수 뱃지. 홈 헤더와 마이페이지 헤더가 함께 쓴다.
 * 로그인하지 않았거나 요청이 실패하면 수가 0이라 뱃지를 그리지 않는다(링크는 그대로 보인다).
 */
export function NotificationBell() {
	const { data: count = 0 } = useQuery(notificationUnreadCountQueryOptions());

	return (
		<Link
			href="/notifications"
			aria-label="알림"
			{...stylex.props(styles.link)}
		>
			<Bell size={24} aria-hidden="true" />
			{count > 0 && (
				<span
					role="img"
					aria-label={`안 읽은 알림 ${count}개`}
					{...stylex.props(styles.badge)}
				>
					{count > MAX_DISPLAY_COUNT ? `${MAX_DISPLAY_COUNT}+` : count}
				</span>
			)}
		</Link>
	);
}
