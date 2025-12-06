"use client";

import * as stylex from "@stylexjs/stylex";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import {
	Filter,
	Loader2,
	MessageCircleHeart,
	Search,
	ShoppingBag,
	User,
	X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import type { ChatRoomListItem } from "@/types/entities";
import { api } from "@/utils/eden";

dayjs.extend(relativeTime);
dayjs.locale("ko");

const styles = stylex.create({
	container: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.sm,
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
	list: {},
	item: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderSecondary,
		textDecoration: "none",
		color: "inherit",
	},
	avatar: {
		position: "relative",
		width: "52px",
		height: "52px",
		flexShrink: 0,
	},
	avatarImage: {
		width: "100%",
		height: "100%",
		borderRadius: "26px",
		objectFit: "cover",
		backgroundColor: colors.bgTertiary,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	tradingBadge: {
		position: "absolute",
		bottom: "-2px",
		right: "-2px",
		width: "20px",
		height: "20px",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.accentPrimary,
		borderRadius: radius.full,
		borderWidth: 2,
		borderStyle: "solid",
		borderColor: colors.bgPrimary,
	},
	content: {
		flex: 1,
		minWidth: 0,
	},
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: spacing.xxxs,
	},
	nameWrap: {
		display: "flex",
		alignItems: "center",
		gap: "6px",
	},
	name: {
		fontSize: "15px",
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
		margin: 0,
	},
	memberCount: {
		fontSize: "11px",
		color: colors.textMuted,
		backgroundColor: colors.bgTertiary,
		paddingTop: "2px",
		paddingBottom: "2px",
		paddingLeft: "6px",
		paddingRight: "6px",
		borderRadius: radius.xs,
	},
	time: {
		fontSize: fontSize.sm,
		color: colors.textPlaceholder,
	},
	messageWrap: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxs,
	},
	message: {
		flex: 1,
		fontSize: fontSize.md,
		color: colors.textMuted,
		margin: 0,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	emptyState: {
		textAlign: "center",
		paddingTop: spacing.xxl,
		paddingBottom: spacing.xxl,
		color: colors.textPlaceholder,
	},
	emptyIcon: {
		fontSize: "56px",
		marginBottom: spacing.sm,
	},
	emptyTitle: {
		fontSize: fontSize.base,
		fontWeight: fontWeight.semibold,
		color: colors.textTertiary,
		margin: 0,
		marginBottom: spacing.xxs,
	},
	emptyText: {
		fontSize: fontSize.md,
		margin: 0,
	},
	loadingMore: {
		display: "flex",
		justifyContent: "center",
		paddingTop: spacing.md,
		paddingBottom: spacing.md,
	},
	spinner: {
		animationName: "spin",
		animationDuration: "1s",
		animationIterationCount: "infinite",
		animationTimingFunction: "linear",
	},
});

const spinKeyframes = stylex.keyframes({
	"0%": { transform: "rotate(0deg)" },
	"100%": { transform: "rotate(360deg)" },
});

const spinnerStyle = stylex.create({
	spinner: {
		animationName: spinKeyframes,
		animationDuration: "1s",
		animationIterationCount: "infinite",
		animationTimingFunction: "linear",
	},
});

type FilterType = "all" | "trading" | "general";

function formatTime(dateStr: string): string {
	const date = dayjs(dateStr);
	const now = dayjs();

	if (date.isSame(now, "day")) {
		return date.format("HH:mm");
	}
	if (date.isSame(now.subtract(1, "day"), "day")) {
		return "어제";
	}
	if (date.isSame(now, "year")) {
		return date.format("MM.DD");
	}
	return date.format("YY.MM.DD");
}

interface ChatListClientProps {
	initialRooms: ChatRoomListItem[];
	initialHasMore: boolean;
	initialCursor: string | null;
	marketId?: string;
}

export default function ChatListClient({
	initialRooms,
	initialHasMore,
	initialCursor,
	marketId,
}: ChatListClientProps) {
	const [rooms, setRooms] = useState(initialRooms);
	const [hasMore, setHasMore] = useState(initialHasMore);
	const [cursor, setCursor] = useState(initialCursor);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);

	const [searchQuery, setSearchQuery] = useState("");
	const [activeFilter, setActiveFilter] = useState<FilterType>("all");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	const loadMoreRef = useRef<HTMLDivElement>(null);
	const searchTimeoutRef = useRef<NodeJS.Timeout>(undefined);

	// 검색어 디바운스
	useEffect(() => {
		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}
		searchTimeoutRef.current = setTimeout(() => {
			setDebouncedSearch(searchQuery);
		}, 300);

		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
		};
	}, [searchQuery]);

	// 필터 또는 검색어 변경시 새로 로드
	const fetchRooms = useCallback(
		async (isLoadMore = false) => {
			if (isLoadMore) {
				setIsLoadingMore(true);
			} else {
				setIsLoading(true);
			}

			try {
				const { data, error } = marketId
					? await api.chat.rooms.market({ marketId }).get()
					: await api.chat.rooms.get({
							query: {
								search: debouncedSearch || undefined,
								filter: activeFilter !== "all" ? activeFilter : undefined,
								cursor: isLoadMore ? (cursor ?? undefined) : undefined,
								limit: "20",
							},
						});

				if (error || !data) {
					return;
				}

				const newRooms: ChatRoomListItem[] = data.rooms.map((room) => ({
					id: room.id,
					name: room.name,
					createdAt: room.createdAt,
					members: room.members,
					lastMessage: room.lastMessage,
					messageCount: room.messageCount,
					market: room.market,
				}));

				if (isLoadMore) {
					setRooms((prev) => [...prev, ...newRooms]);
				} else {
					setRooms(newRooms);
				}

				// 페이지네이션 정보 업데이트
				const paginatedData = data as {
					rooms: typeof data.rooms;
					hasMore?: boolean;
					nextCursor?: string | null;
				};
				if (
					"hasMore" in paginatedData &&
					typeof paginatedData.hasMore === "boolean"
				) {
					setHasMore(paginatedData.hasMore);
					setCursor(paginatedData.nextCursor ?? null);
				} else {
					setHasMore(false);
					setCursor(null);
				}
			} finally {
				setIsLoading(false);
				setIsLoadingMore(false);
			}
		},
		[debouncedSearch, activeFilter, cursor, marketId],
	);

	// 필터/검색 변경시 새로 로드
	useEffect(() => {
		if (!marketId) {
			fetchRooms(false);
		}
	}, [fetchRooms, marketId]);

	// 무한 스크롤 관찰
	useEffect(() => {
		if (!hasMore || isLoadingMore) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
					fetchRooms(true);
				}
			},
			{ threshold: 0.1 },
		);

		if (loadMoreRef.current) {
			observer.observe(loadMoreRef.current);
		}

		return () => observer.disconnect();
	}, [hasMore, isLoadingMore, fetchRooms]);

	const handleFilterChange = (filter: FilterType) => {
		setActiveFilter(filter);
		setCursor(null);
	};

	const clearSearch = () => {
		setSearchQuery("");
		setDebouncedSearch("");
	};

	if (isLoading && rooms.length === 0) {
		return (
			<div {...stylex.props(styles.loadingMore)}>
				<Loader2 size={24} {...stylex.props(spinnerStyle.spinner)} />
			</div>
		);
	}

	if (rooms.length === 0) {
		return (
			<div {...stylex.props(styles.container)}>
				{/* 검색 및 필터 (마켓 채팅이 아닌 경우만) */}
				{!marketId && (
					<>
						<div {...stylex.props(styles.searchBar)}>
							<Search size={18} {...stylex.props(styles.searchIcon)} />
							<input
								type="text"
								placeholder="채팅방 검색"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								{...stylex.props(styles.searchInput)}
							/>
							{searchQuery && (
								<button
									type="button"
									onClick={clearSearch}
									{...stylex.props(styles.clearButton)}
								>
									<X size={14} />
								</button>
							)}
						</div>

						<div {...stylex.props(styles.filterTabs)}>
							<button
								type="button"
								onClick={() => handleFilterChange("all")}
								{...stylex.props(
									styles.filterTab,
									activeFilter === "all" && styles.filterTabActive,
								)}
							>
								<Filter size={14} />
								전체
							</button>
							<button
								type="button"
								onClick={() => handleFilterChange("trading")}
								{...stylex.props(
									styles.filterTab,
									activeFilter === "trading" && styles.filterTabActive,
								)}
							>
								<ShoppingBag size={14} />
								거래
							</button>
							<button
								type="button"
								onClick={() => handleFilterChange("general")}
								{...stylex.props(
									styles.filterTab,
									activeFilter === "general" && styles.filterTabActive,
								)}
							>
								<MessageCircleHeart size={14} />
								일반
							</button>
						</div>
					</>
				)}

				<div {...stylex.props(styles.emptyState)}>
					<MessageCircleHeart size={56} {...stylex.props(styles.emptyIcon)} />
					<h3 {...stylex.props(styles.emptyTitle)}>
						{searchQuery
							? "검색 결과가 없습니다"
							: marketId
								? "거래 채팅이 없습니다"
								: "채팅방이 없습니다"}
					</h3>
					<p {...stylex.props(styles.emptyText)}>
						{searchQuery
							? "다른 검색어로 시도해보세요"
							: marketId
								? "아직 이 상품에 대한 문의가 없습니다"
								: "마켓에서 상품을 둘러보고 대화를 시작해보세요"}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div {...stylex.props(styles.container)}>
			{/* 검색 및 필터 (마켓 채팅이 아닌 경우만) */}
			{!marketId && (
				<>
					<div {...stylex.props(styles.searchBar)}>
						<Search size={18} {...stylex.props(styles.searchIcon)} />
						<input
							type="text"
							placeholder="채팅방 검색"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							{...stylex.props(styles.searchInput)}
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={clearSearch}
								{...stylex.props(styles.clearButton)}
							>
								<X size={14} />
							</button>
						)}
					</div>

					<div {...stylex.props(styles.filterTabs)}>
						<button
							type="button"
							onClick={() => handleFilterChange("all")}
							{...stylex.props(
								styles.filterTab,
								activeFilter === "all" && styles.filterTabActive,
							)}
						>
							<Filter size={14} />
							전체
						</button>
						<button
							type="button"
							onClick={() => handleFilterChange("trading")}
							{...stylex.props(
								styles.filterTab,
								activeFilter === "trading" && styles.filterTabActive,
							)}
						>
							<ShoppingBag size={14} />
							거래
						</button>
						<button
							type="button"
							onClick={() => handleFilterChange("general")}
							{...stylex.props(
								styles.filterTab,
								activeFilter === "general" && styles.filterTabActive,
							)}
						>
							<MessageCircleHeart size={14} />
							일반
						</button>
					</div>
				</>
			)}

			<div {...stylex.props(styles.list)}>
				{rooms.map((room) => {
					const displayMember = room.members[0];
					const roomName = room.name || displayMember?.nickname || "채팅방";
					const isTrading = !!room.market;

					return (
						<Link
							key={room.id}
							href={`/chat/${room.id}`}
							{...stylex.props(styles.item)}
						>
							<div {...stylex.props(styles.avatar)}>
								{displayMember?.profileImage ? (
									<img
										src={displayMember.profileImage}
										alt={roomName}
										{...stylex.props(styles.avatarImage)}
									/>
								) : (
									<div {...stylex.props(styles.avatarImage)}>
										<User size={24} />
									</div>
								)}
								{isTrading && (
									<div {...stylex.props(styles.tradingBadge)}>
										<ShoppingBag size={10} color="white" />
									</div>
								)}
							</div>
							<div {...stylex.props(styles.content)}>
								<div {...stylex.props(styles.header)}>
									<div {...stylex.props(styles.nameWrap)}>
										<h3 {...stylex.props(styles.name)}>{roomName}</h3>
										{room.members.length > 2 && (
											<span {...stylex.props(styles.memberCount)}>
												{room.members.length}명
											</span>
										)}
									</div>
									{room.lastMessage && (
										<span {...stylex.props(styles.time)}>
											{formatTime(room.lastMessage.createdAt)}
										</span>
									)}
								</div>
								<div {...stylex.props(styles.messageWrap)}>
									<p {...stylex.props(styles.message)}>
										{room.lastMessage?.content || "대화를 시작해보세요"}
									</p>
								</div>
							</div>
						</Link>
					);
				})}
			</div>

			{/* 더 보기 로딩 */}
			{hasMore && (
				<div ref={loadMoreRef} {...stylex.props(styles.loadingMore)}>
					{isLoadingMore && (
						<Loader2 size={24} {...stylex.props(spinnerStyle.spinner)} />
					)}
				</div>
			)}
		</div>
	);
}
