import * as stylex from "@stylexjs/stylex";
import { Heart, Store } from "lucide-react";
import Link from "next/link";
import { colors } from "@/app/global-tokens.stylex";

const styles = stylex.create({
	grid: {
		display: "grid",
		gridTemplateColumns: "repeat(2, 1fr)",
		gap: "12px",
	},
	item: {
		display: "flex",
		flexDirection: "column",
		textDecoration: "none",
		color: "inherit",
	},
	imageWrap: {
		position: "relative",
		aspectRatio: "1",
		borderRadius: "8px",
		overflow: "hidden",
		backgroundColor: colors.bgTertiary,
	},
	image: {
		width: "100%",
		height: "100%",
		objectFit: "cover",
	},
	statusBadge: {
		position: "absolute",
		top: "8px",
		left: "8px",
		paddingTop: "4px",
		paddingBottom: "4px",
		paddingLeft: "8px",
		paddingRight: "8px",
		borderRadius: "4px",
		fontSize: "11px",
		fontWeight: 600,
		color: colors.textInverse,
	},
	statusSell: {
		backgroundColor: colors.accentPrimary,
	},
	statusBuy: {
		backgroundColor: colors.statusError,
	},
	statusTrade: {
		backgroundColor: colors.purple,
	},
	statusSold: {
		backgroundColor: colors.textMuted,
	},
	likeBadge: {
		position: "absolute",
		top: "8px",
		right: "8px",
		display: "flex",
		alignItems: "center",
		gap: "2px",
		paddingTop: "4px",
		paddingBottom: "4px",
		paddingLeft: "6px",
		paddingRight: "6px",
		borderRadius: "4px",
		fontSize: "11px",
		fontWeight: 500,
		color: colors.textInverse,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	info: {
		paddingTop: "8px",
	},
	artist: {
		fontSize: "12px",
		color: colors.textMuted,
		marginBottom: "2px",
	},
	title: {
		fontSize: "14px",
		fontWeight: 500,
		color: colors.textSecondary,
		margin: 0,
		marginBottom: "4px",
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	price: {
		fontSize: "15px",
		fontWeight: 700,
		color: colors.textPrimary,
	},
	emptyState: {
		textAlign: "center",
		paddingTop: "48px",
		paddingBottom: "48px",
		color: colors.textPlaceholder,
	},
	emptyIcon: {
		fontSize: "48px",
		marginBottom: "12px",
	},
	emptyText: {
		fontSize: "14px",
		margin: 0,
	},
});

export interface MarketProduct {
	id: number;
	status: "sell" | "buy" | "trade" | "sold";
	artist: string;
	title: string;
	price: number;
	likeCount: number;
	image: string;
}

// TODO: Replace with actual API call
async function getMarketProducts(): Promise<MarketProduct[]> {
	// Simulate delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	// Placeholder data
	return [
		{
			id: 1,
			status: "sell",
			artist: "르세라핌",
			title: "김채원 UNFORGIVEN 포카",
			price: 25000,
			likeCount: 12,
			image: "https://placehold.co/300x300/fef3c7/d97706?text=1",
		},
		{
			id: 2,
			status: "buy",
			artist: "뉴진스",
			title: "하니 OMG 포카 구해요",
			price: 30000,
			likeCount: 8,
			image: "https://placehold.co/300x300/fce7f3/db2777?text=2",
		},
		{
			id: 3,
			status: "trade",
			artist: "아이브",
			title: "장원영 ELEVEN 포카 교환",
			price: 0,
			likeCount: 23,
			image: "https://placehold.co/300x300/dbeafe/2563eb?text=3",
		},
		{
			id: 4,
			status: "sell",
			artist: "에스파",
			title: "카리나 MY WORLD 포카",
			price: 35000,
			likeCount: 45,
			image: "https://placehold.co/300x300/d1fae5/059669?text=4",
		},
		{
			id: 5,
			status: "sold",
			artist: "세븐틴",
			title: "민규 FML 포카",
			price: 20000,
			likeCount: 67,
			image: "https://placehold.co/300x300/ede9fe/7c3aed?text=5",
		},
		{
			id: 6,
			status: "sell",
			artist: "스트레이키즈",
			title: "현진 ROCK-STAR 포카",
			price: 28000,
			likeCount: 34,
			image: "https://placehold.co/300x300/fee2e2/dc2626?text=6",
		},
		{
			id: 7,
			status: "buy",
			artist: "ITZY",
			title: "류진 BORN TO BE 포카 구해요",
			price: 22000,
			likeCount: 15,
			image: "https://placehold.co/300x300/fef9c3/ca8a04?text=7",
		},
		{
			id: 8,
			status: "trade",
			artist: "NCT DREAM",
			title: "마크 ISTJ 포카 교환원해요",
			price: 0,
			likeCount: 19,
			image: "https://placehold.co/300x300/cffafe/0891b2?text=8",
		},
	];
}

const statusLabels: Record<MarketProduct["status"], string> = {
	sell: "양도",
	buy: "구해요",
	trade: "교환",
	sold: "판매완료",
};

const statusStyles: Record<MarketProduct["status"], keyof typeof styles> = {
	sell: "statusSell",
	buy: "statusBuy",
	trade: "statusTrade",
	sold: "statusSold",
};

export default async function ProductGridSection() {
	const products = await getMarketProducts();

	if (products.length === 0) {
		return (
			<div {...stylex.props(styles.emptyState)}>
				<Store size={48} {...stylex.props(styles.emptyIcon)} />
				<p {...stylex.props(styles.emptyText)}>등록된 상품이 없습니다</p>
			</div>
		);
	}

	return (
		<div {...stylex.props(styles.grid)}>
			{products.map((product) => (
				<Link
					key={product.id}
					href={`/market/${product.id}`}
					{...stylex.props(styles.item)}
				>
					<div {...stylex.props(styles.imageWrap)}>
						<img
							src={product.image}
							alt={product.title}
							{...stylex.props(styles.image)}
						/>
						<span
							{...stylex.props(
								styles.statusBadge,
								styles[statusStyles[product.status]],
							)}
						>
							{statusLabels[product.status]}
						</span>
						<span {...stylex.props(styles.likeBadge)}>
							<Heart size={12} fill="currentColor" />
							{product.likeCount}
						</span>
					</div>
					<div {...stylex.props(styles.info)}>
						<p {...stylex.props(styles.artist)}>{product.artist}</p>
						<h3 {...stylex.props(styles.title)}>{product.title}</h3>
						<span {...stylex.props(styles.price)}>
							{product.status === "trade"
								? "교환"
								: `${product.price.toLocaleString()}원`}
						</span>
					</div>
				</Link>
			))}
		</div>
	);
}
