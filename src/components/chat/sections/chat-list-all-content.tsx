"use client";

import * as stylex from "@stylexjs/stylex";
import { Suspense } from "@suspensive/react";
import { SuspenseInfiniteQuery } from "@suspensive/react-query-5";
import {
	Filter,
	MessageCircleHeart,
	Search,
	ShoppingBag,
	X,
} from "lucide-react";
import { useDeferredValue, useRef, useState } from "react";
import { useDebounceValue } from "usehooks-ts";

import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import { ChatListSkeleton } from "@/components/chat/skeletons";
import { QueryErrorBoundary } from "@/components/providers/query-error-boundary";
import { chatListAllInfiniteQueryOptions } from "@/lib/queries/markets";
import { ChatListClientView } from "./chat-list-section.client";

const styles = stylex.create({
	errorContainer: {
		marginBottom: spacing.sm,
		paddingTop: spacing.md,
		paddingBottom: spacing.md,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
		borderLeftWidth: 4,
		borderLeftStyle: "solid",
		borderLeftColor: colors.statusError,
	},
	errorTitle: {
		margin: 0,
		marginBottom: spacing.xxxs,
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
	},
	errorDesc: {
		margin: 0,
		fontSize: fontSize.sm,
		color: colors.textMuted,
	},
	searchBar: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxs,
		paddingTop: spacing.xxs,
		paddingBottom: spacing.xxs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		backgroundColor: colors.bgTertiary,
		borderRadius: radius.md,
	},
	searchIcon: {
		color: colors.textPlaceholder,
		flexShrink: 0,
	},
	searchInput: {
		flex: 1,
		fontSize: fontSize.md,
		backgroundColor: "transparent",
		borderWidth: 0,
		outline: "none",
		color: colors.textSecondary,
		"::placeholder": {
			color: colors.textPlaceholder,
		},
	},
	clearButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "24px",
		height: "24px",
		backgroundColor: colors.borderSecondary,
		borderRadius: radius.full,
		borderWidth: 0,
		cursor: "pointer",
		color: colors.textMuted,
	},
	filterTabs: {
		display: "flex",
		gap: spacing.xxs,
	},
	filterTab: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxxs,
		paddingTop: spacing.xxs,
		paddingBottom: spacing.xxs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		fontSize: fontSize.sm,
		fontWeight: fontWeight.medium,
		color: colors.textMuted,
		backgroundColor: colors.bgTertiary,
		borderRadius: radius.md,
		borderWidth: 0,
		cursor: "pointer",
	},
	filterTabActive: {
		color: colors.accentPrimary,
		backgroundColor: colors.accentPrimaryBg,
	},
	container: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.sm,
	},
});

interface ErrorFallbackProps {
	title: string;
	description?: string;
}

function ErrorFallback({ title, description }: ErrorFallbackProps) {
	return (
		<div {...stylex.props(styles.errorContainer)}>
			<p {...stylex.props(styles.errorTitle)}>{title}</p>
			{description && <p {...stylex.props(styles.errorDesc)}>{description}</p>}
		</div>
	);
}

type FilterType = "all" | "trading" | "general";

interface ChatListAllContentInnerProps {
	keyword: string;
	filter: FilterType;
}

function ChatListAllContentInner({
	keyword,
	filter,
}: ChatListAllContentInnerProps) {
	const loadMoreRef = useRef<HTMLDivElement>(null);

	return (
		<QueryErrorBoundary
			fallback={() => (
				<ErrorFallback
					title="채팅방을 불러오지 못했습니다"
					description="잠시 후 다시 시도해주세요"
				/>
			)}
		>
			<Suspense clientOnly fallback={<ChatListSkeleton showFilters />}>
				<SuspenseInfiniteQuery
					{...chatListAllInfiniteQueryOptions(
						keyword,
						filter !== "all" ? filter : undefined,
					)}
				>
					{({
						data: { pages },
						fetchNextPage,
						hasNextPage,
						isFetchingNextPage,
					}) => {
						const allRooms = pages.flatMap((page) => page.rooms);

						return (
							<ChatListClientView
								rooms={allRooms}
								isLoadingMore={isFetchingNextPage}
								hasMore={hasNextPage}
								loadMoreRef={loadMoreRef}
								onLoadMore={fetchNextPage}
							/>
						);
					}}
				</SuspenseInfiniteQuery>
			</Suspense>
		</QueryErrorBoundary>
	);
}

export function ChatListAllContent() {
	const [keyword, setKeyword] = useState("");
	const [filter, setFilter] = useState<FilterType>("all");
	const [debouncedKeyword] = useDebounceValue(keyword, 300);
	const deferredKeyword = useDeferredValue(debouncedKeyword);

	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.searchBar)}>
				<Search size={18} {...stylex.props(styles.searchIcon)} />
				<input
					type="text"
					placeholder="채팅방 검색"
					value={keyword}
					onChange={(e) => setKeyword(e.target.value)}
					{...stylex.props(styles.searchInput)}
				/>
				{keyword && (
					<button
						type="button"
						onClick={() => setKeyword("")}
						{...stylex.props(styles.clearButton)}
					>
						<X size={14} />
					</button>
				)}
			</div>

			<div {...stylex.props(styles.filterTabs)}>
				<button
					type="button"
					onClick={() => setFilter("all")}
					{...stylex.props(
						styles.filterTab,
						filter === "all" && styles.filterTabActive,
					)}
				>
					<Filter size={14} />
					전체
				</button>
				<button
					type="button"
					onClick={() => setFilter("trading")}
					{...stylex.props(
						styles.filterTab,
						filter === "trading" && styles.filterTabActive,
					)}
				>
					<ShoppingBag size={14} />
					거래
				</button>
				<button
					type="button"
					onClick={() => setFilter("general")}
					{...stylex.props(
						styles.filterTab,
						filter === "general" && styles.filterTabActive,
					)}
				>
					<MessageCircleHeart size={14} />
					일반
				</button>
			</div>
			<ChatListAllContentInner keyword={deferredKeyword} filter={filter} />
		</div>
	);
}
