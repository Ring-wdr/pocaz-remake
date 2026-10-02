import { afterEach, describe, expect, mock, test } from "bun:test";
import { registerDom } from "../helpers/dom";

/** 현재 경로. 테스트마다 바꿔 가며 usePathname이 돌려준다 */
let currentPathname = "/mypage/trades";

registerDom();
// 앱 라우터 밖에서는 usePathname이 값을 주지 않으므로 경로만 바꾸고, 나머지 내보내기는 그대로 둔다
const actualNavigation = await import("next/navigation");
mock.module("next/navigation", () => ({
	...actualNavigation,
	usePathname: () => currentPathname,
}));

const { cleanup, render } = await import("@testing-library/react");
const { LoginLink } = await import("@/components/auth/login-link");
const { default: Unauthorized } = await import("@/app/unauthorized");

describe("로그인 링크", () => {
	afterEach(cleanup);

	test("지금 보고 있는 경로를 redirect에 담는다", () => {
		currentPathname = "/mypage/trades";

		const view = render(<LoginLink>로그인</LoginLink>);

		expect(
			view.getByRole("link", { name: "로그인" }).getAttribute("href"),
		).toBe("/login?redirect=%2Fmypage%2Ftrades");
	});

	test("홈에서는 redirect 없이 로그인 화면으로 보낸다", () => {
		currentPathname = "/";

		const view = render(<LoginLink>로그인</LoginLink>);

		expect(
			view.getByRole("link", { name: "로그인" }).getAttribute("href"),
		).toBe("/login");
	});

	test("로그인 화면 안에서는 자기 자신으로 돌아오는 redirect를 붙이지 않는다", () => {
		currentPathname = "/login";

		const view = render(<LoginLink>로그인</LoginLink>);

		expect(
			view.getByRole("link", { name: "로그인" }).getAttribute("href"),
		).toBe("/login");
	});

	test("링크에 넘긴 나머지 속성은 그대로 전달한다", () => {
		currentPathname = "/chat";

		const view = render(
			<LoginLink className="custom" aria-label="로그인하러 가기">
				로그인
			</LoginLink>,
		);

		const link = view.getByRole("link", { name: "로그인하러 가기" });
		expect(link.className).toBe("custom");
		expect(link.getAttribute("href")).toBe("/login?redirect=%2Fchat");
	});
});

describe("로그인이 필요한 화면 안내(unauthorized)", () => {
	afterEach(cleanup);

	test("로그인하기 링크가 보던 화면으로 돌아오게 한다", () => {
		currentPathname = "/chat";

		const view = render(<Unauthorized />);

		expect(
			view.getByRole("link", { name: "로그인하기" }).getAttribute("href"),
		).toBe("/login?redirect=%2Fchat");
	});

	test("홈으로 돌아가기 링크는 그대로 홈을 가리킨다", () => {
		currentPathname = "/mypage";

		const view = render(<Unauthorized />);

		expect(
			view.getByRole("link", { name: "홈으로 돌아가기" }).getAttribute("href"),
		).toBe("/");
	});
});
