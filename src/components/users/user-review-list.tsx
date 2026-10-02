"use client";

import * as stylex from "@stylexjs/stylex";
import { Star } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import {
	colors,
	fontSize,
	fontWeight,
	lineHeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import LoadMoreForm from "@/components/market/v2/client/load-more-form";
import { formatRelativeTime } from "@/utils/date";
import { api } from "@/utils/eden";

const styles = stylex.create({
	list: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xs,
		listStyleType: "none",
		margin: 0,
		padding: 0,
	},
	item: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xxs,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
	},
	itemHeader: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: spacing.xs,
	},
	stars: {
		display: "inline-flex",
		alignItems: "center",
		color: colors.statusWarning,
	},
	time: {
		flexShrink: 0,
		fontSize: fontSize.sm,
		color: colors.textMuted,
	},
	content: {
		margin: 0,
		fontSize: fontSize.md,
		lineHeight: lineHeight.relaxed,
		color: colors.textSecondary,
		whiteSpace: "pre-wrap",
		overflowWrap: "anywhere",
	},
	// 작성자와 거래한 상품. 상품명이 길면 줄여서 한 줄만 쓴다
	meta: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxs,
		margin: 0,
		fontSize: fontSize.sm,
		color: colors.textMuted,
	},
	metaLink: {
		color: "inherit",
		textDecoration: "none",
	},
	reviewer: {
		flexShrink: 0,
		fontWeight: fontWeight.medium,
		color: colors.textTertiary,
	},
	market: {
		minWidth: 0,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	empty: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		paddingTop: spacing.xl,
		paddingBottom: spacing.xl,
		textAlign: "center",
		color: colors.textPlaceholder,
	},
	emptyText: {
		margin: 0,
		marginTop: spacing.xs,
		fontSize: fontSize.md,
	},
	errorText: {
		marginTop: spacing.sm,
		textAlign: "center",
		color: colors.statusError,
		fontSize: fontSize.sm,
	},
});

const LOAD_MORE_FAILED_MESSAGE =
	"후기를 더 불러오지 못했습니다. 다시 시도해 주세요.";

/** 별점 최댓값. 별은 별점 수만큼만 그린다 */
const STAR_VALUES = [1, 2, 3, 4, 5] as const;

/** 사용자가 받은 후기 한 건 (GET /api/users/:id/reviews의 항목) */
export type UserReviewItem = {
	id: string;
	rating: number;
	content: string | null;
	createdAt: string;
	reviewer: {
		id: string;
		nickname: string;
		profileImage: string | null;
	};
	market: {
		id: string;
		title: string;
	};
};

type UserReviewListProps = {
	/** 후기를 받은 사용자 id */
	userId: string;
	/** 서버가 미리 가져온 첫 페이지. nextCursor는 다음 페이지의 커서이고, 더 없으면 null */
	initialPage: { items: UserReviewItem[]; nextCursor: string | null };
	/** 한 번에 가져올 후기 수. 첫 페이지를 가져올 때와 같은 값 */
	limit: number;
};

/** 이미 있는 후기는 건너뛰고 새 후기만 뒤에 붙인다 */
function appendNew(existing: UserReviewItem[], incoming: UserReviewItem[]) {
	const known = new Set(existing.map((item) => item.id));
	return [...existing, ...incoming.filter((item) => !known.has(item.id))];
}

/**
 * 판매자 프로필의 "후기" 탭. 서버가 가져온 첫 페이지를 그리고, "더 보기"로 다음 페이지를 이어 붙인다.
 */
export default function UserReviewList({
	userId,
	initialPage,
	limit,
}: UserReviewListProps) {
	const [items, setItems] = useState(initialPage.items);
	const [nextCursor, setNextCursor] = useState(initialPage.nextCursor);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	const loadMore = () => {
		if (!nextCursor || isPending) return;

		startTransition(async () => {
			try {
				const { data, error: requestError } = await api
					.users({ id: userId })
					.reviews.get({ query: { cursor: nextCursor, limit } });

				if (requestError || !data) {
					setError(LOAD_MORE_FAILED_MESSAGE);
					return;
				}

				setItems((prev) => appendNew(prev, data.items));
				setNextCursor(data.nextCursor);
				setError(null);
			} catch (thrown) {
				console.error("UserReviewList load more failed", thrown);
				setError(LOAD_MORE_FAILED_MESSAGE);
			}
		});
	};

	if (items.length === 0) {
		return (
			<div {...stylex.props(styles.empty)}>
				<Star size={48} />
				<p {...stylex.props(styles.emptyText)}>아직 받은 후기가 없어요</p>
			</div>
		);
	}

	return (
		<>
			<ul aria-busy={isPending} {...stylex.props(styles.list)}>
				{items.map((review) => (
					<li key={review.id} {...stylex.props(styles.item)}>
						<div {...stylex.props(styles.itemHeader)}>
							<span
								role="img"
								aria-label={`별점 ${review.rating}점`}
								{...stylex.props(styles.stars)}
							>
								{STAR_VALUES.slice(0, review.rating).map((value) => (
									<Star
										key={value}
										size={16}
										fill="currentColor"
										aria-hidden="true"
									/>
								))}
							</span>
							{/* 지금 시각으로 계산하므로 서버가 그린 문구와 달라도 하이드레이션 경고를 내지 않는다 */}
							<time
								dateTime={review.createdAt}
								suppressHydrationWarning
								{...stylex.props(styles.time)}
							>
								{formatRelativeTime(review.createdAt)}
							</time>
						</div>
						{review.content && (
							<p {...stylex.props(styles.content)}>{review.content}</p>
						)}
						<p {...stylex.props(styles.meta)}>
							<Link
								href={`/users/${review.reviewer.id}`}
								{...stylex.props(styles.metaLink, styles.reviewer)}
							>
								{review.reviewer.nickname}
							</Link>
							<span aria-hidden="true">·</span>
							<Link
								href={`/market/${review.market.id}`}
								{...stylex.props(styles.metaLink, styles.market)}
							>
								{review.market.title}
							</Link>
						</p>
					</li>
				))}
			</ul>

			{error && (
				<output aria-live="polite" {...stylex.props(styles.errorText)}>
					{error}
				</output>
			)}

			{nextCursor && (
				<LoadMoreForm
					onLoadMore={loadMore}
					pending={isPending}
					disabled={isPending}
				/>
			)}
		</>
	);
}
