"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signInWithGoogle(): Promise<void> {
	const supabase = await createSupabaseServerClient();

	// 현재 origin 가져오기 (서버 사이드에서는 환경변수 사용)
	const siteUrl =
		process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: "google",
		options: {
			redirectTo: `${siteUrl}/auth/callback`,
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
	const {
		data: { user },
	} = await supabase.auth.getUser();
	return user;
}

export async function getSession() {
	const supabase = await createSupabaseServerClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();
	return session;
}
