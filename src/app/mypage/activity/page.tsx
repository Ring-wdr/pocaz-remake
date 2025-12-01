import * as stylex from "@stylexjs/stylex";
import { ArrowLeft, FileText, Heart, MessageCircle, Store } from "lucide-react";
import Link from "next/link";
import { colors, fontSize, fontWeight, radius, spacing } from "@/app/global-tokens.stylex";
import { Footer } from "@/components/home";
import { formatRelativeTime } from "@/utils/date";
import { api } from "@/utils/eden";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
	title: "활동 내역 | POCAZ",
	description: "게시글, 좋아요, 거래 활동을 시간순으로 확인하세요.",
	path: "/mypage/activity",
	ogTitle: "Activity",
});

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
});

type ActivityType = "post" | "like" | "comment" | "trade" | "market";

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

export default async function ActivityPage() {
	const { data, error } = await api.users.me.activity.get();
	const activities = !error && data ? data.items : [];
	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<Link href="/mypage" {...stylex.props(styles.backButton)}>
					<ArrowLeft size={20} />
				</Link>
				<h1 {...stylex.props(styles.headerTitle)}>활동 내역</h1>
			</header>

			<div {...stylex.props(styles.content)}>
				{activities.length > 0 ? (
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
								<div
									key={activity.id}
									{...stylex.props(styles.activityItem)}
								>
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
			</div>

			<Footer />
		</div>
	);
}
