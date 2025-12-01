import { createMetadata } from "@/lib/metadata";
import MarketRegisterPageClient from "./page.client";

export const metadata = createMetadata({
	title: "상품 등록 | POCAZ 마켓",
	description: "포카 사진, 가격, 설명을 입력해 새 거래를 등록하세요.",
	path: "/market/register",
	ogTitle: "Register Photocard",
});

export default function MarketRegisterPage() {
	return <MarketRegisterPageClient />;
}
