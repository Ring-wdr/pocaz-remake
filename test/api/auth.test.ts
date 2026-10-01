import { describe, expect, test } from "bun:test";
import { callApi } from "../helpers/api";

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
