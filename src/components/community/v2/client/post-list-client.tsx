"use client";

import * as stylex from "@stylexjs/stylex";
import dayjs from "dayjs";
import {
	AlertCircle,
	ChevronDown,
	FileText,
	Heart,
	MessageCircle,
	RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import {
	colors,
	fontSize,
	fontWeight,
	iconSize,
	lineHeight,
	radius,
	size,
	spacing,
} from "@/app/global-tokens.stylex";
import { SearchBar } from "@/components/ui";
import { getPostList } from "../data/get-post-list";
import type { PostCategory, PostListItem, PostListState } from "../types";
import LoadMoreSpinner from "./load-more-spinner";

const styles = stylex.create({
	container: {
		marginBottom: spacing.sm,
	},
	searchContainer: {
		marginBottom: spacing.sm,
	},
	searchActions: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		marginTop: spacing.xxs,
	},
	searchButton: {
		paddingTop: spacing.xxxs,
		paddingBottom: spacing.xxxs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		backgroundColor: colors.bgInverse,
		color: colors.textInverse,
		borderWidth: 0,
		borderRadius: radius.sm,
		fontSize: fontSize.sm,
	fontWeight: fontWeight.medium,
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
		lineHeight: lineHeight.normal,
	},
	loadMoreButtonDisabled: {
		opacity: 0.6,
		cursor: "not-allowed",
	},
	loadMoreContent: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxs,
		minHeight: `calc(${fontSize.md} * ${lineHeight.normal})`,
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
		height: `calc(15px * ${lineHeight.normal})`,
		borderRadius: radius.xs,
		backgroundColor: colors.bgSecondary,
	},
	skeletonLineWide: {
		width: "95%",
	},
	skeletonLineNarrow: {
		width: "70%",
		height: `calc(${fontSize.sm} * ${lineHeight.normal})`,
	},
});

interface PostListSectionClientProps {
	initialState: PostListState;
	category?: PostCategory;
	limit: number;
}

const skeletonList = (
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
);

function mergeItems(existing: PostListItem[], incoming: PostListItem[]) {
	const map = new Map<string, PostListItem>();
	existing.forEach((item) => {
		map.set(item.id, item);
	});
	incoming.forEach((item) => {
		map.set(item.id, item);
	});
	return Array.from(map.values());
}

export default function PostListClient({
	initialState,
	category,
	limit,
}: PostListSectionClientProps) {
	const [state, setState] = useState<PostListState>(initialState);
	const [searchKeyword, setSearchKeyword] = useState(initialState.keyword);
	const [isPending, startTransition] = useTransition();

	const hasPosts = state.items.length > 0;
	const hasKeyword = !!state.keyword;

	const showListSkeleton =
		isPending && state.items.length === 0 && !state.error;

	const replaceList = (keyword: string) => {
		startTransition(async () => {
			const { data, error } = await getPostList({
				category,
				keyword,
				cursor: null,
				limit,
			});

			if (error || !data) {
				setState((prev) => ({
					...prev,
					items: [],
					nextCursor: null,
					hasMore: false,
					keyword,
					error: error ?? "게시글을 불러올 수 없습니다",
				}));
				return;
			}

			setState({
				items: data.items,
				nextCursor: data.nextCursor,
				hasMore: data.hasMore,
				keyword,
				error: null,
			});
		});
	};

	const appendList = () => {
		if (!state.nextCursor || isPending) return;

		startTransition(async () => {
			const { data, error } = await getPostList({
				category,
				keyword: state.keyword,
				cursor: state.nextCursor,
				limit,
			});

			if (error || !data) {
				setState((prev) => ({
					...prev,
					error: "게시글을 더 불러오지 못했습니다. 다시 시도해 주세요.",
				}));
				return;
			}

			setState((prev) => ({
				items: mergeItems(prev.items, data.items),
				nextCursor: data.nextCursor,
				hasMore: data.hasMore,
				keyword: prev.keyword,
				error: null,
			}));
		});
	};

	const handleRetry = () => replaceList(state.keyword);

	const handleSearchSubmit = () => replaceList(searchKeyword.trim());

	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.searchContainer)}>
				<SearchBar
					value={searchKeyword}
					onChange={setSearchKeyword}
					placeholder="게시글 검색..."
					onSearch={handleSearchSubmit}
				/>
			</div>

			{hasKeyword && (
				<p {...stylex.props(styles.searchResultInfo)}>
					&quot;{state.keyword}&quot; 검색 결과 {state.items.length}개
					{isPending && " 불러오는 중..."}
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
							onClick={appendList}
							disabled={isPending || !state.nextCursor}
							{...stylex.props(
								styles.loadMoreButton,
								(isPending || !state.nextCursor) &&
									styles.loadMoreButtonDisabled,
							)}
						>
							{isPending ? (
								<div {...stylex.props(styles.loadMoreContent)}>
									<LoadMoreSpinner size={16} />
								</div>
							) : (
								<div {...stylex.props(styles.loadMoreContent)}>
									<span>더보기</span>
									<ChevronDown size={16} />
								</div>
							)}
						</button>
					)}
				</>
			)}
		</div>
	);
}
