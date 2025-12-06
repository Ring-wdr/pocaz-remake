import * as stylex from "@stylexjs/stylex";

import { PageHeader } from "@/components/community";
import {
	CategoryTabsSection,
	PostListSection,
} from "@/components/community/sections";
import { Footer } from "@/components/home";
import { createMetadata } from "@/lib/metadata";
import { colors } from "../global-tokens.stylex";

export const metadata = createMetadata({
	title: "커뮤니티 | POCAZ",
	description: "자유게시판, 포카 자랑, 정보 공유 글을 둘러보세요.",
	path: "/community",
	ogTitle: "Community",
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
});

export default function CommunityPage() {
	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.content)}>
				<PageHeader />
				<CategoryTabsSection />
				<PostListSection />
			</div>
			<Footer />
		</div>
	);
}
