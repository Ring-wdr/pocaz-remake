import * as stylex from "@stylexjs/stylex";
import { ArrowLeft, FileText, Heart, MessageCircle, Store } from "lucide-react";
import Link from "next/link";
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

interface Activity {
	id: number;
	type: "post" | "like" | "comment" | "trade";
	text: string;
	target: string;
	targetHref: string;
	time: string;
}

// TODO: Replace with actual API data
const activities: Activity[] = [
	{
		id: 1,
		type: "post",
		text: "새 게시글을 작성했습니다",
		target: "르세라핌 포카 양도합니다",
		targetHref: "/community/1",
		time: "10분 전",
	},
	{
		id: 2,
		type: "like",
		text: "게시글에 좋아요를 눌렀습니다",
		target: "뉴진스 버니 포카 구해요",
		targetHref: "/community/2",
		time: "1시간 전",
	},
	{
		id: 3,
		type: "comment",
		text: "댓글을 작성했습니다",
		target: "에스파 윈터 포카 판매",
		targetHref: "/community/3",
		time: "2시간 전",
	},
	{
		id: 4,
		type: "trade",
		text: "거래를 완료했습니다",
		target: "아이브 원영 포카",
		targetHref: "/market/1",
		time: "1일 전",
	},
	{
		id: 5,
		type: "post",
		text: "장터에 상품을 등록했습니다",
		target: "BTS 지민 시즌그리팅 포카",
		targetHref: "/market/2",
		time: "2일 전",
	},
];

const iconStyles: Record<Activity["type"], keyof typeof styles> = {
	post: "iconPost",
	like: "iconLike",
	comment: "iconComment",
	trade: "iconTrade",
};

const IconComponents: Record<Activity["type"], typeof FileText> = {
	post: FileText,
	like: Heart,
	comment: MessageCircle,
	trade: Store,
};

export default function ActivityPage() {
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
							const IconComponent = IconComponents[activity.type];
							return (
								<Link
									key={activity.id}
									href={activity.targetHref}
									{...stylex.props(styles.activityItem)}
								>
									<div
										{...stylex.props(
											styles.iconWrap,
											styles[iconStyles[activity.type]],
										)}
									>
										<IconComponent size={18} />
									</div>
									<div {...stylex.props(styles.activityContent)}>
										<p {...stylex.props(styles.activityText)}>
											{activity.text}:{" "}
											<span {...stylex.props(styles.activityTarget)}>
												{activity.target}
											</span>
										</p>
										<p {...stylex.props(styles.activityTime)}>
											{activity.time}
										</p>
									</div>
								</Link>
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
