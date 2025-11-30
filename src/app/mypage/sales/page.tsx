import * as stylex from "@stylexjs/stylex";
import { ArrowLeft, Store } from "lucide-react";
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
	tabs: {
		display: "flex",
		gap: spacing.xxs,
		marginBottom: spacing.md,
	},
	tab: {
		flex: 1,
		paddingTop: spacing.xxs,
		paddingBottom: spacing.xxs,
		fontSize: fontSize.md,
		fontWeight: fontWeight.medium,
		color: colors.textMuted,
		backgroundColor: colors.bgSecondary,
		borderWidth: 0,
		borderRadius: radius.sm,
		cursor: "pointer",
	},
	tabActive: {
		color: colors.textInverse,
		backgroundColor: colors.bgInverse,
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
	statusBadge: {
		display: "inline-block",
		fontSize: "11px",
		fontWeight: fontWeight.semibold,
		paddingTop: "2px",
		paddingBottom: "2px",
		paddingLeft: spacing.xxs,
		paddingRight: spacing.xxs,
		borderRadius: radius.xs,
		marginBottom: "2px",
	},
	statusAvailable: {
		backgroundColor: colors.accentPrimary,
		color: colors.textInverse,
	},
	statusReserved: {
		backgroundColor: colors.purple,
		color: colors.textInverse,
	},
	statusSold: {
		backgroundColor: colors.textMuted,
		color: colors.textInverse,
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
	productDate: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
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

type SaleStatus = "available" | "reserved" | "sold";

interface SaleProduct {
	id: number;
	title: string;
	price: number;
	status: SaleStatus;
	date: string;
	image?: string;
	href: string;
}

const statusLabels: Record<SaleStatus, string> = {
	available: "판매중",
	reserved: "예약중",
	sold: "판매완료",
};

const statusStyles: Record<SaleStatus, keyof typeof styles> = {
	available: "statusAvailable",
	reserved: "statusReserved",
	sold: "statusSold",
};

// TODO: Replace with actual API data
const saleProducts: SaleProduct[] = [
	{
		id: 1,
		title: "르세라핌 채원 시그니처 포카",
		price: 25000,
		status: "available",
		date: "2024.01.20",
		href: "/market/1",
	},
	{
		id: 2,
		title: "아이브 원영 앨범 포카",
		price: 15000,
		status: "reserved",
		date: "2024.01.18",
		href: "/market/2",
	},
	{
		id: 3,
		title: "뉴진스 민지 팬미팅 포카",
		price: 35000,
		status: "sold",
		date: "2024.01.15",
		href: "/market/3",
	},
	{
		id: 4,
		title: "에스파 카리나 콘서트 포카",
		price: 20000,
		status: "sold",
		date: "2024.01.10",
		href: "/market/4",
	},
];

export default function SalesPage() {
	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<Link href="/mypage" {...stylex.props(styles.backButton)}>
					<ArrowLeft size={20} />
				</Link>
				<h1 {...stylex.props(styles.headerTitle)}>판매 내역</h1>
			</header>

			<div {...stylex.props(styles.content)}>
				<div {...stylex.props(styles.tabs)}>
					<button type="button" {...stylex.props(styles.tab, styles.tabActive)}>
						전체
					</button>
					<button type="button" {...stylex.props(styles.tab)}>
						판매중
					</button>
					<button type="button" {...stylex.props(styles.tab)}>
						거래완료
					</button>
				</div>

				{saleProducts.length > 0 ? (
					<div {...stylex.props(styles.productList)}>
						{saleProducts.map((product) => (
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
									<span
										{...stylex.props(
											styles.statusBadge,
											styles[statusStyles[product.status]],
										)}
									>
										{statusLabels[product.status]}
									</span>
									<h3 {...stylex.props(styles.productTitle)}>
										{product.title}
									</h3>
									<p {...stylex.props(styles.productPrice)}>
										{product.price.toLocaleString()}원
									</p>
									<p {...stylex.props(styles.productDate)}>{product.date}</p>
								</div>
							</Link>
						))}
					</div>
				) : (
					<div {...stylex.props(styles.emptyState)}>
						<Store size={48} />
						<p {...stylex.props(styles.emptyText)}>판매 내역이 없습니다</p>
					</div>
				)}
			</div>

			<Footer />
		</div>
	);
}
