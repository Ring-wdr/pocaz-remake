import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import { formatDateTime } from "@/utils/date";
import { mypageStyles } from "../mypage-styles.stylex";

const styles = stylex.create({
	content: {
		flex: 1,
		minWidth: 0,
	},
	itemTitle: {
		margin: 0,
		marginBottom: spacing.xxxs,
		fontSize: fontSize.md,
		fontWeight: fontWeight.medium,
		color: colors.textSecondary,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	meta: {
		margin: 0,
		fontSize: fontSize.sm,
		color: colors.textMuted,
	},
	badge: {
		flexShrink: 0,
		paddingTop: spacing.xxxs,
		paddingBottom: spacing.xxxs,
		paddingLeft: spacing.xxs,
		paddingRight: spacing.xxs,
		fontSize: fontSize.sm,
		fontWeight: fontWeight.semibold,
		borderRadius: radius.xs,
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
	},
	emptyState: {
		paddingTop: spacing.lg,
		paddingBottom: spacing.lg,
		textAlign: "center",
	},
	emptyText: {
		margin: 0,
		fontSize: fontSize.md,
		color: colors.textMuted,
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

const typeStyles = {
	post: "badgePost",
	like: "badgeLike",
	comment: "badgeComment",
	trade: "badgeTrade",
	market: "badgeMarket",
} as const satisfies Record<ActivityType, keyof typeof styles>;

interface Activity {
	id: string;
	text: string;
	target?: string | null;
	targetHref?: string | null;
	type: string;
	time: string;
}

interface ActivitySectionProps {
	activities: Activity[];
}

const isActivityType = (type: string): type is ActivityType =>
	type in typeLabels;

export function ActivitySection({ activities }: ActivitySectionProps) {
	return (
		<section {...stylex.props(mypageStyles.section)}>
			<div {...stylex.props(mypageStyles.sectionHeader)}>
				<h3 {...stylex.props(mypageStyles.sectionTitle)}>최근 활동</h3>
				<Link href="/mypage/activity" {...stylex.props(mypageStyles.moreLink)}>
					전체보기
				</Link>
			</div>
			<div {...stylex.props(mypageStyles.card)}>
				{activities.length === 0 ? (
					<div {...stylex.props(styles.emptyState)}>
						<p {...stylex.props(styles.emptyText)}>아직 활동 내역이 없습니다</p>
					</div>
				) : (
					activities.map((activity) => {
						const activityType = isActivityType(activity.type)
							? activity.type
							: "post";
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
									{...stylex.props(mypageStyles.row, mypageStyles.interactive)}
								>
									{content}
								</Link>
							);
						}

						return (
							<div key={activity.id} {...stylex.props(mypageStyles.row)}>
								{content}
							</div>
						);
					})
				)}
			</div>
		</section>
	);
}
