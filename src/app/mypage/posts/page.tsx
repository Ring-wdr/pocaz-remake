import * as stylex from "@stylexjs/stylex";
import { AlertTriangle, ArrowLeft, FileText, Heart, MessageCircle } from "lucide-react";
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
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
	title: "내 게시글 | POCAZ",
	description: "작성한 커뮤니티 글과 반응을 확인하세요.",
	path: "/mypage/posts",
	ogTitle: "My Posts",
});

const PAGE_SIZE = 20;

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
		display: "flex",
		flexDirection: "column",
		gap: spacing.sm,
	},
	helpText: {
		margin: 0,
		fontSize: fontSize.sm,
		color: colors.textMuted,
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
	errorBox: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		paddingTop: spacing.md,
		paddingBottom: spacing.md,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
		gap: spacing.xxxs,
	},
	errorTitle: {
		margin: 0,
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
	},
	errorDesc: {
		margin: 0,
		fontSize: fontSize.sm,
		color: colors.textMuted,
		textAlign: "center",
	},
	pagination: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: spacing.xs,
	},
	paginationButton: {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.xxxs,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderRadius: radius.sm,
		backgroundColor: colors.bgInverse,
		color: colors.textInverse,
		fontSize: fontSize.sm,
		fontWeight: fontWeight.semibold,
		textDecoration: "none",
	},
	paginationSecondary: {
		backgroundColor: colors.bgSecondary,
		color: colors.textSecondary,
	},
	spacer: {
		flex: 1,
	},
});

const buildHref = (params: { cursor?: string | null }) => {
	const urlParams = new URLSearchParams();
	urlParams.set("limit", `${PAGE_SIZE}`);
	if (params.cursor) {
		urlParams.set("cursor", params.cursor);
	}

	const qs = urlParams.toString();
	return qs ? `/mypage/posts?${qs}` : "/mypage/posts";
};

export default async function PostsPage({
	searchParams,
}: PageProps<"/mypage/posts">) {
	const { cursor, limit } = await searchParams;
	const cursorParam = typeof cursor === "string" ? cursor : undefined;
	const limitParam = typeof limit === "string" ? limit : `${PAGE_SIZE}`;

	const query: Record<string, string> = { limit: limitParam };
	if (cursorParam) {
		query.cursor = cursorParam;
	}

	const { data, error } = await api.users.me.posts.get({ query });
	const posts = data?.items ?? [];
	const hasMore = data?.hasMore ?? false;
	const nextCursor = data?.nextCursor ?? null;

	const nextHref =
		hasMore && nextCursor ? buildHref({ cursor: nextCursor }) : null;
	const resetHref = buildHref({});

	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<Link href="/mypage" {...stylex.props(styles.backButton)}>
					<ArrowLeft size={20} />
				</Link>
				<h1 {...stylex.props(styles.headerTitle)}>작성한 글</h1>
			</header>

			<div {...stylex.props(styles.content)}>
				<p {...stylex.props(styles.helpText)}>
					최신 순으로 정렬되며, 페이지당 {PAGE_SIZE}개씩 표시됩니다.
				</p>

				{error ? (
					<div {...stylex.props(styles.errorBox)}>
						<AlertTriangle size={24} color={colors.statusWarning} />
						<p {...stylex.props(styles.errorTitle)}>
							게시글을 불러오지 못했어요
						</p>
						<p {...stylex.props(styles.errorDesc)}>
							네트워크 상태를 확인한 뒤 다시 시도해주세요.
						</p>
					</div>
				) : posts.length > 0 ? (
					<div {...stylex.props(styles.postList)}>
						{posts.map((post) => (
							<Link
								key={post.id}
								href={`/community/posts/${post.id}`}
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

				{(cursor || nextHref) && (
					<div {...stylex.props(styles.pagination)}>
						{cursor ? (
							<Link
								href={resetHref}
								{...stylex.props(
									styles.paginationButton,
									styles.paginationSecondary,
								)}
							>
								최신 보기
							</Link>
						) : (
							<span {...stylex.props(styles.spacer)} />
						)}
						{nextHref ? (
							<Link href={nextHref} {...stylex.props(styles.paginationButton)}>
								다음 글 보기
							</Link>
						) : (
							<span {...stylex.props(styles.spacer)} />
						)}
					</div>
				)}
			</div>

			<Footer />
		</div>
	);
}
