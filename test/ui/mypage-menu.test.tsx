import { afterEach, describe, expect, mock, test } from "bun:test";
import { registerDom } from "../helpers/dom";

const signOut = mock(async () => {});

// 로그아웃 버튼이 쓰는 서버 액션은 Supabase 서버 클라이언트를 불러오므로 대체한다.
// mock.module은 같은 실행 안의 다른 테스트 파일에도 남으므로, signOut만 바꾸고 나머지 내보내기는 그대로 둔다
const actualAuthActions = await import("@/lib/auth/actions");
mock.module("@/lib/auth/actions", () => ({ ...actualAuthActions, signOut }));

registerDom();

const { cleanup, render, within } = await import("@testing-library/react");
const { QueryClient, QueryClientProvider } = await import(
	"@tanstack/react-query"
);
const { default: MenuList } = await import("@/components/mypage/menu-list");

function renderMenu() {
	return render(
		<QueryClientProvider client={new QueryClient()}>
			<MenuList />
		</QueryClientProvider>,
	);
}

/** 메뉴 구역(제목 아래 목록)의 링크들 */
function linksOf(view: ReturnType<typeof renderMenu>, sectionTitle: string) {
	const title = view.getByRole("heading", { name: sectionTitle });
	return within(title.parentElement as HTMLElement).getAllByRole("link");
}

describe("마이페이지 메뉴", () => {
	afterEach(cleanup);

	test("계정 관리 맨 위에 알림함 항목이 있고, 알림 설정은 그대로 있다", () => {
		const view = renderMenu();

		const links = linksOf(view, "계정 관리");
		expect(links.map((link) => link.textContent)).toEqual([
			"알림",
			"설정",
			"알림 설정",
			"보안",
		]);
		expect(links.map((link) => link.getAttribute("href"))).toEqual([
			"/notifications",
			"/mypage/settings",
			"/mypage/notifications",
			"/mypage/security",
		]);
	});

	test("다른 구역의 항목은 바뀌지 않았다", () => {
		const view = renderMenu();

		expect(
			linksOf(view, "거래 관리").map((link) => link.getAttribute("href")),
		).toEqual(["/mypage/sales", "/mypage/purchases", "/mypage/wishlist"]);
		expect(
			linksOf(view, "고객지원").map((link) => link.getAttribute("href")),
		).toEqual(["/support/faq", "/support/inquiry", "/support/terms"]);
	});
});
