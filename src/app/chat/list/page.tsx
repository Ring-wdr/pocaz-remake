import * as stylex from "@stylexjs/stylex";
import { ArrowLeft, Filter } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { ChatListSection } from "@/components/chat/sections";
import { ChatListSkeleton } from "@/components/chat/skeletons";
import { Footer } from "@/components/home";
import { api } from "@/utils/eden";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "../../global-tokens.stylex";

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
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: "16px",
	},
	headerLeft: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
	},
	backButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "32px",
		height: "32px",
		color: colors.textSecondary,
		backgroundColor: "transparent",
		borderWidth: 0,
		borderRadius: radius.sm,
		cursor: "pointer",
		textDecoration: "none",
	},
	title: {
		fontSize: "24px",
		fontWeight: 800,
		color: colors.textPrimary,
		margin: 0,
	},
	filterButton: {
		display: "flex",
		alignItems: "center",
		gap: "4px",
		paddingTop: "6px",
		paddingBottom: "6px",
		paddingLeft: "12px",
		paddingRight: "12px",
		fontSize: "13px",
		fontWeight: 500,
		color: colors.textMuted,
		backgroundColor: colors.bgTertiary,
		borderRadius: "16px",
		borderWidth: 0,
		cursor: "pointer",
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

interface ChatListPageProps {
	searchParams: Promise<{ marketId?: string }>;
}

export default async function ChatListPage({
	searchParams,
}: ChatListPageProps) {
	const { marketId } = await searchParams;

	// 마켓 정보 조회 (marketId가 있는 경우)
	let marketInfo: {
		id: string;
		title: string;
		price: number | null;
		thumbnail: string | null;
	} | null = null;

	if (marketId) {
		const { data } = await api.markets({ id: marketId }).get();
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
			<div {...stylex.props(styles.content)}>
				<div {...stylex.props(styles.header)}>
					<div {...stylex.props(styles.headerLeft)}>
						{marketId && (
							<Link href="/chat/list" {...stylex.props(styles.backButton)}>
								<ArrowLeft size={20} />
							</Link>
						)}
						<h1 {...stylex.props(styles.title)}>
							{marketId ? "거래 채팅" : "채팅"}
						</h1>
					</div>
					{!marketId && (
						<button type="button" {...stylex.props(styles.filterButton)}>
							<Filter size={14} />
							필터
						</button>
					)}
				</div>

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

				<Suspense fallback={<ChatListSkeleton />}>
					<ChatListSection marketId={marketId} />
				</Suspense>
			</div>
			<Footer />
		</div>
	);
}
