import { describe, expect, test } from "bun:test";
import { normalizeEdenError } from "@/lib/elysia/client/error";

describe("normalizeEdenError", () => {
	test("422 검증 오류는 validation으로 분류한다", () => {
		const result = normalizeEdenError({
			status: 422,
			value: { type: "validation", value: {} },
		});
		expect(result.kind).toBe("validation");
	});

	test("HTTP 오류는 응답 본문의 error 메시지를 쓴다", () => {
		const result = normalizeEdenError({
			status: 403,
			value: { error: "Forbidden" },
		});
		expect(result).toMatchObject({
			kind: "http",
			status: 403,
			message: "Forbidden",
		});
	});

	test("상태 코드 없이 메시지만 있으면 네트워크 오류다", () => {
		expect(normalizeEdenError({ message: "fetch failed" }).kind).toBe(
			"network",
		);
	});

	test("값이 없으면 unknown", () => {
		expect(normalizeEdenError(null).kind).toBe("unknown");
	});
});
