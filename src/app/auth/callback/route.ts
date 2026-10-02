import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sanitizeReturnPath } from "@/utils/url";

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get("code");
	// 쿼리는 누구나 바꿀 수 있으므로 같은 사이트의 경로만 허용한다 (다른 사이트로 보내는 리다이렉트 방지)
	const next = sanitizeReturnPath(searchParams.get("next"));

	if (code) {
		const supabase = await createSupabaseServerClient();
		const { error } = await supabase.auth.exchangeCodeForSession(code);

		if (!error) {
			const forwardedHost = request.headers.get("x-forwarded-host");
			const isLocalEnv = process.env.NODE_ENV === "development";

			if (isLocalEnv) {
				return NextResponse.redirect(`${origin}${next}`);
			}
			if (forwardedHost) {
				return NextResponse.redirect(`https://${forwardedHost}${next}`);
			}
			return NextResponse.redirect(`${origin}${next}`);
		}
	}

	// 에러 발생 시 에러 페이지로 리다이렉트
	return NextResponse.redirect(`${origin}/auth/auth-error`);
}
