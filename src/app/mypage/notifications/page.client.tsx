"use client";

import * as stylex from "@stylexjs/stylex";
import { Suspense } from "@suspensive/react";
import {
	type QueryClient,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import { Footer } from "@/components/home";
import { QueryErrorBoundary } from "@/components/providers/query-error-boundary";
import { Skeleton } from "@/components/ui";
import { notificationSettingsQueryOptions } from "@/lib/queries/notifications";
import type { NotificationSettingKey } from "@/types/entities";
import { api } from "@/utils/eden";

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
		gap: spacing.sm,
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
		flexShrink: 0,
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
	errorContainer: {
		paddingTop: spacing.md,
		paddingBottom: spacing.md,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
		borderLeftWidth: 4,
		borderLeftStyle: "solid",
		borderLeftColor: colors.statusError,
	},
	errorTitle: {
		margin: 0,
		marginBottom: spacing.xxxs,
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
	},
	errorDesc: {
		margin: 0,
		fontSize: fontSize.sm,
		color: colors.textMuted,
	},
	skeletonInfo: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		gap: spacing.xxs,
	},
});

/** 화면에 보여 줄 알림 설정 항목. key는 서버 설정 키와 같다 */
const SETTING_ITEMS: {
	key: NotificationSettingKey;
	label: string;
	description: string;
}[] = [
	{
		key: "chat",
		label: "채팅 알림",
		description: "새 메시지가 도착하면 알림을 받습니다",
	},
	{
		key: "like",
		label: "좋아요 알림",
		description: "내 게시글에 좋아요가 달리면 알림을 받습니다",
	},
	{
		key: "comment",
		label: "댓글 알림",
		description: "내 글에 댓글이나 답글이 달리면 알림을 받습니다",
	},
	{
		key: "market",
		label: "관심 상품 알림",
		description: "찜한 상품의 상태가 바뀌면 알림을 받습니다",
	},
	{
		key: "trade",
		label: "거래 알림",
		description: "거래가 완료되거나 후기가 도착하면 알림을 받습니다",
	},
];

const SAVE_FAILED_MESSAGE = "설정을 저장하지 못했어요";

/** 설정 캐시에서 한 항목만 바꾼다. 다른 항목은 그대로 둔다 */
function setSettingInCache(
	queryClient: QueryClient,
	key: NotificationSettingKey,
	enabled: boolean,
) {
	queryClient.setQueryData(
		notificationSettingsQueryOptions().queryKey,
		(settings) => settings && { ...settings, [key]: enabled },
	);
}

/**
 * 알림 종류별 토글 목록. 서버 설정을 읽어 보여 주고, 토글하면 화면을 먼저 바꾼 뒤 그 항목만 서버에 저장한다.
 * 저장하지 못하면 그 항목만 되돌리고 토스트로 알린다.
 */
function NotificationSettingsList() {
	const queryClient = useQueryClient();
	const { data: settings } = useSuspenseQuery(
		notificationSettingsQueryOptions(),
	);
	// 저장 요청이 끝나지 않은 항목. 같은 항목을 연달아 누르면 요청 순서가 바뀌어 화면과 서버 값이 어긋날 수 있어 막는다
	const [savingKeys, setSavingKeys] = useState<NotificationSettingKey[]>([]);
	const [, startTransition] = useTransition();

	const handleToggle = (key: NotificationSettingKey) => {
		if (savingKeys.includes(key)) return;

		const enabled = !settings[key];
		setSavingKeys((keys) => [...keys, key]);
		startTransition(async () => {
			// 진행 중인 새로 받기가 방금 바꾼 값을 옛 값으로 덮어쓰지 않게 먼저 멈춘다
			await queryClient.cancelQueries({
				queryKey: notificationSettingsQueryOptions().queryKey,
			});
			setSettingInCache(queryClient, key, enabled);

			try {
				const { error } = await api.users.me["notification-settings"].put({
					[key]: enabled,
				});
				if (error) {
					throw new Error(`Save notification setting failed: ${error.status}`);
				}
			} catch (err) {
				console.error("Save notification setting error:", err);
				// 이 항목만 되돌린다. 그 사이 다른 항목을 바꿨어도 그 값은 그대로 둔다
				setSettingInCache(queryClient, key, !enabled);
				toast.error(SAVE_FAILED_MESSAGE);
			} finally {
				setSavingKeys((keys) => keys.filter((saving) => saving !== key));
			}
		});
	};

	return (
		<div {...stylex.props(styles.list)}>
			{SETTING_ITEMS.map((item, index) => {
				const enabled = settings[item.key];
				return (
					<div
						key={item.key}
						{...stylex.props(
							styles.item,
							index === SETTING_ITEMS.length - 1 && styles.itemLast,
						)}
					>
						<div {...stylex.props(styles.itemInfo)}>
							<p {...stylex.props(styles.label)}>{item.label}</p>
							<p {...stylex.props(styles.description)}>{item.description}</p>
						</div>
						<button
							type="button"
							role="switch"
							aria-checked={enabled}
							aria-label={item.label}
							onClick={() => handleToggle(item.key)}
							{...stylex.props(styles.toggle, enabled && styles.toggleOn)}
						>
							<span
								{...stylex.props(
									styles.toggleKnob,
									enabled && styles.toggleKnobOn,
								)}
							/>
						</button>
					</div>
				);
			})}
		</div>
	);
}

/** 설정을 불러오는 동안 보여 주는 자리표시. 항목 수와 모양을 맞춘다 */
function NotificationSettingsSkeleton() {
	return (
		<div aria-busy="true" {...stylex.props(styles.list)}>
			{SETTING_ITEMS.map((item, index) => (
				<div
					key={item.key}
					{...stylex.props(
						styles.item,
						index === SETTING_ITEMS.length - 1 && styles.itemLast,
					)}
				>
					<div {...stylex.props(styles.skeletonInfo)}>
						<Skeleton variant="text" width="35%" height={16} />
						<Skeleton variant="text" width="70%" height={14} />
					</div>
					<Skeleton variant="rounded" width={48} height={28} />
				</div>
			))}
		</div>
	);
}

export default function NotificationSettingsPage() {
	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<Link
					aria-label="설정으로 돌아가기"
					href="/mypage/settings"
					{...stylex.props(styles.backButton)}
				>
					<ArrowLeft size={20} />
				</Link>
				<h1 {...stylex.props(styles.headerTitle)}>알림 설정</h1>
			</header>

			<div {...stylex.props(styles.content)}>
				<div {...stylex.props(styles.section)}>
					<h2 {...stylex.props(styles.sectionTitle)}>활동 알림</h2>
					<QueryErrorBoundary
						fallback={() => (
							<div {...stylex.props(styles.errorContainer)}>
								<p {...stylex.props(styles.errorTitle)}>
									알림 설정을 불러오지 못했습니다
								</p>
								<p {...stylex.props(styles.errorDesc)}>
									잠시 후 다시 시도해주세요
								</p>
							</div>
						)}
					>
						<Suspense clientOnly fallback={<NotificationSettingsSkeleton />}>
							<NotificationSettingsList />
						</Suspense>
					</QueryErrorBoundary>
				</div>
			</div>

			<Footer />
		</div>
	);
}
