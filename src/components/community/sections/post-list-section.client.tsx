"use client";

import * as stylex from "@stylexjs/stylex";
import dayjs from "dayjs";
import {
	AlertCircle,
	ChevronDown,
	FileText,
	Heart,
	Loader2,
	MessageCircle,
	RefreshCw,
	Search,
	X,
} from "lucide-react";
import Link from "next/link";
import {
	startTransition,
	useActionState,
	useDeferredValue,
	useEffect,
	useMemo,
	useState,
} from "react";

import {
	colors,
	fontSize,
	fontWeight,
	iconSize,
	radius,
	size,
	spacing,
} from "@/app/global-tokens.stylex";

import { loadPostsAction } from "./load-posts-action";
import type { PostCategory, PostListState } from "./types";

const styles = stylex.create({
	container: {
		marginBottom: spacing.sm,
	},
	searchContainer: {
		marginBottom: spacing.sm,
	},
	searchInputWrapper: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxs,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
	},
	searchIcon: {
		color: colors.textPlaceholder,
		flexShrink: 0,
	},
	searchInput: {
		flex: 1,
		backgroundColor: "transparent",
		borderWidth: 0,
		fontSize: fontSize.md,
		color: colors.textPrimary,
		outline: "none",
	},
	clearButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		paddingTop: "4px",
		paddingBottom: "4px",
		paddingLeft: "4px",
		paddingRight: "4px",
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
		color: colors.textMuted,
	},
	sortContainer: {
		display: "flex",
		justifyContent: "flex-end",
		marginBottom: spacing.xs,
	},
	sortButton: {
		display: "flex",
		alignItems: "center",
		gap: "4px",
		paddingTop: spacing.xxxs,
		paddingBottom: spacing.xxxs,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		backgroundColor: "transparent",
		borderWidth: 0,
		fontSize: fontSize.sm,
		color: colors.textMuted,
		cursor: "pointer",
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
	errorState: {
		textAlign: "center",
		paddingTop: spacing.xl,
		paddingBottom: spacing.xl,
		color: colors.statusError,
	},
	errorIcon: {
		marginBottom: spacing.xs,
	},
	errorText: {
		fontSize: fontSize.md,
		margin: 0,
		marginBottom: spacing.sm,
		color: colors.textSecondary,
	},
	retryButton: {
		display: "inline-flex",
		alignItems: "center",
		gap: spacing.xxxs,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		backgroundColor: colors.bgInverse,
		color: colors.textInverse,
		borderWidth: 0,
		borderRadius: radius.sm,
		fontSize: fontSize.md,
		fontWeight: fontWeight.medium,
		cursor: "pointer",
	},
	loadMoreButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.xxs,
		width: "100%",
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		marginTop: spacing.xs,
		backgroundColor: "transparent",
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		borderRadius: radius.md,
		cursor: "pointer",
		color: colors.textMuted,
		fontSize: fontSize.md,
	},
	loadMoreButtonDisabled: {
		opacity: 0.6,
		cursor: "not-allowed",
	},
	searchResultInfo: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
		marginBottom: spacing.xs,
	},
	skeletonList: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.sm,
		paddingTop: spacing.sm,
	},
	skeletonItem: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
	},
	skeletonThumb: {
		width: size.avatarLg,
		height: size.avatarLg,
		borderRadius: radius.sm,
		backgroundColor: colors.bgSecondary,
	},
	skeletonLines: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		gap: spacing.xxs,
	},
	skeletonLine: {
		height: "12px",
		borderRadius: radius.xs,
		backgroundColor: colors.bgSecondary,
	},
	skeletonLineWide: {
		width: "80%",
	},
	skeletonLineNarrow: {
		width: "60%",
	},
});

interface PostListSectionClientProps {
	initialState: PostListState;
	category?: PostCategory;
	limit: number;
}

export function PostListSectionClient({
	initialState,
	category,
	limit,
}: PostListSectionClientProps) {
	const [searchKeyword, setSearchKeyword] = useState(initialState.keyword);
	const deferredKeyword = useDeferredValue(searchKeyword);

	const [state, formAction, pending] = useActionState<PostListState, FormData>(
		loadPostsAction,
		initialState,
	);

	useEffect(() => {
		if (deferredKeyword === state.keyword) return;
		const formData = new FormData();
		formData.set("keyword", deferredKeyword);
		formData.set("category", category ?? "");
		formData.set("limit", limit.toString());
		startTransition(() => {
			formAction(formData);
		});
	}, [deferredKeyword, state.keyword, category, limit, formAction]);

	const handleLoadMore = () => {
		if (!state.nextCursor) return;
		const formData = new FormData();
		formData.set("cursor", state.nextCursor);
		formData.set("keyword", state.keyword);
		formData.set("category", category ?? "");
		formData.set("limit", limit.toString());
		startTransition(() => {
			formAction(formData);
		});
	};

	const handleRetry = () => {
		const formData = new FormData();
		formData.set("keyword", state.keyword);
		formData.set("category", category ?? "");
		formData.set("limit", limit.toString());
		formAction(formData);
	};

	const handleClearSearch = () => {
		setSearchKeyword("");
	};

	const skeletonList = useMemo(
		() => (
			<div {...stylex.props(styles.skeletonList)}>
				{Array.from({ length: 5 }).map((_, index) => (
					<div key={index} {...stylex.props(styles.skeletonItem)}>
						<div {...stylex.props(styles.skeletonThumb)} />
						<div {...stylex.props(styles.skeletonLines)}>
							<div
								{...stylex.props(styles.skeletonLine, styles.skeletonLineWide)}
							/>
							<div
								{...stylex.props(styles.skeletonLine, styles.skeletonLineNarrow)}
							/>
						</div>
					</div>
				))}
			</div>
		),
		[],
	);

	const showListSkeleton =
		pending &&
		(state.items.length === 0 || deferredKeyword !== state.keyword) &&
		!state.error;

	const hasPosts = state.items.length > 0;
	const hasKeyword = !!state.keyword;

	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.searchContainer)}>
				<div {...stylex.props(styles.searchInputWrapper)}>
					<Search size={18} {...stylex.props(styles.searchIcon)} />
					<input
						type="text"
						placeholder="게시글 검색..."
						value={searchKeyword}
						onChange={(event) => setSearchKeyword(event.target.value)}
						{...stylex.props(styles.searchInput)}
					/>
					{searchKeyword && (
						<button
							type="button"
							onClick={handleClearSearch}
							{...stylex.props(styles.clearButton)}
						>
							<X size={16} />
						</button>
					)}
				</div>
			</div>

			{hasKeyword && (
				<p {...stylex.props(styles.searchResultInfo)}>
					&quot;{state.keyword}&quot; 검색 결과 {state.items.length}개
					{pending && " 불러오는 중..."}
				</p>
			)}

			{state.error ? (
				<div {...stylex.props(styles.errorState)}>
					<AlertCircle size={28} {...stylex.props(styles.errorIcon)} />
					<p {...stylex.props(styles.errorText)}>
						{state.error ?? "게시글을 불러올 수 없습니다"}
					</p>
					<button
						type="button"
						onClick={handleRetry}
						{...stylex.props(styles.retryButton)}
					>
						<RefreshCw size={16} />
						다시 시도
					</button>
				</div>
			) : showListSkeleton ? (
				skeletonList
			) : !hasPosts ? (
				<div {...stylex.props(styles.emptyState)}>
					<FileText size={28} {...stylex.props(styles.emptyIcon)} />
					<p {...stylex.props(styles.emptyText)}>
						{hasKeyword ? "검색 결과가 없습니다" : "게시글이 없습니다"}
					</p>
				</div>
			) : (
				<>
					{state.items.map((post) => (
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

					{state.hasMore && (
						<button
							type="button"
							onClick={handleLoadMore}
							disabled={pending || !state.nextCursor}
							{...stylex.props(
								styles.loadMoreButton,
								(pending || !state.nextCursor) && styles.loadMoreButtonDisabled,
							)}
						>
							{pending ? (
								<Loader2 size={16} className="animate-spin" />
							) : (
								<>
									<span>더보기</span>
									<ChevronDown size={16} />
								</>
							)}
						</button>
					)}
				</>
			)}
		</div>
	);
}
