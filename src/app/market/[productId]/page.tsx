import * as stylex from "@stylexjs/stylex";
import {
	ArrowLeft,
	ChevronLeft,
	ChevronRight,
	Heart,
	MessageCircle,
	Share2,
	Store,
	User,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { colors, fontSize, fontWeight, radius, spacing } from "@/app/global-tokens.stylex";
import { Footer } from "@/components/home";
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

interface PageProps {
	params: Promise<{ productId: string }>;
}

export default async function MarketDetailPage({ params }: PageProps) {
	const { productId } = await params;
	const { data, error } = await api.markets({ id: productId }).get();

	if (error || !data) {
		notFound();
	}

	const status = data.status as MarketStatus;
	const formattedDate = new Date(data.createdAt).toLocaleDateString("ko-KR", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<Link href="/market" {...stylex.props(styles.backButton)}>
					<ArrowLeft size={20} />
				</Link>
				<h1 {...stylex.props(styles.headerTitle)}>상품 상세</h1>
			</header>

			<div {...stylex.props(styles.content)}>
				<div {...stylex.props(styles.imageSection)}>
					{data.images.length > 0 ? (
						<img
							src={data.images[0].imageUrl}
							alt={data.title}
							{...stylex.props(styles.image)}
						/>
					) : (
						<div {...stylex.props(styles.emptyState)}>
							<Store size={48} />
							<span {...stylex.props(styles.emptyText)}>이미지 없음</span>
						</div>
					)}
					<span
						{...stylex.props(styles.statusBadge, styles[statusStyles[status]])}
					>
						{statusLabels[status]}
					</span>
					{data.images.length > 1 && (
						<>
							<button
								type="button"
								{...stylex.props(styles.imageNav, styles.imageNavLeft)}
							>
								<ChevronLeft size={20} />
							</button>
							<button
								type="button"
								{...stylex.props(styles.imageNav, styles.imageNavRight)}
							>
								<ChevronRight size={20} />
							</button>
							<div {...stylex.props(styles.imageIndicator)}>
								{data.images.map((_, index) => (
									<span
										key={data.images[index].id}
										{...stylex.props(
											styles.indicatorDot,
											index === 0 && styles.indicatorDotActive,
										)}
									/>
								))}
							</div>
						</>
					)}
				</div>

				<div {...stylex.props(styles.infoSection)}>
					<div {...stylex.props(styles.sellerInfo)}>
						{data.user.profileImage ? (
							<img
								src={data.user.profileImage}
								alt={data.user.nickname}
								{...stylex.props(styles.sellerAvatar)}
							/>
						) : (
							<div {...stylex.props(styles.sellerAvatarPlaceholder)}>
								<User size={20} />
							</div>
						)}
						<p {...stylex.props(styles.sellerName)}>{data.user.nickname}</p>
					</div>

					<h2 {...stylex.props(styles.productTitle)}>{data.title}</h2>
					<p {...stylex.props(styles.productPrice)}>
						{data.price ? `${data.price.toLocaleString()}원` : "가격협의"}
					</p>
					<p {...stylex.props(styles.productMeta)}>{formattedDate}</p>

					{data.description && (
						<p {...stylex.props(styles.productDescription)}>
							{data.description}
						</p>
					)}
				</div>
			</div>

			<div {...stylex.props(styles.actionBar)}>
				<button type="button" {...stylex.props(styles.actionButton)}>
					<Heart size={20} />
				</button>
				<button type="button" {...stylex.props(styles.actionButton)}>
					<Share2 size={20} />
				</button>
				<Link href={`/chat/list`} {...stylex.props(styles.chatButton)}>
					<MessageCircle size={18} />
					채팅하기
				</Link>
			</div>

			<Footer />
		</div>
	);
}
