import { beforeEach, describe, expect, mock, test } from "bun:test";

const exchangeCodeForSession = mock(
	async (_code: string): Promise<{ error: unknown }> => ({ error: null }),
);

// 실제 Supabase 서버 클라이언트는 요청 쿠키가 있어야 만들 수 있으므로, 코드를 세션으로 바꾸는 부분만 대체한다
mock.module("@/lib/supabase/server", () => ({
	createSupabaseServerClient: async () => ({
		auth: { exchangeCodeForSession },
	}),
}));

const { GET } = await import("@/app/auth/callback/route");

const ORIGIN = "http://localhost:3000";

/** 로그인 콜백을 부르고 리다이렉트 위치를 돌려준다 */
async function callbackLocation(search: string): Promise<string | null> {
	const response = await GET(new Request(`${ORIGIN}/auth/callback${search}`));
	return response.headers.get("location");
}

describe("로그인 콜백의 돌아갈 경로", () => {
	beforeEach(() => {
		exchangeCodeForSession.mockReset();
		exchangeCodeForSession.mockImplementation(async () => ({ error: null }));
	});

	test("next가 같은 사이트의 경로이면 그 화면으로 보낸다", async () => {
		const search = `?code=abc&next=${encodeURIComponent("/market/market-1")}`;

		expect(await callbackLocation(search)).toBe(`${ORIGIN}/market/market-1`);
		expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
	});

	test("쿼리스트링이 있는 경로도 보존한다", async () => {
		const search = `?code=abc&next=${encodeURIComponent("/market?groupId=g1&artistId=a1")}`;

		expect(await callbackLocation(search)).toBe(
			`${ORIGIN}/market?groupId=g1&artistId=a1`,
		);
	});

	test("next가 없으면 홈으로 보낸다", async () => {
		expect(await callbackLocation("?code=abc")).toBe(`${ORIGIN}/`);
	});

	test("다른 사이트로 보내려는 next는 홈으로 바꾼다", async () => {
		for (const next of [
			"//evil.com",
			"https://evil.com",
			"/\\evil.com",
			// `${origin}${next}`로 이어 붙이면 호스트가 바뀌는 값
			".evil.com",
			"@evil.com",
		]) {
			const search = `?code=abc&next=${encodeURIComponent(next)}`;

			expect(await callbackLocation(search)).toBe(`${ORIGIN}/`);
		}
	});

	test("로그인 화면으로 되돌아가는 next는 홈으로 바꾼다", async () => {
		const search = `?code=abc&next=${encodeURIComponent("/login?redirect=/x")}`;

		expect(await callbackLocation(search)).toBe(`${ORIGIN}/`);
	});

	test("코드가 없거나 세션으로 바꾸지 못하면 next와 관계없이 오류 화면으로 보낸다", async () => {
		const next = encodeURIComponent("/market/market-1");

		expect(await callbackLocation(`?next=${next}`)).toBe(
			`${ORIGIN}/auth/auth-error`,
		);
		expect(exchangeCodeForSession).not.toHaveBeenCalled();

		exchangeCodeForSession.mockImplementation(async () => ({
			error: new Error("invalid code"),
		}));
		expect(await callbackLocation(`?code=abc&next=${next}`)).toBe(
			`${ORIGIN}/auth/auth-error`,
		);
	});
});
