import * as stylex from "@stylexjs/stylex";
import { notFound } from "next/navigation";
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

const VALID_CATEGORIES = ["free", "boast", "info"] as const;
type PostCategory = (typeof VALID_CATEGORIES)[number];

export default async function CategoryPage({
	params,
}: {
	params: Promise<{ category: string }>;
}) {
	const { category } = await params;

	if (!VALID_CATEGORIES.includes(category as PostCategory)) {
		notFound();
	}

	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.content)}>
				<PageHeader />
				<CategoryTabsSection />
				<Suspense fallback={<PostListSkeleton />}>
					<PostListSection category={category as PostCategory} />
				</Suspense>
			</div>
			<Footer />
		</div>
	);
}
