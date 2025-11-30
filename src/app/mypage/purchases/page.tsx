import * as stylex from "@stylexjs/stylex";
import { ArrowLeft, ShoppingCart, Store } from "lucide-react";
import Link from "next/link";
import { colors, fontSize, fontWeight, radius, spacing } from "@/app/global-tokens.stylex";
import { Footer } from "@/components/home";

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: colors.bgPrimary,
	},
	header: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
	},
	backButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "36px",
		height: "36px",
		color: colors.textSecondary,
		backgroundColor: "transparent",
		borderWidth: 0,
		borderRadius: radius.sm,
		cursor: "pointer",
		textDecoration: "none",
	},
	headerTitle: {
		flex: 1,
		fontSize: fontSize.lg,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
		margin: 0,
	},
	content: {
		flex: 1,
		paddingTop: spacing.md,
		paddingBottom: spacing.md,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
	},
	productList: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xs,
	},
	productItem: {
		display: "flex",
		gap: spacing.xs,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
		textDecoration: "none",
		color: "inherit",
	},
	productImage: {
		width: "72px",
		height: "72px",
		borderRadius: radius.sm,
		objectFit: "cover",
		backgroundColor: colors.bgTertiary,
		flexShrink: 0,
	},
	productImagePlaceholder: {
		width: "72px",
		height: "72px",
		borderRadius: radius.sm,
		backgroundColor: colors.bgTertiary,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: colors.textPlaceholder,
		flexShrink: 0,
	},
	productInfo: {
		flex: 1,
		minWidth: 0,
	},
	productTitle: {
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
		margin: 0,
		marginBottom: "2px",
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	productPrice: {
		fontSize: fontSize.md,
		fontWeight: fontWeight.bold,
		color: colors.textPrimary,
		margin: 0,
		marginBottom: spacing.xxxs,
	},
	productMeta: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
	},
	productDate: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
		margin: 0,
	},
	productSeller: {
		fontSize: fontSize.sm,
		color: colors.textPlaceholder,
		margin: 0,
	},
	emptyState: {
		textAlign: "center",
		paddingTop: spacing.xl,
		paddingBottom: spacing.xl,
		color: colors.textPlaceholder,
	},
	emptyText: {
		fontSize: fontSize.md,
		margin: 0,
		marginTop: spacing.xs,
	},
});

interface PurchasedProduct {
	id: number;
	title: string;
	price: number;
	seller: string;
	date: string;
	image?: string;
	href: string;
}

// TODO: Replace with actual API data
const purchasedProducts: PurchasedProduct[] = [
	{
		id: 1,
		title: "뉴진스 해린 버니 포카",
		price: 30000,
		seller: "아이돌팬",
		date: "2024.01.18",
		href: "/market/1",
	},
	{
		id: 2,
		title: "에스파 윈터 미공개 포카",
		price: 20000,
		seller: "마이팬",
		date: "2024.01.12",
		href: "/market/2",
	},
	{
		id: 3,
		title: "아이브 원영 앨범 포카",
		price: 15000,
		seller: "포카판매자",
		date: "2024.01.05",
		href: "/market/3",
	},
];

export default function PurchasesPage() {
	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<Link href="/mypage" {...stylex.props(styles.backButton)}>
					<ArrowLeft size={20} />
				</Link>
				<h1 {...stylex.props(styles.headerTitle)}>구매 내역</h1>
			</header>

			<div {...stylex.props(styles.content)}>
				{purchasedProducts.length > 0 ? (
					<div {...stylex.props(styles.productList)}>
						{purchasedProducts.map((product) => (
							<Link
								key={product.id}
								href={product.href}
								{...stylex.props(styles.productItem)}
							>
								{product.image ? (
									<img
										src={product.image}
										alt={product.title}
										{...stylex.props(styles.productImage)}
									/>
								) : (
									<div {...stylex.props(styles.productImagePlaceholder)}>
										<Store size={24} />
									</div>
								)}
								<div {...stylex.props(styles.productInfo)}>
									<h3 {...stylex.props(styles.productTitle)}>
										{product.title}
									</h3>
									<p {...stylex.props(styles.productPrice)}>
										{product.price.toLocaleString()}원
									</p>
									<div {...stylex.props(styles.productMeta)}>
										<span {...stylex.props(styles.productDate)}>
											{product.date}
										</span>
										<span {...stylex.props(styles.productSeller)}>
											판매자: {product.seller}
										</span>
									</div>
								</div>
							</Link>
						))}
					</div>
				) : (
					<div {...stylex.props(styles.emptyState)}>
						<ShoppingCart size={48} />
						<p {...stylex.props(styles.emptyText)}>구매 내역이 없습니다</p>
					</div>
				)}
			</div>

			<Footer />
		</div>
	);
}
