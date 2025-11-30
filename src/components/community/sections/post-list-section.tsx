import * as stylex from "@stylexjs/stylex";
import dayjs from "dayjs";
import { FileText, Heart, MessageCircle } from "lucide-react";
import Link from "next/link";

import { colors, fontSize, fontWeight, iconSize, radius, size, spacing } from "@/app/global-tokens.stylex";
import { api } from "@/utils/eden";

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
	postContent: {
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

export default async function PostListSection() {
	const { data, error } = await api.posts.get({ query: { limit: "20" } });

	if (error || !data) {
		return (
			<div {...stylex.props(styles.emptyState)}>
				<FileText size={28} {...stylex.props(styles.emptyIcon)} />
				<p {...stylex.props(styles.emptyText)}>게시글을 불러올 수 없습니다</p>
			</div>
		);
	}

	if (data.items.length === 0) {
		return (
			<div {...stylex.props(styles.emptyState)}>
				<FileText size={28} {...stylex.props(styles.emptyIcon)} />
				<p {...stylex.props(styles.emptyText)}>게시글이 없습니다</p>
			</div>
		);
	}

	return (
		<div {...stylex.props(styles.container)}>
			{data.items.map((post) => (
				<Link
					key={post.id}
					href={`/community/posts/${post.id}`}
					{...stylex.props(styles.item)}
				>
					{post.images[0] && (
						<img
							src={post.images[0].imageUrl}
							alt=""
							{...stylex.props(styles.thumbnail)}
						/>
					)}
					<div {...stylex.props(styles.content)}>
						<p {...stylex.props(styles.postContent)}>{post.content}</p>
						<div {...stylex.props(styles.meta)}>
							<span>{post.user.nickname}</span>
							<span>·</span>
							<span>{dayjs(post.createdAt).format("MM.DD")}</span>
							<span {...stylex.props(styles.metaItem)}>
								<MessageCircle size={12} />
								{post.replyCount}
							</span>
							<span {...stylex.props(styles.metaItem)}>
								<Heart size={12} />
								{post.likeCount}
							</span>
						</div>
					</div>
				</Link>
			))}
		</div>
	);
}
