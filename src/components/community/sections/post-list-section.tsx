import * as stylex from "@stylexjs/stylex";
import dayjs from "dayjs";
import { Eye, FileText, MessageCircle } from "lucide-react";
import Link from "next/link";

import { colors, fontSize, fontWeight, iconSize, radius, size, spacing } from "@/app/global-tokens.stylex";

const styles = stylex.create({
	container: {
		marginBottom: spacing.sm,
	},
	item: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
		textDecoration: "none",
		color: "inherit",
	},
	thumbnail: {
		width: size.avatarLg,
		height: size.avatarLg,
		borderRadius: radius.sm,
		objectFit: "cover",
		flexShrink: 0,
		backgroundColor: colors.bgTertiary,
	},
	content: {
		flex: 1,
		minWidth: 0,
	},
	categoryBadge: {
		display: "inline-block",
		fontSize: "11px",
		fontWeight: fontWeight.semibold,
		color: colors.textMuted,
		backgroundColor: colors.bgTertiary,
		paddingTop: "2px",
		paddingBottom: "2px",
		paddingLeft: spacing.xxxs,
		paddingRight: spacing.xxxs,
		borderRadius: radius.xs,
		marginBottom: spacing.xxxs,
	},
	title: {
		fontSize: "15px",
		fontWeight: fontWeight.medium,
		color: colors.textSecondary,
		margin: 0,
		marginBottom: spacing.xxxs,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	meta: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxs,
		fontSize: fontSize.sm,
		color: colors.textPlaceholder,
	},
	metaItem: {
		display: "flex",
		alignItems: "center",
		gap: "2px",
	},
	metaIcon: {
		fontSize: fontSize.sm,
	},
	emptyState: {
		textAlign: "center",
		paddingTop: spacing.xl,
		paddingBottom: spacing.xl,
		color: colors.textPlaceholder,
	},
	emptyIcon: {
		fontSize: iconSize.xl,
		marginBottom: spacing.xs,
	},
	emptyText: {
		fontSize: fontSize.md,
		margin: 0,
	},
});

export interface CommunityPost {
	id: number;
	categoryId: number;
	categoryName: string;
	title: string;
	author: string;
	createdAt: string;
	viewCount: number;
	commentCount: number;
	likeCount: number;
	thumbnail?: string;
}

// TODO: Replace with actual API call
async function getCommunityPosts(
	category?: string,
): Promise<CommunityPost[]> {
	// Simulate delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	// Placeholder data
	const allPosts: CommunityPost[] = [
		{
			id: 1,
			categoryId: 1,
			categoryName: "자유게시판",
			title: "오늘 포카 득템했어요! 정말 기분 좋네요 ㅎㅎ",
			author: "포카덕후",
			createdAt: "2024-01-15T10:30:00",
			viewCount: 234,
			commentCount: 12,
			likeCount: 45,
			thumbnail: "https://placehold.co/128x128/fef3c7/d97706?text=1",
		},
		{
			id: 2,
			categoryId: 2,
			categoryName: "포카 자랑",
			title: "르세라핌 앨범 다 모았습니다!!",
			author: "르피즈",
			createdAt: "2024-01-15T09:15:00",
			viewCount: 567,
			commentCount: 34,
			likeCount: 128,
			thumbnail: "https://placehold.co/128x128/fce7f3/db2777?text=2",
		},
		{
			id: 3,
			categoryId: 3,
			categoryName: "정보 공유",
			title: "포카 보관 팁 공유해요 (습기 조심!)",
			author: "포카마스터",
			createdAt: "2024-01-14T18:45:00",
			viewCount: 892,
			commentCount: 56,
			likeCount: 201,
		},
		{
			id: 4,
			categoryId: 1,
			categoryName: "자유게시판",
			title: "다들 포카 몇 장 정도 모으셨어요?",
			author: "뉴비에요",
			createdAt: "2024-01-14T15:20:00",
			viewCount: 445,
			commentCount: 78,
			likeCount: 23,
		},
		{
			id: 5,
			categoryId: 2,
			categoryName: "포카 자랑",
			title: "뉴진스 하니 직찍 포카 득템 자랑!",
			author: "버니즈",
			createdAt: "2024-01-14T12:00:00",
			viewCount: 1203,
			commentCount: 89,
			likeCount: 345,
			thumbnail: "https://placehold.co/128x128/dbeafe/2563eb?text=3",
		},
		{
			id: 6,
			categoryId: 3,
			categoryName: "정보 공유",
			title: "이번 달 팬싸 일정 정리했어요",
			author: "일정봇",
			createdAt: "2024-01-13T20:30:00",
			viewCount: 2341,
			commentCount: 45,
			likeCount: 567,
		},
	];

	if (category) {
		const categoryMap: Record<string, number> = {
			free: 1,
			boast: 2,
			info: 3,
		};
		const categoryId = categoryMap[category];
		return allPosts.filter((post) => post.categoryId === categoryId);
	}

	return allPosts;
}

interface PostListSectionProps {
	category?: string;
}

export default async function PostListSection({
	category,
}: PostListSectionProps) {
	const posts = await getCommunityPosts(category);

	if (posts.length === 0) {
		return (
			<div {...stylex.props(styles.emptyState)}>
				<FileText size={28} {...stylex.props(styles.emptyIcon)} />
				<p {...stylex.props(styles.emptyText)}>게시글이 없습니다</p>
			</div>
		);
	}

	return (
		<div {...stylex.props(styles.container)}>
			{posts.map((post) => (
				<Link
					key={post.id}
					href={`/community/${post.categoryId}/${post.id}`}
					{...stylex.props(styles.item)}
				>
					{post.thumbnail && (
						<img
							src={post.thumbnail}
							alt=""
							{...stylex.props(styles.thumbnail)}
						/>
					)}
					<div {...stylex.props(styles.content)}>
						<span {...stylex.props(styles.categoryBadge)}>
							{post.categoryName}
						</span>
						<h3 {...stylex.props(styles.title)}>{post.title}</h3>
						<div {...stylex.props(styles.meta)}>
							<span>{post.author}</span>
							<span>·</span>
							<span>{dayjs(post.createdAt).format("MM.DD")}</span>
							<span {...stylex.props(styles.metaItem)}>
								<Eye size={12} />
								{post.viewCount}
							</span>
							<span {...stylex.props(styles.metaItem)}>
								<MessageCircle size={12} />
								{post.commentCount}
							</span>
						</div>
					</div>
				</Link>
			))}
		</div>
	);
}
