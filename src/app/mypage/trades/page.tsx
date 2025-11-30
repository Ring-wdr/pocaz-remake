import * as stylex from "@stylexjs/stylex";
import { ArrowLeft, Store } from "lucide-react";
import Link from "next/link";
import { colors, fontSize, fontWeight, radius, spacing } from "@/app/global-tokens.stylex";
import { Footer } from "@/components/home";
import { formatDate } from "@/utils/date";
import { api } from "@/utils/eden";

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
	tradeList: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xs,
	},
	tradeItem: {
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
	tradeImage: {
		width: "64px",
		height: "64px",
		borderRadius: radius.sm,
		objectFit: "cover",
		backgroundColor: colors.bgTertiary,
		flexShrink: 0,
	},
	tradeImagePlaceholder: {
		width: "64px",
		height: "64px",
		borderRadius: radius.sm,
		backgroundColor: colors.bgTertiary,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: colors.textPlaceholder,
		flexShrink: 0,
	},
	tradeInfo: {
		flex: 1,
		minWidth: 0,
	},
	tradeTitle: {
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
		margin: 0,
		marginBottom: "2px",
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	tradePrice: {
		fontSize: fontSize.md,
		fontWeight: fontWeight.bold,
		color: colors.textPrimary,
		margin: 0,
		marginBottom: spacing.xxs,
	},
	tradeMeta: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
	},
	tradeType: {
		fontSize: fontSize.sm,
		fontWeight: fontWeight.medium,
		paddingTop: "2px",
		paddingBottom: "2px",
		paddingLeft: spacing.xxs,
		paddingRight: spacing.xxs,
		borderRadius: radius.xs,
	},
	typeBuy: {
		backgroundColor: colors.statusInfoBg,
		color: colors.statusInfo,
	},
	typeSell: {
		backgroundColor: colors.statusSuccessBg,
		color: colors.statusSuccess,
	},
	tradeDate: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
		margin: 0,
	},
	tradePartner: {
		fontSize: fontSize.sm,
		color: colors.textPlaceholder,
		margin: 0,
		marginLeft: "auto",
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

export default async function TradesPage() {
	const { data, error } = await api.users.me.trades.get();
	const trades = !error && data ? data.items : [];
	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<Link href="/mypage" {...stylex.props(styles.backButton)}>
					<ArrowLeft size={20} />
				</Link>
				<h1 {...stylex.props(styles.headerTitle)}>거래 내역</h1>
			</header>

			<div {...stylex.props(styles.content)}>
				{trades.length > 0 ? (
					<div {...stylex.props(styles.tradeList)}>
						{trades.map((trade) => (
							<Link
								key={trade.id}
								href={trade.href}
								{...stylex.props(styles.tradeItem)}
							>
								{trade.image ? (
									<img
										src={trade.image}
										alt={trade.title}
										{...stylex.props(styles.tradeImage)}
									/>
								) : (
									<div {...stylex.props(styles.tradeImagePlaceholder)}>
										<Store size={24} />
									</div>
								)}
								<div {...stylex.props(styles.tradeInfo)}>
									<h3 {...stylex.props(styles.tradeTitle)}>{trade.title}</h3>
									<p {...stylex.props(styles.tradePrice)}>
										{trade.price.toLocaleString()}원
									</p>
									<div {...stylex.props(styles.tradeMeta)}>
										<span
											{...stylex.props(
												styles.tradeType,
												trade.type === "buy" ? styles.typeBuy : styles.typeSell,
											)}
										>
											{trade.type === "buy" ? "구매" : "판매"}
										</span>
										<span {...stylex.props(styles.tradeDate)}>
											{formatDate(trade.date)}
										</span>
										<span {...stylex.props(styles.tradePartner)}>
											{trade.partner}
										</span>
									</div>
								</div>
							</Link>
						))}
					</div>
				) : (
					<div {...stylex.props(styles.emptyState)}>
						<Store size={48} />
						<p {...stylex.props(styles.emptyText)}>거래 내역이 없습니다</p>
					</div>
				)}
			</div>

			<Footer />
		</div>
	);
}
