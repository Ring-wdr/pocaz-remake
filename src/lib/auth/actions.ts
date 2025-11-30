"use server";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getBaseUrl } from "@/utils/url";

export async function signInWithGoogle(): Promise<void> {
	const supabase = await createSupabaseServerClient();
	const redirectTo = `${getBaseUrl()}/auth/callback`;

	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: "google",
		options: {
			redirectTo,
			queryParams: {
				access_type: "offline",
				prompt: "consent",
			},
		},
	});

	if (error) {
		console.error("Google sign in error:", error);
		redirect("/auth/auth-error");
	}

	if (data.url) {
		redirect(data.url);
	}
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
