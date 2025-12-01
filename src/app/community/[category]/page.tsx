import type { Metadata } from "next";
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
import { createMetadata } from "@/lib/metadata";
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

const CATEGORY_META: Record<PostCategory, { label: string; description: string }> =
	{
		free: {
			label: "자유게시판",
			description: "잡담과 소통을 나누는 포카즈 자유 게시판입니다.",
		},
		boast: {
			label: "포카 자랑",
			description: "소장 중인 포토카드를 자랑하고 공유해 보세요.",
		},
		info: {
			label: "정보 공유",
			description: "거래 팁과 정보를 나누는 커뮤니티 게시판입니다.",
		},
	};

export async function generateMetadata({
	params,
}: {
	params: Promise<{ category: string }>;
}): Promise<Metadata> {
	const { category } = await params;
	const meta = CATEGORY_META[category as PostCategory];

	if (!meta) {
		return createMetadata({
			title: "커뮤니티 | POCAZ",
			description: "카테고리를 찾을 수 없습니다.",
			path: `/community/${category}`,
			ogTitle: "Community",
		});
	}

	return createMetadata({
		title: `${meta.label} | POCAZ 커뮤니티`,
		description: meta.description,
		path: `/community/${category}`,
		ogTitle: meta.label,
	});
}

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
