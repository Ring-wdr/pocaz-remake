import * as stylex from "@stylexjs/stylex";
import dayjs from "dayjs";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { colors, fontSize, fontWeight, spacing } from "@/app/global-tokens.stylex";

const styles = stylex.create({
	boardWrap: {
		marginBottom: spacing.md,
	},
	sectionButton: {
		display: "flex",
		marginBottom: spacing.sm,
		fontSize: fontSize.xl,
		fontWeight: fontWeight.extrabold,
		backgroundColor: "transparent",
		borderWidth: 0,
		padding: 0,
		cursor: "pointer",
		color: colors.textPrimary,
		textDecoration: "none",
	},
	boardList: {},
	boardListUl: {
		listStyle: "none",
		margin: 0,
		padding: 0,
	},
	boardListItem: {},
	boardItemButton: {
		display: "flex",
		justifyContent: "space-between",
		width: "100%",
		marginBottom: spacing.xxxs,
		cursor: "pointer",
		backgroundColor: "transparent",
		borderWidth: 0,
		padding: 0,
		textDecoration: "none",
	},
	boardItemTitle: {
		marginRight: spacing.sm,
		fontSize: fontSize.md,
		fontWeight: fontWeight.normal,
		whiteSpace: "nowrap",
		textOverflow: "ellipsis",
		overflow: "hidden",
		color: colors.textPrimary,
		margin: 0,
	},
	boardItemTime: {
		fontSize: fontSize.md,
		fontWeight: fontWeight.normal,
		color: colors.textPrimary,
	},
});

interface Post {
	id: number;
	title: string;
	createAt: string;
}

// TODO: Replace with actual API call
async function getRecentPosts(): Promise<Post[]> {
	// 실제 API 연동 시:
	// const response = await fetch('/api/posts/recent', { next: { revalidate: 60 } });
	// return response.json();

	// Placeholder data
	return [
		{ id: 1, title: "르세라핌 김채원 포카 양도합니다", createAt: "2024-01-15" },
		{ id: 2, title: "뉴진스 하니 OMG 포카 구해요", createAt: "2024-01-14" },
		{ id: 3, title: "아이브 장원영 포카 교환 원해요", createAt: "2024-01-13" },
		{ id: 4, title: "에스파 카리나 MY WORLD 포카 팝니다", createAt: "2024-01-12" },
		{ id: 5, title: "세븐틴 민규 FML 앨범 포카 양도", createAt: "2024-01-11" },
	];
}

export default async function RecentPostsSection() {
	const posts = await getRecentPosts();

	return (
		<div {...stylex.props(styles.boardWrap)}>
			<Link href="/community" {...stylex.props(styles.sectionButton)}>
				최근 게시물
				<ChevronRight size={24} />
			</Link>
			<div {...stylex.props(styles.boardList)}>
				<ul {...stylex.props(styles.boardListUl)}>
					{posts.slice(0, 5).map((post) => {
						const days = dayjs(post.createAt).format("YYYY-MM-DD");
						return (
							<li key={post.id} {...stylex.props(styles.boardListItem)}>
								<Link
									href={`/community/1/${post.id}`}
									{...stylex.props(styles.boardItemButton)}
								>
									<h4 {...stylex.props(styles.boardItemTitle)}>{post.title}</h4>
									<time {...stylex.props(styles.boardItemTime)}>{days}</time>
								</Link>
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
}
