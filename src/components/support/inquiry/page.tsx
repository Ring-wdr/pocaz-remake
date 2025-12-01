import { createMetadata } from "@/lib/metadata";
import InquiryPageClient from "./page.client";

export const metadata = createMetadata({
	title: "1:1 문의 | POCAZ",
	description: "포카즈 서비스 이용 중 궁금한 점과 신고를 남겨주세요.",
	path: "/support/inquiry",
	ogTitle: "Inquiry",
});

export default function InquiryPage() {
	return <InquiryPageClient />;
}
