import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { registerDom } from "../helpers/dom";

const signOut = mock(async () => {});
const deleteMe = mock(async (): Promise<unknown> => edenResult(200));

/** Eden treaty 응답과 같은 모양 */
function edenResult(status: number, value?: unknown) {
	const ok = status < 400;
	return {
		data: ok ? value : null,
		error: ok ? null : { status, value },
		status,
		response: new Response(null, { status }),
		headers: {},
	};
}
const toast = { loading: mock(), success: mock(), error: mock() };

// mock.module은 같은 실행 안의 다른 테스트 파일에도 남으므로, signOut만 바꾸고 나머지 내보내기(signInWithGoogle 등)는 그대로 둔다
const actualAuthActions = await import("@/lib/auth/actions");
mock.module("@/lib/auth/actions", () => ({ ...actualAuthActions, signOut }));
mock.module("@/utils/eden", () => ({
	api: { users: { me: { delete: deleteMe } } },
}));
mock.module("sonner", () => ({ toast }));

registerDom();
const { cleanup, fireEvent, render, waitFor } = await import(
	"@testing-library/react"
);
const { QueryClient, QueryClientProvider } = await import(
	"@tanstack/react-query"
);
const { default: SecurityPageClient } = await import(
	"@/app/mypage/security/page.client"
);

let queryClient = new QueryClient();

async function deleteAccount() {
	const view = render(
		<QueryClientProvider client={queryClient}>
			<SecurityPageClient loginProvider="소셜" loginEmail="a@example.com" />
		</QueryClientProvider>,
	);
	fireEvent.click(view.getByRole("button", { name: /회원 탈퇴/ }));
	fireEvent.click(await view.findByRole("button", { name: "탈퇴하기" }));
}

describe("회원 탈퇴", () => {
	// 마지막 테스트의 화면이 남으면 다음 테스트 파일의 cleanup이 닫힌 DOM의 화면까지 지우려다 실패하므로 매번 끝에서 지운다
	afterEach(cleanup);

	beforeEach(() => {
		queryClient = new QueryClient();
		for (const fn of [signOut, deleteMe, toast.success, toast.error]) {
			fn.mockClear();
		}
	});

	test("서버가 실패하면 완료라고 하지 않고 로그아웃하지 않는다", async () => {
		deleteMe.mockResolvedValueOnce(edenResult(500, "Internal Server Error"));

		await deleteAccount();

		await waitFor(() => expect(toast.error).toHaveBeenCalled());
		expect(toast.success).not.toHaveBeenCalled();
		expect(signOut).not.toHaveBeenCalled();
	});

	test("세션이 만료됐으면(401) 다시 로그인하라고 안내한다", async () => {
		deleteMe.mockResolvedValueOnce(edenResult(401, { error: "Unauthorized" }));

		await deleteAccount();

		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith(
				expect.stringContaining("다시 로그인"),
				expect.anything(),
			),
		);
		expect(signOut).not.toHaveBeenCalled();
	});

	test("성공하면 완료를 알리고, 이전 사용자의 쿼리 캐시를 비운 뒤 로그아웃한다", async () => {
		deleteMe.mockResolvedValueOnce(edenResult(200, { message: "deleted" }));
		queryClient.setQueryData(["chat", "rooms", "all", "", "all"], {
			pages: [{ rooms: [{ id: "room-of-previous-user" }] }],
		});

		await deleteAccount();

		await waitFor(() => expect(signOut).toHaveBeenCalled());
		expect(toast.success).toHaveBeenCalled();
		expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
	});
});
