import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/actions";
import { createMetadata } from "@/lib/metadata";
import { loginHref } from "@/utils/url";

import CommunityWritePageClient from "./page.client";

export const metadata = createMetadata({
	title: "글 작성 | POCAZ 커뮤니티",
	description: "자유게시판, 포카 자랑, 정보 공유에 새 글을 남겨보세요.",
	path: "/community/write",
	ogTitle: "Community Write",
});

export default async function CommunityWritePage() {
	const currentUser = await getCurrentUser();

	if (!currentUser) {
		redirect(loginHref("/community/write"));
	}

	return <CommunityWritePageClient />;
}
