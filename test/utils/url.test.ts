import { describe, expect, test } from "bun:test";
import { loginHref, sanitizeReturnPath } from "@/utils/url";

describe("로그인 뒤 돌아갈 경로 정리", () => {
	test("같은 사이트의 경로는 그대로 돌려준다", () => {
		expect(sanitizeReturnPath("/")).toBe("/");
		expect(sanitizeReturnPath("/market/abc-123")).toBe("/market/abc-123");
		expect(sanitizeReturnPath("/community/posts/p1/edit")).toBe(
			"/community/posts/p1/edit",
		);
	});

	test("쿼리스트링과 해시도 그대로 둔다", () => {
		expect(sanitizeReturnPath("/market?groupId=g1&artistId=a1")).toBe(
			"/market?groupId=g1&artistId=a1",
		);
		expect(sanitizeReturnPath("/chat/list?marketId=m1#top")).toBe(
			"/chat/list?marketId=m1#top",
		);
	});

	test("값이 없거나 비어 있으면 홈으로 돌린다", () => {
		expect(sanitizeReturnPath(undefined)).toBe("/");
		expect(sanitizeReturnPath(null)).toBe("/");
		expect(sanitizeReturnPath("")).toBe("/");
		expect(sanitizeReturnPath("   ")).toBe("/");
	});

	test("/로 시작하지 않는 값은 경로가 아니므로 홈으로 돌린다", () => {
		expect(sanitizeReturnPath("market/abc")).toBe("/");
		expect(sanitizeReturnPath(".evil.com")).toBe("/");
		expect(sanitizeReturnPath("@evil.com")).toBe("/");
	});

	test("다른 사이트로 보내는 주소는 홈으로 돌린다", () => {
		// 프로토콜 상대 주소
		expect(sanitizeReturnPath("//evil.com")).toBe("/");
		expect(sanitizeReturnPath("//evil.com/market")).toBe("/");
		// 절대 주소
		expect(sanitizeReturnPath("https://evil.com")).toBe("/");
		expect(sanitizeReturnPath("javascript://alert(1)")).toBe("/");
		// 경로 안에 절대 주소가 들어 있는 경우
		expect(sanitizeReturnPath("/redirect?to=https://evil.com")).toBe("/");
		// 브라우저가 `\`를 `/`로 읽는다
		expect(sanitizeReturnPath("/\\evil.com")).toBe("/");
		expect(sanitizeReturnPath("/market\\evil.com")).toBe("/");
	});

	test("개행·탭 같은 제어 문자가 들어 있으면 홈으로 돌린다", () => {
		expect(sanitizeReturnPath("/market/abc\nSet-Cookie: a=b")).toBe("/");
		expect(sanitizeReturnPath("/market/abc\r\n")).toBe("/");
		// 브라우저는 주소 안의 탭·개행을 지우므로 "/\t/evil.com"은 "//evil.com"이 된다
		expect(sanitizeReturnPath("/\t/evil.com")).toBe("/");
		expect(sanitizeReturnPath("/\n/evil.com")).toBe("/");
	});

	test("로그인 화면으로 돌아오는 경로는 홈으로 돌린다", () => {
		expect(sanitizeReturnPath("/login")).toBe("/");
		expect(sanitizeReturnPath("/login?redirect=/x")).toBe("/");
		expect(sanitizeReturnPath("/login/")).toBe("/");
		expect(sanitizeReturnPath("/login#top")).toBe("/");
	});

	test("이름만 비슷한 경로는 로그인 화면으로 보지 않는다", () => {
		expect(sanitizeReturnPath("/loginhelp")).toBe("/loginhelp");
		expect(sanitizeReturnPath("/market/login")).toBe("/market/login");
	});
});

describe("로그인 화면 주소", () => {
	test("돌아갈 경로를 인코딩해서 redirect로 붙인다", () => {
		expect(loginHref("/market/abc")).toBe("/login?redirect=%2Fmarket%2Fabc");
	});

	test("쿼리스트링은 한 번 더 인코딩되어 로그인 화면에서 원래 값으로 읽힌다", () => {
		const href = loginHref("/market?groupId=g1&artistId=a1");

		expect(href).toBe(
			"/login?redirect=%2Fmarket%3FgroupId%3Dg1%26artistId%3Da1",
		);
		const params = new URL(href, "http://localhost").searchParams;
		expect(params.get("redirect")).toBe("/market?groupId=g1&artistId=a1");
		expect([...params.keys()]).toEqual(["redirect"]);
	});

	test("돌아갈 곳이 없거나 홈이면 redirect 없이 로그인 화면만 가리킨다", () => {
		expect(loginHref("/")).toBe("/login");
		expect(loginHref(null)).toBe("/login");
		expect(loginHref(undefined)).toBe("/login");
		expect(loginHref("")).toBe("/login");
	});

	test("로그인 화면 자신이나 안전하지 않은 경로는 redirect로 붙이지 않는다", () => {
		expect(loginHref("/login")).toBe("/login");
		expect(loginHref("//evil.com")).toBe("/login");
		expect(loginHref("https://evil.com")).toBe("/login");
	});
});
