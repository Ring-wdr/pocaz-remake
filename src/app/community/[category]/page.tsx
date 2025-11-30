import * as stylex from "@stylexjs/stylex";
import { Suspense } from "react";

import { PageHeader } from "@/components/community";
import {
	CategoryTabsSection,
	PostListSection,
} from "@/components/community/sections";
import { PostListSkeleton } from "@/components/community/skeletons";
import { Footer } from "@/components/home";
import { colors } from "../../global-tokens.stylex";

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

interface CategoryPageProps {
	params: Promise<{
		category: string;
	}>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
	const { category } = await params;

	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.content)}>
				<PageHeader />
				<CategoryTabsSection />
				<Suspense fallback={<PostListSkeleton />}>
					<PostListSection category={category} />
				</Suspense>
			</div>
			<Footer />
		</div>
	);
}
