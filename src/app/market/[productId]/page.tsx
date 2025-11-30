import * as stylex from "@stylexjs/stylex";
import { ChevronLeft, ChevronRight, Store, User } from "lucide-react";
import { notFound } from "next/navigation";
import { Footer } from "@/components/home";
import { getCurrentUser } from "@/lib/auth/actions";
import { formatKoreanDate } from "@/utils/date";
import { api } from "@/utils/eden";
import { ActionBar } from "./action-bar";
import { Header, type MarketStatus, styles } from "./components";
import StatusBadge from "./status-badge";

export default async function MarketDetailPage({
	params,
}: PageProps<"/market/[productId]">) {
	const { productId } = await params;
	const [marketResult, currentUser] = await Promise.all([
		api.markets({ id: productId }).get(),
		getCurrentUser(),
	]);

	const { data, error } = marketResult;

	if (error || !data) {
		notFound();
	}

	const status = data.status as MarketStatus;
	const formattedDate = formatKoreanDate(data.createdAt);
	const isOwner = currentUser?.id === data.user.id;

	return (
		<div {...stylex.props(styles.container)}>
			<Header />

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
					<StatusBadge
						marketId={productId}
						status={status}
						isOwner={isOwner}
					/>
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

			<ActionBar
				marketId={productId}
				sellerId={data.user.id}
				currentUserId={currentUser?.id ?? null}
				isOwner={isOwner}
			/>
			<Footer />
		</div>
	);
}
