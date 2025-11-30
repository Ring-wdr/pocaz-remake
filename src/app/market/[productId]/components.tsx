import * as stylex from "@stylexjs/stylex";
import { ArrowLeft, Heart, MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { colors, fontSize, fontWeight, radius, spacing } from "@/app/global-tokens.stylex";

export const styles = stylex.create({
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
	},
	imageSection: {
		position: "relative",
		width: "100%",
		aspectRatio: "1",
		backgroundColor: colors.bgTertiary,
	},
	image: {
		width: "100%",
		height: "100%",
		objectFit: "cover",
	},
	imageNav: {
		position: "absolute",
		top: "50%",
		transform: "translateY(-50%)",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "32px",
		height: "32px",
		backgroundColor: "rgba(0,0,0,0.3)",
		borderWidth: 0,
		borderRadius: "16px",
		color: colors.textInverse,
		cursor: "pointer",
	},
	imageNavLeft: {
		left: spacing.xs,
	},
	imageNavRight: {
		right: spacing.xs,
	},
	imageIndicator: {
		position: "absolute",
		bottom: spacing.xs,
		left: "50%",
		transform: "translateX(-50%)",
		display: "flex",
		gap: spacing.xxxs,
	},
	indicatorDot: {
		width: "6px",
		height: "6px",
		borderRadius: "3px",
		backgroundColor: "rgba(255,255,255,0.5)",
	},
	indicatorDotActive: {
		backgroundColor: colors.textInverse,
	},
	statusBadge: {
		position: "absolute",
		top: spacing.xs,
		left: spacing.xs,
		paddingTop: spacing.xxxs,
		paddingBottom: spacing.xxxs,
		paddingLeft: spacing.xxs,
		paddingRight: spacing.xxs,
		borderRadius: radius.xs,
		fontSize: "12px",
		fontWeight: fontWeight.semibold,
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
	infoSection: {
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
	},
	sellerInfo: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingBottom: spacing.sm,
		marginBottom: spacing.sm,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
	},
	sellerAvatar: {
		width: "44px",
		height: "44px",
		borderRadius: "22px",
		objectFit: "cover",
		backgroundColor: colors.bgTertiary,
	},
	sellerAvatarPlaceholder: {
		width: "44px",
		height: "44px",
		borderRadius: "22px",
		backgroundColor: colors.bgTertiary,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: colors.textPlaceholder,
	},
	sellerName: {
		flex: 1,
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
		margin: 0,
	},
	productTitle: {
		fontSize: "20px",
		fontWeight: fontWeight.bold,
		color: colors.textPrimary,
		margin: 0,
		marginBottom: spacing.xxs,
	},
	productPrice: {
		fontSize: "24px",
		fontWeight: fontWeight.bold,
		color: colors.textPrimary,
		margin: 0,
		marginBottom: spacing.sm,
	},
	productMeta: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
		margin: 0,
		marginBottom: spacing.md,
	},
	productDescription: {
		fontSize: fontSize.md,
		color: colors.textSecondary,
		lineHeight: 1.6,
		margin: 0,
		whiteSpace: "pre-wrap",
	},
	actionBar: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderTopWidth: 1,
		borderTopStyle: "solid",
		borderTopColor: colors.borderPrimary,
		backgroundColor: colors.bgPrimary,
	},
	actionButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "44px",
		height: "44px",
		color: colors.textMuted,
		backgroundColor: "transparent",
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		borderRadius: radius.sm,
		cursor: "pointer",
	},
	chatButton: {
		flex: 1,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.xxs,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.textInverse,
		backgroundColor: colors.bgInverse,
		borderWidth: 0,
		borderRadius: radius.sm,
		cursor: "pointer",
		textDecoration: "none",
	},
	emptyState: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		paddingTop: spacing.xl,
		paddingBottom: spacing.xl,
		color: colors.textPlaceholder,
	},
	emptyText: {
		fontSize: fontSize.md,
		marginTop: spacing.xs,
	},
	// Skeleton styles
	skeleton: {
		backgroundColor: colors.bgTertiary,
		animationName: stylex.keyframes({
			"0%": { opacity: 0.6 },
			"50%": { opacity: 0.3 },
			"100%": { opacity: 0.6 },
		}),
		animationDuration: "1.5s",
		animationIterationCount: "infinite",
	},
	skeletonAvatar: {
		width: "44px",
		height: "44px",
		borderRadius: "22px",
	},
	skeletonName: {
		width: "100px",
		height: "20px",
		borderRadius: radius.xs,
	},
	skeletonTitle: {
		width: "70%",
		height: "24px",
		borderRadius: radius.xs,
		marginBottom: spacing.xxs,
	},
	skeletonPrice: {
		width: "40%",
		height: "28px",
		borderRadius: radius.xs,
		marginBottom: spacing.sm,
	},
	skeletonMeta: {
		width: "30%",
		height: "16px",
		borderRadius: radius.xs,
		marginBottom: spacing.md,
	},
	skeletonDescription: {
		width: "100%",
		height: "80px",
		borderRadius: radius.sm,
	},
	skeletonAction: {
		width: "44px",
		height: "44px",
		borderRadius: radius.sm,
	},
	skeletonChat: {
		flex: 1,
		height: "44px",
		borderRadius: radius.sm,
	},
});

export type MarketStatus = "available" | "reserved" | "sold";

export const statusLabels: Record<MarketStatus, string> = {
	available: "판매중",
	reserved: "예약중",
	sold: "판매완료",
};

export const statusStyles: Record<MarketStatus, keyof typeof styles> = {
	available: "statusAvailable",
	reserved: "statusReserved",
	sold: "statusSold",
};

export function Header() {
	return (
		<header {...stylex.props(styles.header)}>
			<Link href="/market" {...stylex.props(styles.backButton)}>
				<ArrowLeft size={20} />
			</Link>
			<h1 {...stylex.props(styles.headerTitle)}>상품 상세</h1>
		</header>
	);
}

export function ActionBar() {
	return (
		<div {...stylex.props(styles.actionBar)}>
			<button type="button" {...stylex.props(styles.actionButton)}>
				<Heart size={20} />
			</button>
			<button type="button" {...stylex.props(styles.actionButton)}>
				<Share2 size={20} />
			</button>
			<Link href="/chat/list" {...stylex.props(styles.chatButton)}>
				<MessageCircle size={18} />
				채팅하기
			</Link>
		</div>
	);
}

export function ActionBarSkeleton() {
	return (
		<div {...stylex.props(styles.actionBar)}>
			<div {...stylex.props(styles.skeletonAction, styles.skeleton)} />
			<div {...stylex.props(styles.skeletonAction, styles.skeleton)} />
			<div {...stylex.props(styles.skeletonChat, styles.skeleton)} />
		</div>
	);
}

export function StatusBadgeSkeleton() {
	return (
		<span
			{...stylex.props(
				styles.statusBadge,
				styles.skeleton,
				styles.statusAvailable,
			)}
		>
			&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
		</span>
	);
}
