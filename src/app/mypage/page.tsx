import * as stylex from "@stylexjs/stylex";
import { Footer } from "@/components/home";
import { MenuList } from "@/components/mypage";
import { MyPageContent } from "@/components/mypage/mypage-content";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { FixedPageHeader } from "@/components/ui";
import { createMetadata } from "@/lib/metadata";
import { colors, spacing } from "../global-tokens.stylex";

export const metadata = createMetadata({
	title: "마이페이지 | POCAZ",
	description: "프로필과 활동 통계, 설정 메뉴를 확인하세요.",
	path: "/mypage",
	ogTitle: "My Page",
});

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: colors.bgCanvas,
	},
	content: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		gap: spacing.sm,
		paddingTop: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		paddingBottom: spacing.lg,
	},
});

export default function MyPage() {
	return (
		<div {...stylex.props(styles.container)}>
			<FixedPageHeader title="마이페이지" trailing={<NotificationBell />} />
			<div {...stylex.props(styles.content)}>
				<MyPageContent />
				<MenuList />
			</div>
			<Footer />
		</div>
	);
}
