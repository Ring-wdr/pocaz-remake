import { type CookieOptions, createServerClient } from "@supabase/ssr";

/**
 * Elysia API Route에서 사용할 Supabase 클라이언트 생성
 * Next.js cookies() 대신 Request 객체에서 직접 cookie를 읽음
 */
export function createSupabaseElysiaClient(request: Request) {
	const cookieHeader = request.headers.get("cookie") ?? "";

	// Cookie 문자열을 파싱하여 객체로 변환
	const cookies = parseCookies(cookieHeader);

	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return Object.entries(cookies).map(([name, value]) => ({
						name,
						value,
					}));
				},
				setAll(
					_cookiesToSet: {
						name: string;
						value: string;
						options?: CookieOptions;
					}[],
				) {
					// Elysia에서는 response header로 cookie를 설정해야 함
					// Auth Guard에서는 읽기만 하므로 빈 구현
				},
			},
		},
	);
}

/**
 * Cookie 문자열을 파싱하여 객체로 변환
 */
function parseCookies(cookieHeader: string): Record<string, string> {
	const cookies: Record<string, string> = {};

	if (!cookieHeader) return cookies;

	for (const cookie of cookieHeader.split(";")) {
		const [name, ...rest] = cookie.trim().split("=");
		if (name && rest.length > 0) {
			cookies[name] = rest.join("=");
		}
	}

	return cookies;
}
