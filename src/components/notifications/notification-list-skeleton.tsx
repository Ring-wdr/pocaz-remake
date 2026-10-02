import * as stylex from "@stylexjs/stylex";
import { spacing } from "@/app/global-tokens.stylex";
import { Skeleton } from "@/components/ui";

/** 자리표시 행의 key. 개수가 고정이라 순서가 바뀌지 않는다 */
const SKELETON_ROW_KEYS = ["row-1", "row-2", "row-3", "row-4", "row-5"];

const styles = stylex.create({
	list: {
		display: "flex",
		flexDirection: "column",
	},
	row: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
	},
	content: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		gap: spacing.xxs,
	},
});

/**
 * 알림 목록을 불러오는 동안 보여 주는 자리표시. 항목(아이콘, 제목, 본문)의 모양과 높이를 맞춘다.
 */
export function NotificationListSkeleton() {
	return (
		<div aria-busy="true" {...stylex.props(styles.list)}>
			{SKELETON_ROW_KEYS.map((key) => (
				<div key={key} {...stylex.props(styles.row)}>
					<Skeleton variant="circular" width={40} height={40} />
					<div {...stylex.props(styles.content)}>
						<Skeleton variant="text" width="60%" height={16} />
						<Skeleton variant="text" width="85%" height={14} />
					</div>
				</div>
			))}
		</div>
	);
}
