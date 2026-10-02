import { redirect } from "next/navigation";
import { getArtistCatalog } from "@/components/market/get-artist-catalog";
import { createMetadata } from "@/lib/metadata";
import { api } from "@/utils/eden";
import { loginHref } from "@/utils/url";
import MarketRegisterPageClient from "./page.client";

export const metadata = createMetadata({
	title: "상품 등록 | POCAZ 마켓",
	description: "포카 사진, 가격, 설명을 입력해 새 거래를 등록하세요.",
	path: "/market/register",
	ogTitle: "Register Photocard",
});

export default async function MarketRegisterPage() {
	const [{ data }, groups] = await Promise.all([
		api.auth.me.get(),
		getArtistCatalog(),
	]);
	if (!data?.authenticated) {
		redirect(loginHref("/market/register"));
	}

	return <MarketRegisterPageClient groups={groups} />;
}
