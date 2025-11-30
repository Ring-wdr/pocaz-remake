import * as stylex from "@stylexjs/stylex";
import dayjs from "dayjs";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
	colors,
	fontSize,
	fontWeight,
	lineHeight,
	radius,
	size,
	spacing,
} from "@/app/global-tokens.stylex";
import { getCurrentUser } from "@/lib/auth/actions";
import { api } from "@/utils/eden";

import { LikeButton, PostActions } from "./components";

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: colors.bgPrimary,
		minHeight: "100vh",
	},
	header: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
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
		width: size.touchTarget,
		height: size.touchTarget,
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
		color: colors.textPrimary,
	},
	headerTitle: {
		fontSize: fontSize.lg,
		fontWeight: fontWeight.bold,
		color: colors.textPrimary,
		margin: 0,
	},
	content: {
		flex: 1,
		paddingTop: spacing.md,
		paddingBottom: spacing.lg,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
	},
	authorSection: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		marginBottom: spacing.md,
	},
	avatar: {
		width: size.avatarMd,
		height: size.avatarMd,
		borderRadius: radius.full,
		objectFit: "cover",
		backgroundColor: colors.bgTertiary,
	},
	authorInfo: {
		flex: 1,
	},
	authorName: {
		fontSize: fontSize.base,
		fontWeight: fontWeight.semibold,
		color: colors.textPrimary,
		margin: 0,
	},
	postDate: {
		fontSize: fontSize.sm,
		color: colors.textPlaceholder,
		margin: 0,
	},
	postContent: {
		fontSize: fontSize.base,
		lineHeight: lineHeight.relaxed,
		color: colors.textSecondary,
		margin: 0,
		marginBottom: spacing.md,
		whiteSpace: "pre-wrap",
	},
	imageGrid: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xs,
		marginBottom: spacing.md,
	},
	postImage: {
		width: "100%",
		borderRadius: radius.md,
		objectFit: "cover",
	},
	statsSection: {
		display: "flex",
		alignItems: "center",
		gap: spacing.md,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		borderTopWidth: 1,
		borderTopStyle: "solid",
		borderTopColor: colors.borderPrimary,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
		marginBottom: spacing.md,
	},
	statItem: {
		display: "flex",
		alignItems: "center",
		gap: "4px",
		fontSize: fontSize.md,
		color: colors.textMuted,
	},
	repliesSection: {
		marginTop: spacing.md,
	},
	repliesTitle: {
		fontSize: fontSize.base,
		fontWeight: fontWeight.semibold,
		color: colors.textPrimary,
		margin: 0,
		marginBottom: spacing.sm,
	},
	replyItem: {
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
	},
	replyHeader: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxs,
		marginBottom: spacing.xxxs,
	},
	replyAvatar: {
		width: size.avatarSm,
		height: size.avatarSm,
		borderRadius: radius.full,
		objectFit: "cover",
		backgroundColor: colors.bgTertiary,
	},
	replyAuthor: {
		fontSize: fontSize.sm,
		fontWeight: fontWeight.medium,
		color: colors.textPrimary,
	},
	replyDate: {
		fontSize: fontSize.sm,
		color: colors.textPlaceholder,
	},
	replyContent: {
		fontSize: fontSize.md,
		lineHeight: lineHeight.normal,
		color: colors.textSecondary,
		margin: 0,
		paddingLeft: `calc(${size.avatarSm} + ${spacing.xxs})`,
	},
	emptyReplies: {
		textAlign: "center",
		paddingTop: spacing.lg,
		paddingBottom: spacing.lg,
		color: colors.textPlaceholder,
		fontSize: fontSize.md,
	},
});

async function getPost(postId: string) {
	const { data, error } = await api.posts({ id: postId }).get();
	if (error || !data || "error" in data) {
		return null;
	}
	return data;
}

async function getLikeStatus(postId: string) {
	try {
		const { data, error } = await api.likes.posts({ postId }).get();
		if (error || !data) {
			return { liked: false, count: 0 };
		}
		return data;
	} catch {
		return { liked: false, count: 0 };
	}
}

export default async function PostDetailPage({
	params,
}: {
	params: Promise<{ postId: string }>;
}) {
	const { postId } = await params;

	const [post, currentUser] = await Promise.all([
		getPost(postId),
		getCurrentUser(),
	]);

	if (!post) {
		notFound();
	}

	const likeStatus = currentUser ? await getLikeStatus(postId) : null;
	const isOwner = currentUser?.id === post.user.id;

	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<Link href="/community" {...stylex.props(styles.backButton)}>
					<ArrowLeft size={24} />
				</Link>
				<h1 {...stylex.props(styles.headerTitle)}>게시글</h1>
				<PostActions postId={postId} isOwner={isOwner} />
			</header>

			<div {...stylex.props(styles.content)}>
				<div {...stylex.props(styles.authorSection)}>
					{post.user.profileImage ? (
						<img
							src={post.user.profileImage}
							alt={post.user.nickname}
							{...stylex.props(styles.avatar)}
						/>
					) : (
						<div {...stylex.props(styles.avatar)} />
					)}
					<div {...stylex.props(styles.authorInfo)}>
						<p {...stylex.props(styles.authorName)}>{post.user.nickname}</p>
						<p {...stylex.props(styles.postDate)}>
							{dayjs(post.createdAt).format("YYYY.MM.DD HH:mm")}
						</p>
					</div>
				</div>

				<p {...stylex.props(styles.postContent)}>{post.content}</p>

				{post.images.length > 0 && (
					<div {...stylex.props(styles.imageGrid)}>
						{post.images.map((image) => (
							<img
								key={image.id}
								src={image.imageUrl}
								alt=""
								{...stylex.props(styles.postImage)}
							/>
						))}
					</div>
				)}

				<div {...stylex.props(styles.statsSection)}>
					<LikeButton
						postId={postId}
						initialLiked={likeStatus?.liked ?? false}
						initialCount={likeStatus?.count ?? post.likeCount}
					/>
					<span {...stylex.props(styles.statItem)}>
						<MessageCircle size={18} />
						<span>{post.replies.length}</span>
					</span>
				</div>

				<div {...stylex.props(styles.repliesSection)}>
					<h2 {...stylex.props(styles.repliesTitle)}>
						댓글 {post.replies.length}
					</h2>
					{post.replies.length === 0 ? (
						<p {...stylex.props(styles.emptyReplies)}>
							첫 번째 댓글을 남겨보세요
						</p>
					) : (
						post.replies.map((reply) => (
							<div key={reply.id} {...stylex.props(styles.replyItem)}>
								<div {...stylex.props(styles.replyHeader)}>
									{reply.user.profileImage ? (
										<img
											src={reply.user.profileImage}
											alt={reply.user.nickname}
											{...stylex.props(styles.replyAvatar)}
										/>
									) : (
										<div {...stylex.props(styles.replyAvatar)} />
									)}
									<span {...stylex.props(styles.replyAuthor)}>
										{reply.user.nickname}
									</span>
									<span {...stylex.props(styles.replyDate)}>
										· {dayjs(reply.createdAt).format("MM.DD HH:mm")}
									</span>
								</div>
								<p {...stylex.props(styles.replyContent)}>{reply.content}</p>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
