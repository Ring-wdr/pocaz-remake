import * as stylex from "@stylexjs/stylex";
import dayjs from "dayjs";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

import {
	colors,
	fontSize,
	fontWeight,
	spacing,
} from "@/app/global-tokens.stylex";
import { api } from "@/utils/eden";
import { layoutStyles } from "../layout-constants.stylex";

const styles = stylex.create({
	boardWrap: {
		marginBottom: spacing.md,
	},
	sectionButton: {
		display: "flex",
		alignItems: "center",
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
	boardList: {
		minHeight: "110px", // 5 items * ~22px each
	},
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
	emptyState: {
		height: "110px",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.bgSecondary,
		color: colors.textMuted,
		fontSize: fontSize.md,
		borderRadius: "8px",
	},
});

interface Post {
	id: string;
	content: string;
	createdAt: string;
}

async function getRecentPosts(): Promise<Post[]> {
	const { data, error } = await api.posts.get({
		query: { limit: "5" },
		fetch: { next: { revalidate: 120 } },
	});

	if (error || !data) {
		return [];
	}

	return data.items;
}

export default async function RecentPostsSection() {
	const posts = await getRecentPosts();

	return (
		<div {...stylex.props(styles.boardWrap, layoutStyles.recentPostsMinHeight)}>
			<Link href="/community" {...stylex.props(styles.sectionButton)}>
				최근 게시물
				<ChevronRight size={24} />
			</Link>
			<div {...stylex.props(styles.boardList)}>
				{posts.length === 0 ? (
					<div {...stylex.props(styles.emptyState)}>아직 게시물이 없어요</div>
				) : (
					<ul {...stylex.props(styles.boardListUl)}>
						{posts.map((post) => {
							const days = dayjs(post.createdAt).format("YYYY-MM-DD");
							const title =
								post.content.length > 30
									? `${post.content.slice(0, 30)}...`
									: post.content;
							return (
								<li key={post.id} {...stylex.props(styles.boardListItem)}>
									<Link
										href={`/community/posts/${post.id}`}
										{...stylex.props(styles.boardItemButton)}
									>
										<h4 {...stylex.props(styles.boardItemTitle)}>{title}</h4>
										<time {...stylex.props(styles.boardItemTime)}>{days}</time>
									</Link>
								</li>
							);
						})}
					</ul>
				)}
			</div>
		</div>
	);
}
