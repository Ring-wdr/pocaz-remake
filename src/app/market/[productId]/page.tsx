import * as stylex from "@stylexjs/stylex";
import { User } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Footer } from "@/components/home";
import { getCurrentUser } from "@/lib/auth/actions";
import { createMetadata } from "@/lib/metadata";
import { formatKoreanDate } from "@/utils/date";
import { api } from "@/utils/eden";
import { ActionBar } from "./action-bar";
import { Header, type MarketStatus, styles } from "./components";
import MarketImageCarousel from "./image-carousel";
import StatusBadge from "./status-badge";
import type { MarketLikeState } from "./toggle-market-like";

function buildProductDescription({
	description,
	price,
	seller,
}: {
	description?: string | null;
	price?: number | null;
	seller?: string;
}) {
	const fallback = [
		price ? `${price.toLocaleString()}원` : "가격협의",
		seller ? `${seller} 판매자` : null,
	]
		.filter(Boolean)
		.join(" · ");

	if (!description) {
		return fallback || "포토카드 상품 상세 정보";
	}

	return description.length > 120
		? `${description.slice(0, 117)}...`
		: description;
}

const getMarket = cache(async (id: string) => {
	const { data, error } = await api.markets({ id }).get();
	if (error || !data) return null;
	return data;
});

export async function generateMetadata({
	params,
}: PageProps<"/market/[productId]">): Promise<Metadata> {
	const { productId } = await params;
	const data = await getMarket(productId);

	if (!data) {
		return createMetadata({
			title: "상품을 찾을 수 없습니다 | POCAZ",
			description: "요청한 포토카드 상품 정보를 불러올 수 없습니다.",
			path: `/market/${productId}`,
			ogTitle: "Market Item",
		});
	}

	return createMetadata({
		title: `${data.title} | POCAZ 마켓`,
		description: buildProductDescription({
			description: data.description,
			price: data.price ?? null,
			seller: data.user.nickname,
		}),
		path: `/market/${productId}`,
		ogTitle: data.title,
	});
}

async function getMarketLikeStatus(marketId: string) {
	try {
		const { data, error } = await api.likes.markets({ marketId }).get();
		if (error || !data) {
			return { liked: false, count: 0 };
		}
		return data;
	} catch {
		return { liked: false, count: 0 };
	}
}

export default async function MarketDetailPage({
	params,
}: PageProps<"/market/[productId]">) {
	const { productId } = await params;
	const [data, currentUser, likeStatus] = await Promise.all([
		getMarket(productId),
		getCurrentUser(),
		getMarketLikeStatus(productId),
	]);

	if (!data) {
		notFound();
	}

	const status = data.status as MarketStatus;
	const formattedDate = formatKoreanDate(data.createdAt);
	const isOwner = currentUser?.id === data.user.id;
	const initialLikeState: MarketLikeState = {
		liked: likeStatus.liked,
		count: likeStatus.count,
		error: null,
	};

	return (
		<div {...stylex.props(styles.container)}>
			<Header />

			<div {...stylex.props(styles.content)}>
				<div {...stylex.props(styles.imageSection)}>
					<MarketImageCarousel images={data.images} title={data.title} />
					<StatusBadge marketId={productId} status={status} isOwner={isOwner} />
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
				marketTitle={data.title}
				initialLikeState={initialLikeState}
			/>
			<Footer />
		</div>
	);
}
