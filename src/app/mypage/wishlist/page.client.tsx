"use client";

import * as stylex from "@stylexjs/stylex";
import { Heart, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import { api } from "@/utils/eden";

const styles = stylex.create({
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
	wishlistButtonDisabled: {
		opacity: 0.6,
		cursor: "not-allowed",
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

interface WishlistProduct {
	id: string;
	title: string;
	price: number | null;
	status: string;
	seller: string;
	image: string | null;
	href: string;
	likedAt: string;
}

interface WishlistClientProps {
	products: WishlistProduct[];
}

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

export default function WishlistClient({ products }: WishlistClientProps) {
	const router = useRouter();
	const [removingId, setRemovingId] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	const handleRemoveWishlist = async (
		e: React.MouseEvent,
		productId: string,
	) => {
		e.preventDefault();
		e.stopPropagation();

		if (removingId) return;

		setRemovingId(productId);

		try {
			const { error } = await api.likes.markets({ marketId: productId }).post();

			if (error) {
				toast.error("찜 해제에 실패했습니다.");
				return;
			}

			toast.success("찜 목록에서 제거되었습니다.");
			startTransition(() => {
				router.refresh();
			});
		} catch {
			toast.error("찜 해제에 실패했습니다.");
		} finally {
			setRemovingId(null);
		}
	};

	return (
		<div {...stylex.props(styles.content)}>
			{products.length > 0 ? (
				<div {...stylex.props(styles.productGrid)}>
					{products.map((product) => {
						const status = product.status as WishlistStatus;
						const isRemoving = removingId === product.id;

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
										onClick={(e) => handleRemoveWishlist(e, product.id)}
										disabled={isRemoving || isPending}
										{...stylex.props(
											styles.wishlistButton,
											(isRemoving || isPending) &&
												styles.wishlistButtonDisabled,
										)}
									>
										<Heart size={18} fill="currentColor" />
									</button>
								</div>
								<div {...stylex.props(styles.productInfo)}>
									<p {...stylex.props(styles.productSeller)}>{product.seller}</p>
									<h3 {...stylex.props(styles.productTitle)}>{product.title}</h3>
									<p {...stylex.props(styles.productPrice)}>
										{product.price
											? `${product.price.toLocaleString()}원`
											: "가격협의"}
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
	);
}
