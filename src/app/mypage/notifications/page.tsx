import { createMetadata } from "@/lib/metadata";
import NotificationsPageClient from "./page.client";

export const metadata = createMetadata({
	title: "알림 설정 | POCAZ",
	description: "채팅, 좋아요, 댓글, 관심 상품, 거래 알림을 받을지 정하세요.",
	path: "/mypage/notifications",
	ogTitle: "Notifications",
});

export default function NotificationsPage() {
	return <NotificationsPageClient />;
}
