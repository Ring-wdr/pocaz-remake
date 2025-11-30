import * as stylex from "@stylexjs/stylex";
import { ArrowLeft, FileText, Heart, MessageCircle } from "lucide-react";
import Link from "next/link";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import { Footer } from "@/components/home";
import { formatRelativeTime } from "@/utils/date";
import { api } from "@/utils/eden";

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
	postCategory: {
		fontSize: fontSize.sm,
		color: colors.accentPrimary,
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

export default async function PostsPage() {
	const { data, error } = await api.users.me.posts.get();
	const posts = !error && data ? data.items : [];
	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<Link href="/mypage" {...stylex.props(styles.backButton)}>
					<ArrowLeft size={20} />
				</Link>
				<h1 {...stylex.props(styles.headerTitle)}>작성한 글</h1>
			</header>

			<div {...stylex.props(styles.content)}>
				{posts.length > 0 ? (
					<div {...stylex.props(styles.postList)}>
						{posts.map((post) => (
							<Link
								key={post.id}
								href={`/community/${post.id}`}
								{...stylex.props(styles.postItem)}
							>
								<h3 {...stylex.props(styles.postTitle)}>
									{post.content.slice(0, 30)}
									{post.content.length > 30 ? "..." : ""}
								</h3>
								<p {...stylex.props(styles.postContent)}>{post.content}</p>
								<div {...stylex.props(styles.postMeta)}>
									<span {...stylex.props(styles.postTime)}>
										{formatRelativeTime(post.createdAt)}
									</span>
									<div {...stylex.props(styles.postStats)}>
										<span {...stylex.props(styles.stat)}>
											<Heart size={14} />
											{post.likeCount}
										</span>
										<span {...stylex.props(styles.stat)}>
											<MessageCircle size={14} />
											{post.replyCount}
										</span>
									</div>
								</div>
							</Link>
						))}
					</div>
				) : (
					<div {...stylex.props(styles.emptyState)}>
						<FileText size={48} />
						<p {...stylex.props(styles.emptyText)}>작성한 글이 없습니다</p>
					</div>
				)}
			</div>

			<Footer />
		</div>
	);
}
