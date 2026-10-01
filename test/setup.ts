import { mock } from "bun:test";

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

// authGuard/optionalAuth가 쓰는 Supabase 클라이언트 대체. 요청의 x-test-user 헤더(JSON)가 로그인한 사용자다.
mock.module("@/lib/supabase/elysia", () => ({
	createSupabaseElysiaClient(request: Request) {
		const raw = request.headers.get("x-test-user");
		const user = raw ? JSON.parse(raw) : null;
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
