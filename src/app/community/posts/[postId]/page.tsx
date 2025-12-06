import type { Metadata } from "next";
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
import { createMetadata } from "@/lib/metadata";
import { api } from "@/utils/eden";

import { CommentsSection } from "./comments-section";
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
	},
	statItem: {
		display: "flex",
		alignItems: "center",
		gap: "4px",
		fontSize: fontSize.md,
		color: colors.textMuted,
	},
});

async function getPost(postId: string) {
	const { data, error } = await api.posts({ id: postId }).get();
	if (error || !data) {
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

function buildSummary(content: string) {
	const trimmed = content.trim();
	const maxLength = 90;
	if (!trimmed) return "포카즈 커뮤니티 게시글 상세";
	return trimmed.length > maxLength
		? `${trimmed.slice(0, maxLength)}...`
		: trimmed;
}

export async function generateMetadata({
	params,
}: PageProps<"/community/posts/[postId]">): Promise<Metadata> {
	const { postId } = await params;
	const post = await getPost(postId);

	if (!post) {
		return createMetadata({
			title: "게시글을 찾을 수 없습니다 | POCAZ",
			description: "요청한 커뮤니티 게시글 정보를 불러올 수 없습니다.",
			path: `/community/posts/${postId}`,
			ogTitle: "Community Post",
			type: "article",
		});
	}

	const summary = buildSummary(post.content);
	return createMetadata({
		title: `${post.user.nickname}의 게시글 | POCAZ 커뮤니티`,
		description: summary,
		path: `/community/posts/${postId}`,
		ogTitle: summary,
		type: "article",
	});
}

export default async function PostDetailPage({
	params,
}: PageProps<"/community/posts/[postId]">) {
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
						isLoggedIn={!!currentUser}
					/>
					<span {...stylex.props(styles.statItem)}>
						<MessageCircle size={18} />
						<span>{post.commentCount}</span>
					</span>
				</div>

				{/* 댓글 섹션 - 서버 컴포넌트에서 초기 데이터 fetch */}
				<CommentsSection
					postId={postId}
					isLoggedIn={!!currentUser}
					currentUserId={currentUser?.id}
				/>
			</div>
		</div>
	);
}
