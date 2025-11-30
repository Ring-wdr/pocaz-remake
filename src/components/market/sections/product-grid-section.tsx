import * as stylex from "@stylexjs/stylex";
import { Store } from "lucide-react";
import Link from "next/link";
import { colors } from "@/app/global-tokens.stylex";
import { api } from "@/utils/eden";

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
	statusAvailable: {
		backgroundColor: colors.accentPrimary,
	},
	statusReserved: {
		backgroundColor: colors.purple,
	},
	statusSold: {
		backgroundColor: colors.textMuted,
	},
	info: {
		paddingTop: "8px",
	},
	seller: {
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

type MarketStatus = "available" | "reserved" | "sold";

const statusLabels: Record<MarketStatus, string> = {
	available: "판매중",
	reserved: "예약중",
	sold: "판매완료",
};

const statusStyles: Record<MarketStatus, keyof typeof styles> = {
	available: "statusAvailable",
	reserved: "statusReserved",
	sold: "statusSold",
};

export default async function ProductGridSection() {
	const { data, error } = await api.markets.get({ query: { limit: "20" } });

	if (error || !data) {
		return (
			<div {...stylex.props(styles.emptyState)}>
				<Store size={48} {...stylex.props(styles.emptyIcon)} />
				<p {...stylex.props(styles.emptyText)}>상품을 불러올 수 없습니다</p>
			</div>
		);
	}

	if (data.items.length === 0) {
		return (
			<div {...stylex.props(styles.emptyState)}>
				<Store size={48} {...stylex.props(styles.emptyIcon)} />
				<p {...stylex.props(styles.emptyText)}>등록된 상품이 없습니다</p>
			</div>
		);
	}

	return (
		<div {...stylex.props(styles.grid)}>
			{data.items.map((item) => {
				const status = item.status as MarketStatus;
				return (
					<Link
						key={item.id}
						href={`/market/${item.id}`}
						{...stylex.props(styles.item)}
					>
						<div {...stylex.props(styles.imageWrap)}>
							{item.images[0] && (
								<img
									src={item.images[0].imageUrl}
									alt={item.title}
									{...stylex.props(styles.image)}
								/>
							)}
							<span
								{...stylex.props(
									styles.statusBadge,
									styles[statusStyles[status]],
								)}
							>
								{statusLabels[status]}
							</span>
						</div>
						<div {...stylex.props(styles.info)}>
							<p {...stylex.props(styles.seller)}>{item.user.nickname}</p>
							<h3 {...stylex.props(styles.title)}>{item.title}</h3>
							<span {...stylex.props(styles.price)}>
								{item.price ? `${item.price.toLocaleString()}원` : "가격협의"}
							</span>
						</div>
					</Link>
				);
			})}
		</div>
	);
}
