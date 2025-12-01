import { unauthorized } from "next/navigation";

import { createMetadata } from "@/lib/metadata";
import { api } from "@/utils/eden";
import SecurityPageClient from "./page.client";

export const metadata = createMetadata({
	title: "보안 설정 | POCAZ",
	description: "로그아웃, 세션 관리, 회원 탈퇴를 설정하세요.",
	path: "/mypage/security",
	ogTitle: "Security",
});

async function getSecurityInfo() {
	const { data, error } = await api.auth.me.get();

	if (error || !data?.authenticated || !data.user) {
		return null;
	}

	return {
		loginProvider: data.user.email ? "이메일" : "소셜",
		loginEmail: data.user.email ?? "-",
	};
}

export default async function SecurityPage() {
	const securityInfo = await getSecurityInfo();

	if (!securityInfo) {
		unauthorized();
	}

	return (
		<SecurityPageClient
			loginProvider={securityInfo.loginProvider}
			loginEmail={securityInfo.loginEmail}
		/>
	);
}
