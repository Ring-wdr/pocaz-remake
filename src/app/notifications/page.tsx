import * as stylex from "@stylexjs/stylex";
import { Footer } from "@/components/home";
import { MarkAllReadButton } from "@/components/notifications/mark-all-read-button";
import { NotificationList } from "@/components/notifications/notification-list";
import { FixedPageHeader } from "@/components/ui";
import { createMetadata } from "@/lib/metadata";
import { colors, spacing } from "../global-tokens.stylex";

export const metadata = createMetadata({
	title: "알림 | POCAZ",
	description: "댓글, 좋아요, 거래, 채팅 소식을 한곳에서 확인하세요.",
	path: "/notifications",
	ogTitle: "Notifications",
});

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: colors.bgPrimary,
	},
	content: {
		flex: 1,
		paddingTop: spacing.xxs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		paddingBottom: spacing.lg,
	},
});

export default function NotificationsPage() {
	return (
		<div {...stylex.props(styles.container)}>
			<FixedPageHeader title="알림" trailing={<MarkAllReadButton />} />
			<div {...stylex.props(styles.content)}>
				<NotificationList />
			</div>
			<Footer />
		</div>
	);
}
