"use client";

import * as stylex from "@stylexjs/stylex";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { colors, fontSize, fontWeight, radius, spacing } from "@/app/global-tokens.stylex";
import { Footer } from "@/components/home";

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: colors.bgPrimary,
	},
	header: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
	},
	backButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "36px",
		height: "36px",
		color: colors.textSecondary,
		backgroundColor: "transparent",
		borderWidth: 0,
		borderRadius: radius.sm,
		cursor: "pointer",
		textDecoration: "none",
	},
	headerTitle: {
		flex: 1,
		fontSize: fontSize.lg,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
		margin: 0,
	},
	content: {
		flex: 1,
		paddingTop: spacing.md,
		paddingBottom: spacing.md,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
	},
	section: {
		marginBottom: spacing.md,
	},
	sectionTitle: {
		fontSize: "13px",
		fontWeight: fontWeight.semibold,
		color: colors.textMuted,
		margin: 0,
		marginBottom: spacing.xs,
		paddingLeft: spacing.xxxs,
	},
	list: {
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
		overflow: "hidden",
	},
	item: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
	},
	itemLast: {
		borderBottomWidth: 0,
	},
	itemInfo: {
		flex: 1,
	},
	label: {
		fontSize: fontSize.md,
		fontWeight: fontWeight.medium,
		color: colors.textSecondary,
		margin: 0,
		marginBottom: "2px",
	},
	description: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
		margin: 0,
	},
	toggle: {
		position: "relative",
		width: "48px",
		height: "28px",
		backgroundColor: colors.textPlaceholder,
		borderWidth: 0,
		borderRadius: "14px",
		cursor: "pointer",
		transition: "background-color 0.2s ease",
	},
	toggleOn: {
		backgroundColor: colors.accentPrimary,
	},
	toggleKnob: {
		position: "absolute",
		top: "2px",
		left: "2px",
		width: "24px",
		height: "24px",
		backgroundColor: colors.textInverse,
		borderRadius: "12px",
		transition: "transform 0.2s ease",
	},
	toggleKnobOn: {
		transform: "translateX(20px)",
	},
});

interface NotificationSetting {
	id: string;
	label: string;
	description: string;
	enabled: boolean;
}

export default function NotificationsPage() {
	const [settings, setSettings] = useState<NotificationSetting[]>([
		{
			id: "chat",
			label: "채팅 알림",
			description: "새 메시지가 도착하면 알림을 받습니다",
			enabled: true,
		},
		{
			id: "like",
			label: "좋아요 알림",
			description: "내 게시글에 좋아요가 달리면 알림을 받습니다",
			enabled: true,
		},
		{
			id: "comment",
			label: "댓글 알림",
			description: "내 게시글에 댓글이 달리면 알림을 받습니다",
			enabled: true,
		},
		{
			id: "market",
			label: "장터 알림",
			description: "관심 상품의 상태가 변경되면 알림을 받습니다",
			enabled: false,
		},
	]);

	const [marketingSettings, setMarketingSettings] = useState<
		NotificationSetting[]
	>([
		{
			id: "event",
			label: "이벤트 알림",
			description: "새로운 이벤트와 프로모션 정보를 받습니다",
			enabled: false,
		},
		{
			id: "news",
			label: "소식 알림",
			description: "포카즈의 새로운 기능과 업데이트 소식을 받습니다",
			enabled: true,
		},
	]);

	const toggleSetting = (id: string, isMarketing: boolean) => {
		if (isMarketing) {
			setMarketingSettings((prev) =>
				prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
			);
		} else {
			setSettings((prev) =>
				prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
			);
		}
	};

	const renderToggle = (setting: NotificationSetting, isMarketing: boolean) => (
		<button
			type="button"
			onClick={() => toggleSetting(setting.id, isMarketing)}
			{...stylex.props(styles.toggle, setting.enabled && styles.toggleOn)}
		>
			<span
				{...stylex.props(
					styles.toggleKnob,
					setting.enabled && styles.toggleKnobOn,
				)}
			/>
		</button>
	);

	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<Link href="/mypage/settings" {...stylex.props(styles.backButton)}>
					<ArrowLeft size={20} />
				</Link>
				<h1 {...stylex.props(styles.headerTitle)}>알림 설정</h1>
			</header>

			<div {...stylex.props(styles.content)}>
				<div {...stylex.props(styles.section)}>
					<h2 {...stylex.props(styles.sectionTitle)}>활동 알림</h2>
					<div {...stylex.props(styles.list)}>
						{settings.map((setting, index) => (
							<div
								key={setting.id}
								{...stylex.props(
									styles.item,
									index === settings.length - 1 && styles.itemLast,
								)}
							>
								<div {...stylex.props(styles.itemInfo)}>
									<p {...stylex.props(styles.label)}>{setting.label}</p>
									<p {...stylex.props(styles.description)}>
										{setting.description}
									</p>
								</div>
								{renderToggle(setting, false)}
							</div>
						))}
					</div>
				</div>

				<div {...stylex.props(styles.section)}>
					<h2 {...stylex.props(styles.sectionTitle)}>마케팅 알림</h2>
					<div {...stylex.props(styles.list)}>
						{marketingSettings.map((setting, index) => (
							<div
								key={setting.id}
								{...stylex.props(
									styles.item,
									index === marketingSettings.length - 1 && styles.itemLast,
								)}
							>
								<div {...stylex.props(styles.itemInfo)}>
									<p {...stylex.props(styles.label)}>{setting.label}</p>
									<p {...stylex.props(styles.description)}>
										{setting.description}
									</p>
								</div>
								{renderToggle(setting, true)}
							</div>
						))}
					</div>
				</div>
			</div>

			<Footer />
		</div>
	);
}
