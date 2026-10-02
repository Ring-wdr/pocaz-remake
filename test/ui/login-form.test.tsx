import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { registerDom } from "../helpers/dom";

type SignInResult = { error?: string } | undefined;

const signInWithGoogle = mock(
	async (
		_prevState: SignInResult,
		_formData?: FormData,
	): Promise<SignInResult> => undefined,
);

registerDom();
// 실제 액션은 Supabase 서버 클라이언트로 OAuth 주소를 만든다. 폼이 보낸 값만 보면 되므로 signInWithGoogle만 바꾸고,
// mock.module은 다른 테스트 파일에도 남으므로 나머지 내보내기는 그대로 둔다
const actualAuthActions = await import("@/lib/auth/actions");
mock.module("@/lib/auth/actions", () => ({
	...actualAuthActions,
	signInWithGoogle,
}));

const { cleanup, fireEvent, render, waitFor } = await import(
	"@testing-library/react"
);
const { default: LoginForm } = await import("@/app/login/login-form");

/** 로그인 버튼을 눌러 폼을 제출하고, 액션이 받은 FormData를 돌려준다 */
async function submitLoginForm(next: string): Promise<FormData | undefined> {
	const view = render(<LoginForm next={next} />);
	const button = view.getByRole("button", { name: "Google로 계속하기" });
	fireEvent.click(button);
	await waitFor(() => expect(signInWithGoogle).toHaveBeenCalledTimes(1));
	// 액션이 끝나 버튼이 다시 켜질 때까지 기다린다 (진행 중인 폼 액션을 둔 채 화면을 지우지 않는다)
	await waitFor(() => expect(button.getAttribute("aria-busy")).toBe("false"));
	return signInWithGoogle.mock.calls[0]?.[1];
}

describe("로그인 폼", () => {
	afterEach(cleanup);

	beforeEach(() => {
		signInWithGoogle.mockReset();
		signInWithGoogle.mockImplementation(async () => undefined);
	});

	test("돌아갈 경로를 숨은 next 입력으로 서버 액션에 보낸다", async () => {
		const formData = await submitLoginForm("/market/market-1");

		expect(formData?.get("next")).toBe("/market/market-1");
	});

	test("쿼리스트링이 있는 경로도 그대로 보낸다", async () => {
		const formData = await submitLoginForm("/market?groupId=g1&artistId=a1");

		expect(formData?.get("next")).toBe("/market?groupId=g1&artistId=a1");
	});

	test("돌아갈 곳이 없으면 홈(/)을 보낸다", async () => {
		const formData = await submitLoginForm("/");

		expect(formData?.get("next")).toBe("/");
	});

	test("로그인에 실패하면 서버가 돌려준 오류를 알린다", async () => {
		signInWithGoogle.mockImplementation(async () => ({
			error: "Google 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.",
		}));

		const view = render(<LoginForm next="/chat" />);
		fireEvent.click(view.getByRole("button", { name: "Google로 계속하기" }));

		expect((await view.findByRole("alert")).textContent).toContain(
			"Google 로그인에 실패했습니다",
		);
	});
});
