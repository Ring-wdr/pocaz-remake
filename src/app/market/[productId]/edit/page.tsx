import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getArtistCatalog } from "@/components/market/get-artist-catalog";
import { getCurrentUser } from "@/lib/auth/actions";
import { createMetadata } from "@/lib/metadata";
import { api } from "@/utils/eden";
import { loginHref } from "@/utils/url";
import MarketEditPageClient from "./page.client";

export async function generateMetadata({
	params,
}: PageProps<"/market/[productId]/edit">): Promise<Metadata> {
	const { productId } = await params;

	return createMetadata({
		title: "상품 수정 | POCAZ 마켓",
		description: "등록한 상품의 사진, 가격, 설명을 수정하세요.",
		path: `/market/${productId}/edit`,
		ogTitle: "Edit Market Item",
	});
}

export default async function MarketEditPage({
	params,
}: PageProps<"/market/[productId]/edit">) {
	const { productId } = await params;
	const [currentUser, { data, error }, groups] = await Promise.all([
		getCurrentUser(),
		api.markets({ id: productId }).get(),
		getArtistCatalog(),
	]);

	// 로그인 체크
	if (!currentUser) {
		redirect(loginHref(`/market/${productId}/edit`));
	}

	// 상품 존재 확인
	if (error || !data) {
		notFound();
	}

	// 주인 확인
	if (currentUser.id !== data.user.id) {
		redirect(`/market/${productId}`);
	}

	return (
		<MarketEditPageClient
			marketId={productId}
			initialValues={{
				title: data.title,
				description: data.description ?? "",
				price: data.price,
				condition: data.condition,
				isNegotiable: data.isNegotiable,
				groupId: data.group?.id ?? null,
				artistId: data.artist?.id ?? null,
			}}
			existingImages={data.images}
			groups={groups}
		/>
	);
}
