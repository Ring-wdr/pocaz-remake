import { describe, expect, test } from "bun:test";
import { callApi } from "../helpers/api";

describe("authGuard", () => {
	test("로그인하지 않은 요청은 리다이렉트가 아니라 401 JSON을 받는다", async () => {
		const res = await callApi("GET", "/users/me");

		expect(res.status).toBe(401);
		expect(res.body).toEqual({ error: "Unauthorized" });
	});

	test("쓰기 요청도 같은 계약을 따른다", async () => {
		const res = await callApi("POST", "/posts", {
			body: { content: "로그인 없이 쓰기" },
		});

		expect(res.status).toBe(401);
		expect(res.body).toEqual({ error: "Unauthorized" });
	});
});
