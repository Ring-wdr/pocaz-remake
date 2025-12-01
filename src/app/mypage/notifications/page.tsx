import { createMetadata } from "@/lib/metadata";
import NotificationsPageClient from "./page.client";

export const metadata = createMetadata({
	title: "알림 설정 | POCAZ",
	description: "푸시 알림과 마케팅 수신 여부를 관리하세요.",
	path: "/mypage/notifications",
	ogTitle: "Notifications",
});

export default function NotificationsPage() {
	return <NotificationsPageClient />;
}
