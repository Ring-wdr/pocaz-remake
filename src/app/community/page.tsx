import * as stylex from "@stylexjs/stylex";
import { Suspense } from "react";

import { PageHeader } from "@/components/community";
import {
	CategoryTabsSection,
	PostListSection,
} from "@/components/community/sections";
import { PostListSkeleton } from "@/components/community/skeletons";
import { Footer } from "@/components/home";

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: "#fff",
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
				<Suspense fallback={<PostListSkeleton />}>
					<PostListSection />
				</Suspense>
			</div>
			<Footer />
		</div>
	);
}
