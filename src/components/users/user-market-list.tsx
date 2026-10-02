"use client";

import * as stylex from "@stylexjs/stylex";
import { Store } from "lucide-react";
import { useState, useTransition } from "react";

import { colors, fontSize, spacing } from "@/app/global-tokens.stylex";
import LoadMoreForm from "@/components/market/v2/client/load-more-form";
import MarketGrid from "@/components/market/v2/client/market-grid";
import type { MarketListItem } from "@/components/market/v2/types";
import { api } from "@/utils/eden";

const styles = stylex.create({
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
	"상품을 더 불러오지 못했습니다. 다시 시도해 주세요.";

type UserMarketListProps = {
	/** 판매자 id */
	userId: string;
	/** 서버가 미리 가져온 첫 페이지. nextCursor는 다음 페이지의 커서이고, 더 없으면 null */
	initialPage: { items: MarketListItem[]; nextCursor: string | null };
	/** 한 번에 가져올 상품 수. 첫 페이지를 가져올 때와 같은 값 */
	limit: number;
};

/** 이미 있는 상품은 건너뛰고 새 상품만 뒤에 붙인다 */
function appendNew(existing: MarketListItem[], incoming: MarketListItem[]) {
	const known = new Set(existing.map((item) => item.id));
	return [...existing, ...incoming.filter((item) => !known.has(item.id))];
}

/**
 * 판매자 프로필의 "판매 상품" 탭. 서버가 가져온 첫 페이지를 그리고, "더 보기"로 다음 페이지를 이어 붙인다.
 */
export default function UserMarketList({
	userId,
	initialPage,
	limit,
}: UserMarketListProps) {
	const [items, setItems] = useState(initialPage.items);
	const [nextCursor, setNextCursor] = useState(initialPage.nextCursor);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	const loadMore = () => {
		if (!nextCursor || isPending) return;

		startTransition(async () => {
			try {
				const { data, error: requestError } = await api.markets
					.user({ userId })
					.get({ query: { cursor: nextCursor, limit } });

				if (requestError || !data) {
					setError(LOAD_MORE_FAILED_MESSAGE);
					return;
				}

				setItems((prev) => appendNew(prev, data.items));
				setNextCursor(data.nextCursor);
				setError(null);
			} catch (thrown) {
				console.error("UserMarketList load more failed", thrown);
				setError(LOAD_MORE_FAILED_MESSAGE);
			}
		});
	};

	if (items.length === 0) {
		return (
			<div {...stylex.props(styles.empty)}>
				<Store size={48} />
				<p {...stylex.props(styles.emptyText)}>아직 판매 중인 상품이 없어요</p>
			</div>
		);
	}

	return (
		<>
			<MarketGrid items={items} pending={isPending} />

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
