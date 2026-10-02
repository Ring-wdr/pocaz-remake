"use client";

import * as stylex from "@stylexjs/stylex";
import { Suspense } from "@suspensive/react";
import { SuspenseInfiniteQuery } from "@suspensive/react-query-5";
import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import {
	Bell,
	Heart,
	Loader2,
	type LucideIcon,
	MessageCircle,
	MessageCircleHeart,
	ShoppingBag,
	Star,
	Store,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	size,
	spacing,
} from "@/app/global-tokens.stylex";
import { NotificationListSkeleton } from "@/components/notifications/notification-list-skeleton";
import { QueryErrorBoundary } from "@/components/providers/query-error-boundary";
import {
	notificationsInfiniteQueryOptions,
	notificationsQueryKey,
	notificationUnreadCountQueryOptions,
} from "@/lib/queries/notifications";
import type { NotificationItem } from "@/types/entities";
import { formatRelativeTime } from "@/utils/date";
import { api } from "@/utils/eden";

const spinKeyframes = stylex.keyframes({
	"0%": { transform: "rotate(0deg)" },
	"100%": { transform: "rotate(360deg)" },
});

const styles = stylex.create({
	errorContainer: {
		marginBottom: spacing.sm,
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
	emptyState: {
		textAlign: "center",
		paddingTop: spacing.xxl,
		paddingBottom: spacing.xxl,
		color: colors.textPlaceholder,
	},
	emptyIcon: {
		marginBottom: spacing.sm,
	},
	emptyTitle: {
		fontSize: fontSize.base,
		fontWeight: fontWeight.semibold,
		color: colors.textTertiary,
		margin: 0,
		marginBottom: spacing.xxs,
	},
	emptyText: {
		fontSize: fontSize.md,
		margin: 0,
	},
	list: {
		listStyle: "none",
		margin: 0,
		padding: 0,
	},
	item: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		width: "100%",
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		borderTopWidth: 0,
		borderLeftWidth: 0,
		borderRightWidth: 0,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderSecondary,
		backgroundColor: "transparent",
		color: "inherit",
		textAlign: "left",
		cursor: "pointer",
	},
	itemBusy: {
		opacity: 0.7,
		cursor: "default",
	},
	iconWrap: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
		width: size.touchTarget,
		height: size.touchTarget,
		borderRadius: radius.full,
		backgroundColor: colors.bgTertiary,
		color: colors.textMuted,
	},
	iconWrapUnread: {
		backgroundColor: colors.accentPrimaryBg,
		color: colors.accentPrimary,
	},
	content: {
		flex: 1,
		minWidth: 0,
	},
	titleRow: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: spacing.xxs,
		marginBottom: spacing.xxxs,
	},
	title: {
		minWidth: 0,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
		fontSize: fontSize.md,
		fontWeight: fontWeight.medium,
		color: colors.textSecondary,
	},
	// 안 읽은 알림은 제목을 굵게 보여 준다
	titleUnread: {
		fontWeight: fontWeight.bold,
	},
	time: {
		flexShrink: 0,
		fontSize: fontSize.sm,
		color: colors.textPlaceholder,
	},
	body: {
		display: "block",
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
		fontSize: fontSize.md,
		color: colors.textMuted,
	},
	// 읽음/안 읽음에 따라 제목 줄 폭이 달라지지 않도록 점이 들어갈 자리를 항상 비워 둔다
	dotSlot: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
		width: spacing.xxs,
	},
	dot: {
		width: spacing.xxs,
		height: spacing.xxs,
		borderRadius: radius.full,
		backgroundColor: colors.accentPrimary,
	},
	loadingMore: {
		display: "flex",
		justifyContent: "center",
		paddingTop: spacing.md,
		paddingBottom: spacing.md,
	},
	spinner: {
		animationName: spinKeyframes,
		animationDuration: "1s",
		animationIterationCount: "infinite",
		animationTimingFunction: "linear",
	},
});

/** 알림 종류별 아이콘. 모르는 종류는 종 아이콘으로 보여 준다 */
const TYPE_ICONS: Record<string, LucideIcon> = {
	comment: MessageCircle,
	like: Heart,
	chat: MessageCircleHeart,
	market: Store,
	trade: ShoppingBag,
	review: Star,
};

/**
 * 알림 하나를 읽음으로 보이게 한다. 목록 캐시의 그 항목에 읽은 시각을 넣고, 안 읽음 수 뱃지를 하나 줄인다.
 * 서버 요청이 끝나면 쿼리를 무효화해 서버 값으로 맞춘다.
 */
function markReadInCache(queryClient: QueryClient, id: string) {
	const readAt = new Date().toISOString();
	queryClient.setQueryData(
		notificationsInfiniteQueryOptions().queryKey,
		(data) =>
			data && {
				...data,
				pages: data.pages.map((page) => ({
					...page,
					items: page.items.map((item) =>
						item.id === id && item.readAt === null ? { ...item, readAt } : item,
					),
				})),
			},
	);
	queryClient.setQueryData(
		notificationUnreadCountQueryOptions().queryKey,
		(count) => (count === undefined ? count : Math.max(0, count - 1)),
	);
}

interface ErrorFallbackProps {
	title: string;
	description?: string;
}

function ErrorFallback({ title, description }: ErrorFallbackProps) {
	return (
		<div {...stylex.props(styles.errorContainer)}>
			<p {...stylex.props(styles.errorTitle)}>{title}</p>
			{description && <p {...stylex.props(styles.errorDesc)}>{description}</p>}
		</div>
	);
}

interface NotificationRowProps {
	notification: NotificationItem;
}

/**
 * 알림 한 줄. 누르면 안 읽은 알림을 낙관적으로 읽음 표시하고 서버에 읽음 처리를 요청한 뒤,
 * 알림함 쿼리를 무효화하고 알림의 href로 이동한다. href가 없으면 읽음 처리만 한다.
 */
function NotificationRow({ notification }: NotificationRowProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [isPending, startTransition] = useTransition();
	// 요청을 기다리는 사이 다른 화면으로 떠났다면 그 뒤에 알림 화면으로 끌고 가지 않는다
	const isMountedRef = useRef(true);
	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	const isUnread = notification.readAt === null;
	const Icon = TYPE_ICONS[notification.type] ?? Bell;

	const handleClick = () => {
		if (isPending) return;

		startTransition(async () => {
			if (isUnread) {
				// 진행 중인 새로 받기가 방금 표시한 읽음 상태를 옛 값으로 덮어쓰지 않게 먼저 멈춘다
				await queryClient.cancelQueries({ queryKey: notificationsQueryKey });
				markReadInCache(queryClient, notification.id);
				try {
					const { error } = await api
						.notifications({ id: notification.id })
						.read.patch();
					if (error) {
						console.error("Mark notification read failed:", error.status);
					}
				} catch (err) {
					console.error("Mark notification read error:", err);
				}
				// 실패했어도 서버 값으로 되돌리거나 맞추도록 항상 새로 받는다
				void queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
			}

			if (notification.href && isMountedRef.current) {
				router.push(notification.href);
			}
		});
	};

	return (
		<li>
			<button
				type="button"
				onClick={handleClick}
				{...stylex.props(styles.item, isPending && styles.itemBusy)}
			>
				<span
					aria-hidden="true"
					{...stylex.props(styles.iconWrap, isUnread && styles.iconWrapUnread)}
				>
					<Icon size={20} />
				</span>
				<span {...stylex.props(styles.content)}>
					<span {...stylex.props(styles.titleRow)}>
						<span
							{...stylex.props(styles.title, isUnread && styles.titleUnread)}
						>
							{notification.title}
						</span>
						<time
							dateTime={notification.createdAt}
							{...stylex.props(styles.time)}
						>
							{formatRelativeTime(notification.createdAt)}
						</time>
					</span>
					{notification.body && (
						<span {...stylex.props(styles.body)}>{notification.body}</span>
					)}
				</span>
				<span {...stylex.props(styles.dotSlot)}>
					{isUnread && (
						<span
							role="img"
							aria-label="안 읽음"
							{...stylex.props(styles.dot)}
						/>
					)}
				</span>
			</button>
		</li>
	);
}

interface NotificationListViewProps {
	notifications: NotificationItem[];
	isLoadingMore: boolean;
	hasMore: boolean;
	onLoadMore: () => void;
}

function NotificationListView({
	notifications,
	isLoadingMore,
	hasMore,
	onLoadMore,
}: NotificationListViewProps) {
	const loadMoreRef = useRef<HTMLDivElement>(null);

	// 무한 스크롤 관찰: 목록 끝의 표지가 보이면 다음 페이지를 받는다
	useEffect(() => {
		const target = loadMoreRef.current;
		if (!hasMore || isLoadingMore || !target) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					onLoadMore();
				}
			},
			{ threshold: 0.1 },
		);
		observer.observe(target);
		return () => observer.disconnect();
	}, [hasMore, isLoadingMore, onLoadMore]);

	if (notifications.length === 0) {
		return (
			<div {...stylex.props(styles.emptyState)}>
				<Bell
					size={56}
					aria-hidden="true"
					{...stylex.props(styles.emptyIcon)}
				/>
				<h2 {...stylex.props(styles.emptyTitle)}>아직 알림이 없어요</h2>
				<p {...stylex.props(styles.emptyText)}>
					댓글, 좋아요, 거래, 채팅 소식이 여기에 모여요
				</p>
			</div>
		);
	}

	return (
		<div>
			<ul {...stylex.props(styles.list)}>
				{notifications.map((notification) => (
					<NotificationRow key={notification.id} notification={notification} />
				))}
			</ul>
			<div ref={loadMoreRef} {...stylex.props(styles.loadingMore)}>
				{isLoadingMore && (
					<Loader2 size={24} {...stylex.props(styles.spinner)} />
				)}
			</div>
		</div>
	);
}

/**
 * 알림함 목록. 서버에서 그리지 않고 클라이언트에서만 불러온다(캐시가 있으면 먼저 보여 주고 뒤에서 갱신).
 */
export function NotificationList() {
	return (
		<QueryErrorBoundary
			fallback={() => (
				<ErrorFallback
					title="알림을 불러오지 못했습니다"
					description="잠시 후 다시 시도해주세요"
				/>
			)}
		>
			<Suspense clientOnly fallback={<NotificationListSkeleton />}>
				<SuspenseInfiniteQuery {...notificationsInfiniteQueryOptions()}>
					{({
						data: { pages },
						fetchNextPage,
						hasNextPage,
						isFetchingNextPage,
					}) => (
						<NotificationListView
							notifications={pages.flatMap((page) => page.items)}
							isLoadingMore={isFetchingNextPage}
							hasMore={hasNextPage}
							onLoadMore={fetchNextPage}
						/>
					)}
				</SuspenseInfiniteQuery>
			</Suspense>
		</QueryErrorBoundary>
	);
}
