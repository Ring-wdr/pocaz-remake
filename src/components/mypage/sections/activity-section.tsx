import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { colors, fontWeight } from "@/app/global-tokens.stylex";
import { formatDateTime } from "@/utils/date";
import { api } from "@/utils/eden";

const styles = stylex.create({
	container: {
		marginBottom: "24px",
	},
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: "12px",
	},
	title: {
		fontSize: "16px",
		fontWeight: 700,
		color: colors.textSecondary,
		margin: 0,
	},
	moreLink: {
		fontSize: "13px",
		color: colors.textMuted,
		textDecoration: "none",
	},
	list: {},
	item: {
		display: "flex",
		alignItems: "center",
		gap: "12px",
		paddingTop: "12px",
		paddingBottom: "12px",
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderSecondary,
		textDecoration: "none",
		color: "inherit",
	},
	content: {
		flex: 1,
		minWidth: 0,
	},
	itemTitle: {
		fontSize: "14px",
		fontWeight: 500,
		color: colors.textSecondary,
		margin: 0,
		marginBottom: "4px",
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	meta: {
		fontSize: "12px",
		color: colors.textPlaceholder,
		margin: 0,
	},
	badge: {
		paddingTop: "4px",
		paddingBottom: "4px",
		paddingLeft: "8px",
		paddingRight: "8px",
		fontSize: "11px",
		fontWeight: 600,
		borderRadius: "4px",
		flexShrink: 0,
	},
	badgePost: {
		color: colors.accentPrimary,
		backgroundColor: colors.accentPrimaryBg,
	},
	badgeLike: {
		color: colors.statusError,
		backgroundColor: colors.statusErrorBg,
	},
	badgeComment: {
		color: colors.statusSuccess,
		backgroundColor: colors.statusSuccessBg,
	},
	badgeTrade: {
		color: colors.statusWarning,
		backgroundColor: colors.statusWarningBg,
	},
	badgeMarket: {
		color: colors.textSecondary,
		backgroundColor: colors.bgTertiary,
		fontWeight: fontWeight.semibold,
	},
	emptyState: {
		textAlign: "center",
		paddingTop: "32px",
		paddingBottom: "32px",
		color: colors.textPlaceholder,
	},
	emptyText: {
		fontSize: "14px",
		margin: 0,
	},
});

type ActivityType = "post" | "like" | "comment" | "trade" | "market";

const typeLabels: Record<ActivityType, string> = {
	post: "게시글",
	like: "좋아요",
	comment: "댓글",
	trade: "거래",
	market: "마켓",
};

const typeStyles: Record<ActivityType, keyof typeof styles> = {
	post: "badgePost",
	like: "badgeLike",
	comment: "badgeComment",
	trade: "badgeTrade",
	market: "badgeMarket",
};

export default async function ActivitySection() {
	const { data, error } = await api.users.me.activity.get({
		query: { limit: "5" },
	});
	const activities = !error && data ? data.items : [];

	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.header)}>
				<h3 {...stylex.props(styles.title)}>최근 활동</h3>
				<Link href="/mypage/activity" {...stylex.props(styles.moreLink)}>
					전체보기
				</Link>
			</div>
			{activities.length === 0 ? (
				<div {...stylex.props(styles.emptyState)}>
					<p {...stylex.props(styles.emptyText)}>아직 활동 내역이 없습니다</p>
				</div>
			) : (
				<div {...stylex.props(styles.list)}>
					{activities.map((activity) => {
						const activityType = (activity.type as ActivityType) ?? "post";
						const badgeStyle = styles[typeStyles[activityType]];
						const content = (
							<>
								<div {...stylex.props(styles.content)}>
									<h4 {...stylex.props(styles.itemTitle)}>
										{activity.text}
										{activity.target ? ` · ${activity.target}` : ""}
									</h4>
									<p {...stylex.props(styles.meta)}>
										{formatDateTime(activity.time)}
									</p>
								</div>
								<span {...stylex.props(styles.badge, badgeStyle)}>
									{typeLabels[activityType]}
								</span>
							</>
						);

						if (activity.targetHref) {
							return (
								<Link
									key={activity.id}
									href={activity.targetHref}
									{...stylex.props(styles.item)}
								>
									{content}
								</Link>
							);
						}

						return (
							<div key={activity.id} {...stylex.props(styles.item)}>
								{content}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
