"use server";

import { redirect } from "next/navigation";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getBaseUrl, sanitizeReturnPath } from "@/utils/url";

export type SignInState = {
	error?: string;
};

export async function signInWithGoogle(
	_prevState: SignInState | undefined,
	formData?: FormData,
): Promise<SignInState | undefined> {
	const supabase = await createSupabaseServerClient();

	// 로그인 뒤 돌아갈 경로. 폼 값은 바꿔 보낼 수 있으므로 서버에서 한 번 더 정리한다
	const rawNext = formData?.get("next");
	const next = sanitizeReturnPath(typeof rawNext === "string" ? rawNext : null);
	const callbackUrl = `${getBaseUrl()}/auth/callback`;
	const redirectTo =
		next === "/"
			? callbackUrl
			: `${callbackUrl}?next=${encodeURIComponent(next)}`;

	// prompt를 지정하지 않아야 이미 동의한 사용자는 Google 화면 없이 바로 돌아온다
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: "google",
		options: { redirectTo },
	});

	if (error) {
		console.error("Google sign in error:", error);
		return {
			error: "Google 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.",
		};
	}

	if (data.url) {
		redirect(data.url);
	}

	return {
		error: "로그인 링크를 불러오지 못했어요. 잠시 후 다시 시도해주세요.",
	};
}

export async function signOut() {
	const supabase = await createSupabaseServerClient();
	await supabase.auth.signOut();
	redirect("/");
}

export async function getUser() {
	const supabase = await createSupabaseServerClient();
	const { data } = await supabase.auth.getClaims();
	return data?.claims;
}

/**
 * 현재 로그인한 사용자의 Prisma User 정보 반환
 * 로그인하지 않은 경우 null
 * React.cache로 래핑하여 같은 요청 내에서 중복 호출 방지
 */
export const getCurrentUser = cache(async () => {
	const supabase = await createSupabaseServerClient();
	const { data } = await supabase.auth.getClaims();

	if (!data?.claims?.sub) return null;

	const { userService } = await import("@/lib/services/user");
	return userService.findBySupabaseId(data.claims.sub);
});

export async function getSession() {
	const supabase = await createSupabaseServerClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();
	return session;
}
