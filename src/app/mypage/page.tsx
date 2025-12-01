import * as stylex from "@stylexjs/stylex";
import { unauthorized } from "next/navigation";
import { Suspense } from "react";
import { Footer } from "@/components/home";
import { MenuList } from "@/components/mypage";
import {
	ActivitySection,
	ProfileSection,
	StatsSection,
} from "@/components/mypage/sections";
import {
	ActivitySkeleton,
	ProfileSkeleton,
	StatsSkeleton,
} from "@/components/mypage/skeletons";
import { getSession } from "@/lib/auth/actions";
import { createMetadata } from "@/lib/metadata";
import { colors } from "../global-tokens.stylex";

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
		backgroundColor: colors.bgPrimary,
	},
	content: {
		flex: 1,
		paddingTop: "20px",
		paddingLeft: "14px",
		paddingRight: "14px",
		paddingBottom: "24px",
	},
	pageTitle: {
		fontSize: "24px",
		fontWeight: 800,
		color: colors.textPrimary,
		margin: 0,
		marginBottom: "20px",
	},
});

export default async function MyPage() {
	const session = await getSession();

	if (!session) {
		unauthorized();
	}

	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.content)}>
				<h1 {...stylex.props(styles.pageTitle)}>마이페이지</h1>

				<Suspense fallback={<ProfileSkeleton />}>
					<ProfileSection />
				</Suspense>

				<Suspense fallback={<StatsSkeleton />}>
					<StatsSection />
				</Suspense>

				<Suspense fallback={<ActivitySkeleton />}>
					<ActivitySection />
				</Suspense>

				<MenuList />
			</div>
			<Footer />
		</div>
	);
}
