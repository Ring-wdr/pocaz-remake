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
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

import {
	colors,
	fontSize,
	fontWeight,
	iconSize,
	radius,
	size,
	spacing,
} from "@/app/global-tokens.stylex";
import { api } from "@/utils/eden";

type PostCategory = "free" | "boast" | "info";

interface PostItem {
	id: string;
	content: string;
	createdAt: string;
	user: {
		id: string;
		nickname: string;
		profileImage: string | null;
	};
	images: { id: string; imageUrl: string }[];
	replyCount: number;
	likeCount: number;
}

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
		padding: "4px",
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
	loadingSpinner: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		paddingTop: spacing.lg,
		paddingBottom: spacing.lg,
	},
	searchResultInfo: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
		marginBottom: spacing.xs,
	},
});

export default function PostListSection() {
	const pathname = usePathname();
	const [posts, setPosts] = useState<PostItem[]>([]);
	const [nextCursor, setNextCursor] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [searchKeyword, setSearchKeyword] = useState("");
	const [debouncedKeyword, setDebouncedKeyword] = useState("");
	const [isPending, startTransition] = useTransition();

	// pathname에서 카테고리 추출
	const getCategory = useCallback((): PostCategory | undefined => {
		if (pathname === "/community") return undefined;
		const match = pathname.match(/^\/community\/(free|boast|info)$/);
		return match ? (match[1] as PostCategory) : undefined;
	}, [pathname]);

	const category = getCategory();

	// 검색어 디바운스
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedKeyword(searchKeyword);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchKeyword]);

	// 게시글 가져오기
	const fetchPosts = useCallback(
		async (cursor?: string, isRefresh = false) => {
			if (isRefresh) {
				setIsLoading(true);
			}
			setIsError(false);

			try {
				let result: {
					items: PostItem[];
					nextCursor: string | null;
					hasMore: boolean;
				};

				if (debouncedKeyword) {
					// 검색 API 사용
					const { data, error } = await api.posts.search.get({
						query: {
							keyword: debouncedKeyword,
							cursor,
							limit: "20",
						},
					});

					if (error || !data) {
						throw new Error("검색 실패");
					}
					result = data;
				} else {
					// 일반 목록 API 사용
					const { data, error } = await api.posts.get({
						query: {
							limit: "20",
							category,
							cursor,
						},
					});

					if (error || !data) {
						throw new Error("목록 조회 실패");
					}
					result = data;
				}

				if (cursor && !isRefresh) {
					setPosts((prev) => [...prev, ...result.items]);
				} else {
					setPosts(result.items);
				}
				setNextCursor(result.nextCursor);
				setHasMore(result.hasMore);
			} catch {
				setIsError(true);
			} finally {
				setIsLoading(false);
			}
		},
		[category, debouncedKeyword],
	);

	// 초기 로드 및 카테고리/검색어 변경 시 리프레시
	useEffect(() => {
		fetchPosts(undefined, true);
	}, [fetchPosts]);

	const handleLoadMore = () => {
		if (nextCursor && !isPending) {
			startTransition(() => {
				fetchPosts(nextCursor);
			});
		}
	};

	const handleRetry = () => {
		fetchPosts(undefined, true);
	};

	const handleClearSearch = () => {
		setSearchKeyword("");
	};

	// 로딩 상태
	if (isLoading) {
		return (
			<div {...stylex.props(styles.loadingSpinner)}>
				<Loader2 size={24} className="animate-spin" />
			</div>
		);
	}

	// 에러 상태
	if (isError) {
		return (
			<div {...stylex.props(styles.errorState)}>
				<AlertCircle size={28} {...stylex.props(styles.errorIcon)} />
				<p {...stylex.props(styles.errorText)}>게시글을 불러올 수 없습니다</p>
				<button
					type="button"
					onClick={handleRetry}
					{...stylex.props(styles.retryButton)}
				>
					<RefreshCw size={16} />
					다시 시도
				</button>
			</div>
		);
	}

	return (
		<div {...stylex.props(styles.container)}>
			{/* 검색 입력 */}
			<div {...stylex.props(styles.searchContainer)}>
				<div {...stylex.props(styles.searchInputWrapper)}>
					<Search size={18} {...stylex.props(styles.searchIcon)} />
					<input
						type="text"
						placeholder="게시글 검색..."
						value={searchKeyword}
						onChange={(e) => setSearchKeyword(e.target.value)}
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

			{/* 검색 결과 정보 */}
			{debouncedKeyword && (
				<p {...stylex.props(styles.searchResultInfo)}>
					&quot;{debouncedKeyword}&quot; 검색 결과 {posts.length}개
				</p>
			)}

			{/* 빈 상태 */}
			{posts.length === 0 ? (
				<div {...stylex.props(styles.emptyState)}>
					<FileText size={28} {...stylex.props(styles.emptyIcon)} />
					<p {...stylex.props(styles.emptyText)}>
						{debouncedKeyword
							? "검색 결과가 없습니다"
							: "게시글이 없습니다"}
					</p>
				</div>
			) : (
				<>
					{/* 게시글 목록 */}
					{posts.map((post) => (
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

					{/* 더보기 버튼 */}
					{hasMore && (
						<button
							type="button"
							onClick={handleLoadMore}
							disabled={isPending}
							{...stylex.props(
								styles.loadMoreButton,
								isPending && styles.loadMoreButtonDisabled,
							)}
						>
							{isPending ? (
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
