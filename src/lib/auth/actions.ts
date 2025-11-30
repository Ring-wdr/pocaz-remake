"use server";

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

export async function getSession() {
	const supabase = await createSupabaseServerClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();
	return session;
}
