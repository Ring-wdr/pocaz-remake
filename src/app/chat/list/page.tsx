import * as stylex from "@stylexjs/stylex";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { ChatListSection } from "@/components/chat/sections";
import { ChatListSkeleton } from "@/components/chat/skeletons";
import { Footer } from "@/components/home";
import { createMetadata } from "@/lib/metadata";
import type { MarketSummary } from "@/types/entities";
import { api } from "@/utils/eden";
import { FixedPageHeader, fixedHeaderStyles } from "@/components/ui";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "../../global-tokens.stylex";

export const metadata = createMetadata({
	title: "채팅 목록 | POCAZ",
	description: "거래 중인 포토카드와 대화를 한곳에서 확인하세요.",
	path: "/chat/list",
	ogTitle: "Chat List",
});

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: colors.bgPrimary,
	},
	content: {
		flex: 1,
		paddingTop: "20px",
		paddingLeft: "14px",
		paddingRight: "14px",
		paddingBottom: "24px",
	},
	marketInfo: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		marginBottom: spacing.sm,
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.sm,
	},
	marketImage: {
		width: "48px",
		height: "48px",
		borderRadius: radius.xs,
		objectFit: "cover",
		backgroundColor: colors.bgTertiary,
	},
	marketDetails: {
		flex: 1,
		minWidth: 0,
	},
	marketTitle: {
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
		margin: 0,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	marketPrice: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
		margin: 0,
	},
});

export default async function ChatListPage({
	searchParams,
}: PageProps<"/chat/list">) {
	const { marketId } = await searchParams;
	const firstMarketId = Array.isArray(marketId) ? marketId[0] : marketId;
	// 마켓 정보 조회 (marketId가 있는 경우)
	let marketInfo: MarketSummary | null = null;

	if (firstMarketId) {
		const { data } = await api.markets({ id: firstMarketId }).get();
		if (data) {
			marketInfo = {
				id: data.id,
				title: data.title,
				price: data.price ?? null,
				thumbnail: data.images[0]?.imageUrl ?? null,
			};
		}
	}

	return (
		<div {...stylex.props(styles.container)}>
			<FixedPageHeader
				title={marketId ? "거래 채팅" : "채팅"}
				leading={
					firstMarketId ? (
						<Link
							href="/chat/list"
							{...stylex.props(fixedHeaderStyles.roundButton)}
						>
							<ArrowLeft size={20} />
						</Link>
					) : undefined
				}
			/>
			<div {...stylex.props(styles.content)}>
				{marketInfo && (
					<div {...stylex.props(styles.marketInfo)}>
						{marketInfo.thumbnail && (
							<img
								src={marketInfo.thumbnail}
								alt={marketInfo.title}
								{...stylex.props(styles.marketImage)}
							/>
						)}
						<div {...stylex.props(styles.marketDetails)}>
							<p {...stylex.props(styles.marketTitle)}>{marketInfo.title}</p>
							<p {...stylex.props(styles.marketPrice)}>
								{marketInfo.price
									? `${marketInfo.price.toLocaleString()}원`
									: "가격협의"}
							</p>
						</div>
					</div>
				)}

				<Suspense fallback={<ChatListSkeleton showFilters={!firstMarketId} />}>
					<ChatListSection marketId={firstMarketId} />
				</Suspense>
			</div>
			<Footer />
		</div>
	);
}
