import * as stylex from "@stylexjs/stylex";
import { AlertTriangle, ArrowLeft, Heart, MessageCircle } from "lucide-react";
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
	title: "좋아요한 글 | POCAZ",
	description: "좋아요한 커뮤니티 게시글을 다시 찾아보세요.",
	path: "/mypage/likes",
	ogTitle: "Liked Posts",
});

const PAGE_SIZE = 20;

type SortOption = "likedAt" | "popular" | "recent";

const SORT_OPTIONS: SortOption[] = ["likedAt", "popular", "recent"];

const sortLabels: Record<SortOption, string> = {
	likedAt: "좋아요한 순",
	popular: "인기순",
	recent: "최신순",
};

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
	sortRow: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: spacing.xs,
	},
	helpText: {
		margin: 0,
		fontSize: fontSize.sm,
		color: colors.textMuted,
	},
	sortTabs: {
		display: "flex",
		gap: spacing.xxxs,
	},
	sortTab: {
		paddingTop: spacing.xxxs,
		paddingBottom: spacing.xxxs,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		fontSize: fontSize.sm,
		fontWeight: fontWeight.medium,
		color: colors.textMuted,
		backgroundColor: colors.bgSecondary,
		borderWidth: 0,
		borderRadius: radius.sm,
		textDecoration: "none",
	},
	sortTabActive: {
		color: colors.textInverse,
		backgroundColor: colors.bgInverse,
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

const buildHref = (params: { cursor?: string | null; sort?: SortOption }) => {
	const urlParams = new URLSearchParams();
	urlParams.set("limit", `${PAGE_SIZE}`);
	if (params.cursor) {
		urlParams.set("cursor", params.cursor);
	}
	if (params.sort && params.sort !== "likedAt") {
		urlParams.set("sort", params.sort);
	}

	const qs = urlParams.toString();
	return qs ? `/mypage/likes?${qs}` : "/mypage/likes";
};

export default async function LikesPage({
	searchParams,
}: PageProps<"/mypage/likes">) {
	const { cursor, limit, sort } = await searchParams;
	const cursorParam = typeof cursor === "string" ? cursor : undefined;
	const limitParam = typeof limit === "string" ? limit : `${PAGE_SIZE}`;
	const sortParam = (typeof sort === "string" && ["likedAt", "popular", "recent"].includes(sort)
		? sort
		: "likedAt") as SortOption;

	const query: Record<string, string> = { limit: limitParam, sort: sortParam };
	if (cursorParam) {
		query.cursor = cursorParam;
	}

	const { data, error } = await api.likes.me.get({ query });
	const likedPosts = data?.items ?? [];
	const hasMore = data?.hasMore ?? false;
	const nextCursor = data?.nextCursor ?? null;

	const nextHref =
		hasMore && nextCursor ? buildHref({ cursor: nextCursor, sort: sortParam }) : null;
	const resetHref = buildHref({ sort: sortParam });

	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<Link href="/mypage" {...stylex.props(styles.backButton)}>
					<ArrowLeft size={20} />
				</Link>
				<h1 {...stylex.props(styles.headerTitle)}>좋아요한 글</h1>
			</header>

			<div {...stylex.props(styles.content)}>
				<div {...stylex.props(styles.sortRow)}>
					<p {...stylex.props(styles.helpText)}>
						페이지당 {PAGE_SIZE}개씩 표시됩니다.
					</p>
					<div {...stylex.props(styles.sortTabs)}>
						{SORT_OPTIONS.map((option) => (
							<Link
								key={option}
								href={buildHref({ sort: option })}
								{...stylex.props(
									styles.sortTab,
									sortParam === option && styles.sortTabActive,
								)}
							>
								{sortLabels[option]}
							</Link>
						))}
					</div>
				</div>

				{error ? (
					<div {...stylex.props(styles.errorBox)}>
						<AlertTriangle size={24} color={colors.statusWarning} />
						<p {...stylex.props(styles.errorTitle)}>
							좋아요 목록을 불러오지 못했어요
						</p>
						<p {...stylex.props(styles.errorDesc)}>
							네트워크 상태를 확인한 뒤 다시 시도해주세요.
						</p>
					</div>
				) : likedPosts.length > 0 ? (
					<div {...stylex.props(styles.postList)}>
						{likedPosts.map((post) => (
							<Link
								key={post.id}
								href={`/community/posts/${post.id}`}
								{...stylex.props(styles.postItem)}
							>
								<p {...stylex.props(styles.postAuthor)}>
									{post.user.nickname}
								</p>
								<h3 {...stylex.props(styles.postTitle)}>{post.content}</h3>
								<div {...stylex.props(styles.postMeta)}>
									<span {...stylex.props(styles.postTime)}>
										{formatRelativeTime(sortParam === "likedAt" ? post.likedAt : post.createdAt)}
									</span>
									<div {...stylex.props(styles.postStats)}>
										<span {...stylex.props(styles.stat, styles.statLiked)}>
											<Heart size={14} fill="currentColor" />
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
						<Heart size={48} />
						<p {...stylex.props(styles.emptyText)}>좋아요한 글이 없습니다</p>
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
								처음 보기
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
