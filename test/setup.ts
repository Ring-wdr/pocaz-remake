import { mock } from "bun:test";
import { createFakeSupabaseAdmin } from "./helpers/storage";

// 테스트는 실제 Supabase에 접속하지 않는다. 모듈을 불러올 때 클라이언트를 만드는 코드가 있어서 자리표시 값만 채운다.
process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.SUPABASE_SECRET_KEY ??= "test-secret-key";

// DB가 필요한 테스트는 TEST_DATABASE_URL이 있을 때만 돈다(test/helpers/db.ts).
if (process.env.TEST_DATABASE_URL) {
	process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}
process.env.DATABASE_URL ??=
	"postgresql://placeholder:placeholder@localhost:5432/placeholder";

// authGuard/optionalAuth가 쓰는 Supabase 클라이언트 대체. 요청의 x-test-user 헤더(URI 인코딩한 JSON)가 로그인한 사용자다.
mock.module("@/lib/supabase/elysia", () => ({
	createSupabaseElysiaClient(request: Request) {
		const raw = request.headers.get("x-test-user");
		const user = raw ? JSON.parse(decodeURIComponent(raw)) : null;
		return {
			auth: {
				async getClaims() {
					return {
						data: user
							? {
									claims: {
										sub: user.id,
										email: user.email,
										user_metadata: user.user_metadata ?? {},
										app_metadata: user.app_metadata ?? {},
									},
								}
							: null,
						error: null,
					};
				},
				async getSession() {
					return {
						data: { session: user ? { access_token: "test", user } : null },
						error: null,
					};
				},
			},
		};
	},
}));

// services/storage.ts의 service-role 클라이언트 대체. 업로드는 test/helpers/storage.ts에 기록된다.
mock.module("@supabase/supabase-js", () => ({
	createClient: () => createFakeSupabaseAdmin(),
}));

// StyleX는 컴파일러가 없으면 create()가 예외를 던진다. 컴포넌트 테스트에서는 스타일을 검사하지 않으므로 대체한다.
mock.module("@stylexjs/stylex", () => {
	const vars = () =>
		new Proxy({}, { get: (_, key) => `var(--${String(key)})` });
	return {
		create: <T>(styles: T) => styles,
		props: () => ({}),
		keyframes: () => "keyframes",
		defineVars: vars,
		firstThatWorks: (...values: unknown[]) => values[0],
	};
});
