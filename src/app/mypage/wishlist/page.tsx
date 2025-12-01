import * as stylex from "@stylexjs/stylex";
import { ArrowLeft, Heart, Store } from "lucide-react";
import Link from "next/link";
import { colors, fontSize, fontWeight, radius, spacing } from "@/app/global-tokens.stylex";
import { Footer } from "@/components/home";
import { api } from "@/utils/eden";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
	title: "위시리스트 | POCAZ",
	description: "찜한 포토카드 상품을 한 번에 확인하세요.",
	path: "/mypage/wishlist",
	ogTitle: "Wishlist",
});

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
	productGrid: {
		display: "grid",
		gridTemplateColumns: "repeat(2, 1fr)",
		gap: spacing.xs,
	},
	productItem: {
		display: "flex",
		flexDirection: "column",
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
		overflow: "hidden",
		textDecoration: "none",
		color: "inherit",
	},
	productImageWrap: {
		position: "relative",
		aspectRatio: "1",
		backgroundColor: colors.bgTertiary,
	},
	productImage: {
		width: "100%",
		height: "100%",
		objectFit: "cover",
	},
	productImagePlaceholder: {
		width: "100%",
		height: "100%",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: colors.textPlaceholder,
	},
	wishlistButton: {
		position: "absolute",
		top: spacing.xxs,
		right: spacing.xxs,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "32px",
		height: "32px",
		backgroundColor: "rgba(255,255,255,0.9)",
		borderWidth: 0,
		borderRadius: "16px",
		color: colors.statusError,
		cursor: "pointer",
	},
	statusBadge: {
		position: "absolute",
		top: spacing.xxs,
		left: spacing.xxs,
		fontSize: "11px",
		fontWeight: fontWeight.semibold,
		paddingTop: "2px",
		paddingBottom: "2px",
		paddingLeft: spacing.xxs,
		paddingRight: spacing.xxs,
		borderRadius: radius.xs,
		color: colors.textInverse,
	},
	statusAvailable: {
		backgroundColor: colors.accentPrimary,
	},
	statusReserved: {
		backgroundColor: colors.purple,
	},
	statusSold: {
		backgroundColor: colors.textMuted,
	},
	productInfo: {
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
	},
	productSeller: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
		margin: 0,
		marginBottom: "2px",
	},
	productTitle: {
		fontSize: fontSize.md,
		fontWeight: fontWeight.medium,
		color: colors.textSecondary,
		margin: 0,
		marginBottom: spacing.xxxs,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	productPrice: {
		fontSize: "15px",
		fontWeight: fontWeight.bold,
		color: colors.textPrimary,
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

type WishlistStatus = "available" | "reserved" | "sold";

const statusLabels: Record<WishlistStatus, string> = {
	available: "판매중",
	reserved: "예약중",
	sold: "판매완료",
};

const statusStyles: Record<WishlistStatus, keyof typeof styles> = {
	available: "statusAvailable",
	reserved: "statusReserved",
	sold: "statusSold",
};

export default async function WishlistPage() {
	const { data, error } = await api.users.me.wishlist.get();
	const wishlistProducts = !error && data ? data.items : [];
	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<Link href="/mypage" {...stylex.props(styles.backButton)}>
					<ArrowLeft size={20} />
				</Link>
				<h1 {...stylex.props(styles.headerTitle)}>찜 목록</h1>
			</header>

			<div {...stylex.props(styles.content)}>
				{wishlistProducts.length > 0 ? (
					<div {...stylex.props(styles.productGrid)}>
						{wishlistProducts.map((product) => {
							const status = product.status as WishlistStatus;
							return (
								<Link
									key={product.id}
									href={product.href}
									{...stylex.props(styles.productItem)}
								>
									<div {...stylex.props(styles.productImageWrap)}>
										{product.image ? (
											<img
												src={product.image}
												alt={product.title}
												{...stylex.props(styles.productImage)}
											/>
										) : (
											<div {...stylex.props(styles.productImagePlaceholder)}>
												<Store size={32} />
											</div>
										)}
										<span
											{...stylex.props(
												styles.statusBadge,
												styles[statusStyles[status]],
											)}
										>
											{statusLabels[status]}
										</span>
										<button
											type="button"
											{...stylex.props(styles.wishlistButton)}
										>
											<Heart size={18} fill="currentColor" />
										</button>
									</div>
									<div {...stylex.props(styles.productInfo)}>
										<p {...stylex.props(styles.productSeller)}>
											{product.seller}
										</p>
										<h3 {...stylex.props(styles.productTitle)}>
											{product.title}
										</h3>
										<p {...stylex.props(styles.productPrice)}>
											{product.price ? `${product.price.toLocaleString()}원` : "가격협의"}
										</p>
									</div>
								</Link>
							);
						})}
					</div>
				) : (
					<div {...stylex.props(styles.emptyState)}>
						<Heart size={48} />
						<p {...stylex.props(styles.emptyText)}>찜한 상품이 없습니다</p>
					</div>
				)}
			</div>

			<Footer />
		</div>
	);
}
