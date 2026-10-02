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

describe("회원 탈퇴 안내 문구", () => {
	afterEach(cleanup);

	function renderPage() {
		return render(
			<QueryClientProvider client={queryClient}>
				<SecurityPageClient loginProvider="소셜" loginEmail="a@example.com" />
			</QueryClientProvider>,
		);
	}

	// 서버의 userService.softDelete는 계정의 이메일·닉네임·프로필 사진만 지운다.
	// 글·댓글·판매글·채팅 메시지·거래 내역과 Supabase Auth 계정은 남으므로, 안내가 "모든 데이터 삭제"라고 하면 안 된다.
	test("화면 안내는 지워지는 것과 남는 것을 실제 동작대로 적는다", () => {
		const view = renderPage();

		expect(
			view.queryAllByText(
				/이메일, 닉네임, 프로필 사진은 계정에서 지워지며 복구할 수 없습니다/,
			).length,
		).toBe(1);
		expect(
			view.queryAllByText(
				/작성한 게시글, 댓글, 판매글, 채팅 메시지와 거래 내역은 삭제되지 않고 '탈퇴한 사용자'의 기록으로 남습니다/,
			).length,
		).toBe(1);
		expect(
			view.queryAllByText(/인증 정보\(이메일, 이름\)는 인증 서비스에 남습니다/)
				.length,
		).toBe(1);
		// 예전 안내(모든 데이터 영구 삭제)는 사실과 달라 남기지 않는다
		expect(view.container.textContent).not.toContain("모든 데이터");
		expect(view.container.textContent).not.toContain("영구적으로");
	});

	test("확인 모달도 지워지는 것과 남는 것을 함께 알려 준다", async () => {
		const view = renderPage();

		fireEvent.click(view.getByRole("button", { name: /회원 탈퇴/ }));
		await view.findByRole("button", { name: "탈퇴하기" });

		// 화면 안내와 모달에 한 번씩 있다
		expect(
			view.queryAllByText(
				/이메일, 닉네임, 프로필 사진은 계정에서 지워지며 복구할 수 없습니다/,
			).length,
		).toBe(2);
		expect(
			view.queryAllByText(
				/거래 내역은 삭제되지 않고 '탈퇴한 사용자'의 기록으로 남습니다/,
			).length,
		).toBe(2);
		expect(view.container.textContent).not.toContain("모든 데이터");
	});
});
