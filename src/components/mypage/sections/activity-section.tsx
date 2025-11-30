import * as stylex from "@stylexjs/stylex";
import dayjs from "dayjs";
import Link from "next/link";
import { colors } from "@/app/global-tokens.stylex";

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
	thumbnail: {
		width: "48px",
		height: "48px",
		borderRadius: "8px",
		objectFit: "cover",
		backgroundColor: colors.bgTertiary,
		flexShrink: 0,
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
	badgeSell: {
		color: colors.accentPrimary,
		backgroundColor: colors.accentPrimaryBg,
	},
	badgeBuy: {
		color: colors.statusError,
		backgroundColor: colors.statusErrorBg,
	},
	badgeComplete: {
		color: colors.statusSuccess,
		backgroundColor: colors.statusSuccessBg,
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

interface Activity {
	id: number;
	type: "sell" | "buy" | "complete";
	title: string;
	date: string;
	thumbnail?: string;
}

// TODO: Replace with actual API call
async function getRecentActivity(): Promise<Activity[]> {
	// Simulate delay
	await new Promise((resolve) => setTimeout(resolve, 400));

	// Placeholder data
	return [
		{
			id: 1,
			type: "sell",
			title: "르세라핌 김채원 UNFORGIVEN 포카",
			date: "2024-01-15T10:30:00",
			thumbnail: "https://placehold.co/96x96/fef3c7/d97706?text=1",
		},
		{
			id: 2,
			type: "complete",
			title: "뉴진스 하니 OMG 포카",
			date: "2024-01-14T15:20:00",
			thumbnail: "https://placehold.co/96x96/d1fae5/059669?text=2",
		},
		{
			id: 3,
			type: "buy",
			title: "아이브 장원영 ELEVEN 포카",
			date: "2024-01-13T09:00:00",
			thumbnail: "https://placehold.co/96x96/dbeafe/2563eb?text=3",
		},
		{
			id: 4,
			type: "sell",
			title: "에스파 카리나 MY WORLD 포카",
			date: "2024-01-12T18:45:00",
			thumbnail: "https://placehold.co/96x96/fce7f3/db2777?text=4",
		},
	];
}

const typeLabels: Record<Activity["type"], string> = {
	sell: "판매중",
	buy: "구매중",
	complete: "거래완료",
};

const typeStyles: Record<Activity["type"], keyof typeof styles> = {
	sell: "badgeSell",
	buy: "badgeBuy",
	complete: "badgeComplete",
};

export default async function ActivitySection() {
	const activities = await getRecentActivity();

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
					{activities.map((activity) => (
						<Link
							key={activity.id}
							href={`/market/${activity.id}`}
							{...stylex.props(styles.item)}
						>
							{activity.thumbnail && (
								<img
									src={activity.thumbnail}
									alt=""
									{...stylex.props(styles.thumbnail)}
								/>
							)}
							<div {...stylex.props(styles.content)}>
								<h4 {...stylex.props(styles.itemTitle)}>{activity.title}</h4>
								<p {...stylex.props(styles.meta)}>
									{dayjs(activity.date).format("MM.DD HH:mm")}
								</p>
							</div>
							<span
								{...stylex.props(styles.badge, styles[typeStyles[activity.type]])}
							>
								{typeLabels[activity.type]}
							</span>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
