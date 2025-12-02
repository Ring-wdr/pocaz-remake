import * as stylex from "@stylexjs/stylex";
import {
	AlertTriangle,
	ArrowLeft,
	FileText,
	Heart,
	MessageCircle,
	Store,
} from "lucide-react";
import Link from "next/link";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import { Footer } from "@/components/home";
import { createMetadata } from "@/lib/metadata";
import { formatRelativeTime } from "@/utils/date";
import { api } from "@/utils/eden";

export const metadata = createMetadata({
	title: "활동 내역 | POCAZ",
	description: "게시글, 좋아요, 거래 활동을 시간순으로 확인하세요.",
	path: "/mypage/activity",
	ogTitle: "Activity",
});

const PAGE_SIZE = 20;

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
		display: "flex",
		flexDirection: "column",
		gap: spacing.sm,
	},
	filterBar: {
		display: "flex",
		flexWrap: "wrap",
		gap: spacing.xs,
	},
	filterChip: {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		paddingTop: spacing.xxxs,
		paddingBottom: spacing.xxxs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderRadius: radius.lg,
		backgroundColor: colors.bgSecondary,
		color: colors.textSecondary,
		fontSize: fontSize.sm,
		fontWeight: fontWeight.medium,
		textDecoration: "none",
		transition: "background-color 0.2s ease",
	},
	filterChipActive: {
		backgroundColor: colors.accentPrimaryBg,
		color: colors.accentPrimary,
	},
	filterChipMuted: {
		color: colors.textMuted,
	},
	helpText: {
		margin: 0,
		fontSize: fontSize.sm,
		color: colors.textMuted,
	},
	activityList: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xs,
	},
	activityItem: {
		display: "flex",
		alignItems: "flex-start",
		gap: spacing.xs,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
		textDecoration: "none",
		color: "inherit",
	},
	iconWrap: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "36px",
		height: "36px",
		borderRadius: "18px",
		flexShrink: 0,
	},
	iconPost: {
		backgroundColor: colors.statusInfoBg,
		color: colors.statusInfo,
	},
	iconLike: {
		backgroundColor: colors.statusErrorBgLight,
		color: colors.statusError,
	},
	iconComment: {
		backgroundColor: colors.statusSuccessBg,
		color: colors.statusSuccess,
	},
	iconTrade: {
		backgroundColor: colors.statusWarningBg,
		color: colors.statusWarning,
	},
	activityContent: {
		flex: 1,
		minWidth: 0,
	},
	activityText: {
		fontSize: fontSize.md,
		color: colors.textSecondary,
		margin: 0,
		marginBottom: "2px",
		lineHeight: 1.4,
	},
	activityTarget: {
		fontWeight: fontWeight.semibold,
	},
	activityTime: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
		margin: 0,
	},
	emptyState: {
		textAlign: "center",
		paddingTop: spacing.xl,
		paddingBottom: spacing.xl,
		color: colors.textPlaceholder,
	},
	emptyText: {
		fontSize: fontSize.md,
		margin: 0,
		marginTop: spacing.xs,
	},
	errorBox: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		paddingTop: spacing.md,
		paddingBottom: spacing.md,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
		gap: spacing.xxxs,
	},
	errorTitle: {
		margin: 0,
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
	},
	errorDesc: {
		margin: 0,
		fontSize: fontSize.sm,
		color: colors.textMuted,
		textAlign: "center",
	},
	pagination: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: spacing.xs,
	},
	paginationButton: {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.xxxs,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderRadius: radius.sm,
		backgroundColor: colors.bgInverse,
		color: colors.textInverse,
		fontSize: fontSize.sm,
		fontWeight: fontWeight.semibold,
		textDecoration: "none",
	},
	paginationSecondary: {
		backgroundColor: colors.bgSecondary,
		color: colors.textSecondary,
	},
	spacer: {
		flex: 1,
	},
});

type ActivityType = "post" | "like" | "comment" | "trade" | "market";
type ActivityFilter = ActivityType | "all";

const filters: Array<{ key: ActivityFilter; label: string }> = [
	{ key: "all", label: "전체" },
	{ key: "post", label: "게시글" },
	{ key: "like", label: "좋아요" },
	{ key: "comment", label: "댓글" },
	{ key: "trade", label: "거래" },
	{ key: "market", label: "마켓" },
];

const iconStyles: Record<ActivityType, keyof typeof styles> = {
	post: "iconPost",
	like: "iconLike",
	comment: "iconComment",
	trade: "iconTrade",
	market: "iconTrade",
};

const IconComponents: Record<ActivityType, typeof FileText> = {
	post: FileText,
	like: Heart,
	comment: MessageCircle,
	trade: Store,
	market: Store,
};

const buildHref = (params: {
	type?: ActivityFilter;
	cursor?: string | null;
}) => {
	const urlParams = new URLSearchParams();
	urlParams.set("limit", `${PAGE_SIZE}`);
	if (params.type && params.type !== "all") {
		urlParams.set("type", params.type);
	}
	if (params.cursor) {
		urlParams.set("cursor", params.cursor);
	}

	const qs = urlParams.toString();
	return qs ? `/mypage/activity?${qs}` : "/mypage/activity";
};

export default async function ActivityPage({
	searchParams,
}: PageProps<"/mypage/activity">) {
	const { type, cursor, limit } = await searchParams;
	const typeParam = typeof type === "string" ? type : "all";
	const currentType = filters.some((filter) => filter.key === typeParam)
		? (typeParam as ActivityFilter)
		: "all";
	const cursorParam = typeof cursor === "string" ? cursor : undefined;
	const limitParam = typeof limit === "string" ? limit : `${PAGE_SIZE}`;

	const query: Record<string, string> = { limit: limitParam };
	if (cursorParam) {
		query.cursor = cursorParam;
	}
	if (currentType !== "all") {
		query.type = currentType;
	}

	const { data, error } = await api.users.me.activity.get({ query });
	const activities = data?.items ?? [];
	const hasMore = data?.hasMore ?? false;
	const nextCursor = data?.nextCursor ?? null;

	const nextHref =
		hasMore && nextCursor
			? buildHref({ type: currentType, cursor: nextCursor })
			: null;
	const resetHref = buildHref({ type: currentType });

	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<Link href="/mypage" {...stylex.props(styles.backButton)}>
					<ArrowLeft size={20} />
				</Link>
				<h1 {...stylex.props(styles.headerTitle)}>활동 내역</h1>
			</header>

			<div {...stylex.props(styles.content)}>
				<div {...stylex.props(styles.filterBar)}>
					{filters.map((filter) => (
						<Link
							key={filter.key}
							href={buildHref({ type: filter.key })}
							{...stylex.props(
								styles.filterChip,
								filter.key === currentType
									? styles.filterChipActive
									: styles.filterChipMuted,
							)}
						>
							{filter.label}
						</Link>
					))}
				</div>
				<p {...stylex.props(styles.helpText)}>
					최신 순으로 정렬되며, 페이지당 {PAGE_SIZE}개씩 표시됩니다.
				</p>

				{error ? (
					<div {...stylex.props(styles.errorBox)}>
						<AlertTriangle size={24} color={colors.statusWarning} />
						<p {...stylex.props(styles.errorTitle)}>
							활동 내역을 불러오지 못했어요
						</p>
						<p {...stylex.props(styles.errorDesc)}>
							네트워크 상태를 확인한 뒤 다시 시도해주세요.
						</p>
					</div>
				) : activities.length > 0 ? (
					<div {...stylex.props(styles.activityList)}>
						{activities.map((activity) => {
							const activityType = activity.type as ActivityType;
							const IconComponent = IconComponents[activityType] || FileText;
							const content = (
								<>
									<div
										{...stylex.props(
											styles.iconWrap,
											styles[iconStyles[activityType]] || styles.iconPost,
										)}
									>
										<IconComponent size={18} />
									</div>
									<div {...stylex.props(styles.activityContent)}>
										<p {...stylex.props(styles.activityText)}>
											{activity.text}
											{activity.target && (
												<>
													:{" "}
													<span {...stylex.props(styles.activityTarget)}>
														{activity.target}
													</span>
												</>
											)}
										</p>
										<p {...stylex.props(styles.activityTime)}>
											{formatRelativeTime(activity.time)}
										</p>
									</div>
								</>
							);

							if (activity.targetHref) {
								return (
									<Link
										key={activity.id}
										href={activity.targetHref}
										{...stylex.props(styles.activityItem)}
									>
										{content}
									</Link>
								);
							}

							return (
								<div key={activity.id} {...stylex.props(styles.activityItem)}>
									{content}
								</div>
							);
						})}
					</div>
				) : (
					<div {...stylex.props(styles.emptyState)}>
						<FileText size={48} />
						<p {...stylex.props(styles.emptyText)}>활동 내역이 없습니다</p>
					</div>
				)}

				{(cursor || nextHref) && (
					<div {...stylex.props(styles.pagination)}>
						{cursor ? (
							<Link
								href={resetHref}
								{...stylex.props(
									styles.paginationButton,
									styles.paginationSecondary,
								)}
							>
								최신 보기
							</Link>
						) : (
							<span {...stylex.props(styles.spacer)} />
						)}
						{nextHref ? (
							<Link href={nextHref} {...stylex.props(styles.paginationButton)}>
								다음 활동 보기
							</Link>
						) : (
							<span {...stylex.props(styles.spacer)} />
						)}
					</div>
				)}
			</div>

			<Footer />
		</div>
	);
}
