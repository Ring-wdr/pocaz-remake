import { describe, expect, test } from "bun:test";
import { callApi } from "../helpers/api";
import { authCalls } from "../helpers/auth";

describe("공개/인증 상태 라우트", () => {
	test("헬스체크는 인증 없이 200", async () => {
		const res = await callApi("GET", "/public/health");
		expect(res.status).toBe(200);
		expect(res.body.status).toBe("ok");
	});

	test("/auth/me는 로그인 여부를 돌려준다", async () => {
		const anonymous = await callApi("GET", "/auth/me");
		expect(anonymous.body).toEqual({ authenticated: false, user: null });

		const signedIn = await callApi("GET", "/auth/me", {
			user: { id: "user-1", email: "user-1@example.com" },
		});
		expect(signedIn.body.authenticated).toBe(true);
		expect(signedIn.body.user).toMatchObject({ id: "user-1" });
	});
});

describe("인증 확인 비용", () => {
	test("공개 API는 Supabase 인증을 부르지 않는다", async () => {
		authCalls.count = 0;

		// 검색어 없는 검색은 DB 없이 빈 목록을 돌려준다
		const res = await callApi("GET", "/markets/search", {
			user: { id: "user-1" },
		});

		expect(res.status).toBe(200);
		expect(authCalls.count).toBe(0);
	});

	test("보호 API는 요청마다 한 번만 확인한다", async () => {
		authCalls.count = 0;

		const res = await callApi("GET", "/protected/profile", {
			user: { id: "user-1" },
		});

		expect(res.status).toBe(200);
		expect(authCalls.count).toBe(1);
	});
});
