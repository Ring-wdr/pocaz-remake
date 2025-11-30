import * as stylex from "@stylexjs/stylex";
import { ArrowLeft, Heart, MessageCircle } from "lucide-react";
import Link from "next/link";
import { colors, fontSize, fontWeight, radius, spacing } from "@/app/global-tokens.stylex";
import { Footer } from "@/components/home";

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: colors.bgPrimary,
	},
	header: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
	},
	backButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "36px",
		height: "36px",
		color: colors.textSecondary,
		backgroundColor: "transparent",
		borderWidth: 0,
		borderRadius: radius.sm,
		cursor: "pointer",
		textDecoration: "none",
	},
	headerTitle: {
		flex: 1,
		fontSize: fontSize.lg,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
		margin: 0,
	},
	content: {
		flex: 1,
		paddingTop: spacing.md,
		paddingBottom: spacing.md,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
	},
	postList: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xs,
	},
	postItem: {
		display: "flex",
		flexDirection: "column",
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
		textDecoration: "none",
		color: "inherit",
	},
	postAuthor: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
		margin: 0,
		marginBottom: spacing.xxxs,
	},
	postTitle: {
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
		margin: 0,
		marginBottom: spacing.xxs,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	postContent: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
		margin: 0,
		marginBottom: spacing.xs,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	postMeta: {
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
	},
	postTime: {
		fontSize: fontSize.sm,
		color: colors.textPlaceholder,
		margin: 0,
	},
	postStats: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		marginLeft: "auto",
	},
	stat: {
		display: "flex",
		alignItems: "center",
		gap: "2px",
		fontSize: fontSize.sm,
		color: colors.textMuted,
	},
	statLiked: {
		color: colors.statusError,
	},
	emptyState: {
		textAlign: "center",
		paddingTop: spacing.xl,
		paddingBottom: spacing.xl,
		color: colors.textPlaceholder,
	},
	emptyText: {
		fontSize: fontSize.md,
		margin: 0,
		marginTop: spacing.xs,
	},
});

interface LikedPost {
	id: number;
	author: string;
	title: string;
	content: string;
	time: string;
	likes: number;
	comments: number;
	href: string;
}

// TODO: Replace with actual API data
const likedPosts: LikedPost[] = [
	{
		id: 1,
		author: "포카덕후",
		title: "뉴진스 버니 포카 구해요",
		content: "민지, 해린 버니 포카 구합니다. DM 주세요!",
		time: "30분 전",
		likes: 12,
		comments: 5,
		href: "/community/1",
	},
	{
		id: 2,
		author: "아이돌팬",
		title: "에스파 윈터 포카 판매합니다",
		content: "미공개 포카 정리합니다. 상태 최상급",
		time: "2시간 전",
		likes: 45,
		comments: 18,
		href: "/community/2",
	},
	{
		id: 3,
		author: "덕질러",
		title: "오늘의 포카 득템 후기",
		content: "드디어 최애 포카 구했어요!! 너무 행복해요",
		time: "1일 전",
		likes: 234,
		comments: 67,
		href: "/community/3",
	},
];

export default function LikesPage() {
	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<Link href="/mypage" {...stylex.props(styles.backButton)}>
					<ArrowLeft size={20} />
				</Link>
				<h1 {...stylex.props(styles.headerTitle)}>좋아요한 글</h1>
			</header>

			<div {...stylex.props(styles.content)}>
				{likedPosts.length > 0 ? (
					<div {...stylex.props(styles.postList)}>
						{likedPosts.map((post) => (
							<Link
								key={post.id}
								href={post.href}
								{...stylex.props(styles.postItem)}
							>
								<p {...stylex.props(styles.postAuthor)}>{post.author}</p>
								<h3 {...stylex.props(styles.postTitle)}>{post.title}</h3>
								<p {...stylex.props(styles.postContent)}>{post.content}</p>
								<div {...stylex.props(styles.postMeta)}>
									<span {...stylex.props(styles.postTime)}>{post.time}</span>
									<div {...stylex.props(styles.postStats)}>
										<span {...stylex.props(styles.stat, styles.statLiked)}>
											<Heart size={14} fill="currentColor" />
											{post.likes}
										</span>
										<span {...stylex.props(styles.stat)}>
											<MessageCircle size={14} />
											{post.comments}
										</span>
									</div>
								</div>
							</Link>
						))}
					</div>
				) : (
					<div {...stylex.props(styles.emptyState)}>
						<Heart size={48} />
						<p {...stylex.props(styles.emptyText)}>좋아요한 글이 없습니다</p>
					</div>
				)}
			</div>

			<Footer />
		</div>
	);
}
