"use client";

import * as stylex from "@stylexjs/stylex";
import { Store } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import { formatDate } from "@/utils/date";

const styles = stylex.create({
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
	countBadge: {
		marginLeft: spacing.xxxs,
		fontSize: fontSize.sm,
		color: colors.textPlaceholder,
	},
	countBadgeActive: {
		color: colors.textInverse,
		opacity: 0.8,
	},
});

type SaleStatus = "available" | "reserved" | "sold";
type TabFilter = "all" | "available" | "sold";

interface SaleProduct {
	id: string;
	title: string;
	price: number | null;
	status: string;
	date: string;
	image: string | null;
	href: string;
}

interface SalesListClientProps {
	products: SaleProduct[];
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

export default function SalesListClient({ products }: SalesListClientProps) {
	const [activeTab, setActiveTab] = useState<TabFilter>("all");

	const filteredProducts = useMemo(() => {
		if (activeTab === "all") return products;
		if (activeTab === "available") {
			return products.filter(
				(p) => p.status === "available" || p.status === "reserved",
			);
		}
		return products.filter((p) => p.status === "sold");
	}, [products, activeTab]);

	const counts = useMemo(() => {
		const available = products.filter(
			(p) => p.status === "available" || p.status === "reserved",
		).length;
		const sold = products.filter((p) => p.status === "sold").length;
		return { all: products.length, available, sold };
	}, [products]);

	return (
		<div {...stylex.props(styles.content)}>
			<div {...stylex.props(styles.tabs)}>
				<button
					type="button"
					onClick={() => setActiveTab("all")}
					{...stylex.props(styles.tab, activeTab === "all" && styles.tabActive)}
				>
					전체
					<span
						{...stylex.props(
							styles.countBadge,
							activeTab === "all" && styles.countBadgeActive,
						)}
					>
						{counts.all}
					</span>
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("available")}
					{...stylex.props(
						styles.tab,
						activeTab === "available" && styles.tabActive,
					)}
				>
					판매중
					<span
						{...stylex.props(
							styles.countBadge,
							activeTab === "available" && styles.countBadgeActive,
						)}
					>
						{counts.available}
					</span>
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("sold")}
					{...stylex.props(
						styles.tab,
						activeTab === "sold" && styles.tabActive,
					)}
				>
					거래완료
					<span
						{...stylex.props(
							styles.countBadge,
							activeTab === "sold" && styles.countBadgeActive,
						)}
					>
						{counts.sold}
					</span>
				</button>
			</div>

			{filteredProducts.length > 0 ? (
				<div {...stylex.props(styles.productList)}>
					{filteredProducts.map((product) => {
						const status = product.status as SaleStatus;
						return (
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
											styles[statusStyles[status]],
										)}
									>
										{statusLabels[status]}
									</span>
									<h3 {...stylex.props(styles.productTitle)}>
										{product.title}
									</h3>
									<p {...stylex.props(styles.productPrice)}>
										{product.price
											? `${product.price.toLocaleString()}원`
											: "가격협의"}
									</p>
									<p {...stylex.props(styles.productDate)}>
										{formatDate(product.date)}
									</p>
								</div>
							</Link>
						);
					})}
				</div>
			) : (
				<div {...stylex.props(styles.emptyState)}>
					<Store size={48} />
					<p {...stylex.props(styles.emptyText)}>
						{activeTab === "all"
							? "판매 내역이 없습니다"
							: activeTab === "available"
								? "판매중인 상품이 없습니다"
								: "거래완료된 상품이 없습니다"}
					</p>
				</div>
			)}
		</div>
	);
}
