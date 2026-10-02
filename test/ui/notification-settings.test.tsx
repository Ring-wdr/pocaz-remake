import {
	afterEach,
	beforeEach,
	describe,
	expect,
	mock,
	spyOn,
	test,
} from "bun:test";
import { registerDom } from "../helpers/dom";

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

interface Settings {
	chat: boolean;
	like: boolean;
	comment: boolean;
	market: boolean;
	trade: boolean;
}

const allOn: Settings = {
	chat: true,
	like: true,
	comment: true,
	market: true,
	trade: true,
};

/** 서버가 가진 설정. PUT은 보낸 항목만 바꾸고 바뀐 전체 설정을 돌려준다 */
let serverSettings: Settings = { ...allOn };

const getSettings = mock(
	async (): Promise<unknown> => edenResult(200, { ...serverSettings }),
);
const putSettings = mock(async (body: Partial<Settings>): Promise<unknown> => {
	serverSettings = { ...serverSettings, ...body };
	return edenResult(200, { ...serverSettings });
});
const toast = { success: mock(), error: mock() };

mock.module("@/utils/eden", () => ({
	api: {
		users: {
			me: { "notification-settings": { get: getSettings, put: putSettings } },
		},
	},
}));
mock.module("sonner", () => ({ toast }));

registerDom();

const { cleanup, fireEvent, render, waitFor } = await import(
	"@testing-library/react"
);
const { QueryClient, QueryClientProvider } = await import(
	"@tanstack/react-query"
);
const { default: NotificationSettingsPage } = await import(
	"@/app/mypage/notifications/page.client"
);
const { notificationSettingsQueryOptions } = await import(
	"@/lib/queries/notifications"
);

const LABELS = [
	"채팅 알림",
	"좋아요 알림",
	"댓글 알림",
	"관심 상품 알림",
	"거래 알림",
];

let queryClient = new QueryClient();

function renderPage() {
	return render(
		<QueryClientProvider client={queryClient}>
			<NotificationSettingsPage />
		</QueryClientProvider>,
	);
}

type View = ReturnType<typeof renderPage>;

// 주의: waitFor 안에서 DOM 요소를 expect(...).toBeNull()로 비교하지 않는다. 실패하면 요소 전체를 문자열로 만드느라
// 이벤트 루프가 오래 막혀 화면이 갱신되지 않는다. 불리언이나 개수로 비교한다.

const switchOf = (view: View, label: string) =>
	view.getByRole("switch", { name: label });

/** 토글이 켜져 있는지(aria-checked) */
const isOn = (view: View, label: string) =>
	switchOf(view, label).getAttribute("aria-checked") === "true";

/** 설정을 불러와 토글이 그려질 때까지 기다린다 */
const loaded = (view: View) => view.findByRole("switch", { name: LABELS[0] });

/** 서버가 응답을 마쳤을 때 이어서 진행하도록, 응답 시점을 테스트가 정하는 요청을 만든다 */
function deferred() {
	let finish: (value: unknown) => void = () => {};
	const promise = new Promise<unknown>((resolve) => {
		finish = resolve;
	});
	return { promise, finish };
}

describe("알림 설정 페이지", () => {
	beforeEach(() => {
		serverSettings = { ...allOn };
		queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		for (const fn of [getSettings, putSettings, toast.success, toast.error]) {
			fn.mockClear();
		}
		localStorage.clear();
	});

	afterEach(cleanup);

	test("서버 설정대로 토글을 보여 준다", async () => {
		serverSettings = {
			chat: true,
			like: false,
			comment: true,
			market: false,
			trade: true,
		};
		const view = renderPage();
		await loaded(view);

		expect(isOn(view, "채팅 알림")).toBe(true);
		expect(isOn(view, "좋아요 알림")).toBe(false);
		expect(isOn(view, "댓글 알림")).toBe(true);
		expect(isOn(view, "관심 상품 알림")).toBe(false);
		expect(isOn(view, "거래 알림")).toBe(true);
		expect(getSettings).toHaveBeenCalledTimes(1);
	});

	test("채팅, 좋아요, 댓글, 관심 상품, 거래 알림 다섯 개만 있고 마케팅 알림은 없다", async () => {
		const view = renderPage();
		await loaded(view);

		const switches = view.getAllByRole("switch");
		expect(
			switches.map((element) => element.getAttribute("aria-label")),
		).toEqual(LABELS);
		for (const description of [
			"새 메시지가 도착하면 알림을 받습니다",
			"내 게시글에 좋아요가 달리면 알림을 받습니다",
			"내 글에 댓글이나 답글이 달리면 알림을 받습니다",
			"찜한 상품의 상태가 바뀌면 알림을 받습니다",
			"거래가 완료되거나 후기가 도착하면 알림을 받습니다",
		]) {
			expect(view.queryByText(description)).not.toBeNull();
		}
		expect(view.queryAllByText(/마케팅|이벤트|소식/)).toHaveLength(0);
	});

	test("불러오는 동안에는 자리표시를 보여 주고 토글은 없다", async () => {
		const view = renderPage();

		expect(view.container.querySelectorAll('[aria-busy="true"]')).toHaveLength(
			1,
		);
		expect(view.queryAllByRole("switch")).toHaveLength(0);

		await loaded(view);
		expect(view.container.querySelectorAll('[aria-busy="true"]')).toHaveLength(
			0,
		);
	});

	test("설정 화면에서 돌아가는 링크는 /mypage/settings다", async () => {
		const view = renderPage();

		const back = view.getByRole("link", { name: "설정으로 돌아가기" });
		expect(back.getAttribute("href")).toBe("/mypage/settings");
		expect(
			view.queryByRole("heading", { level: 1, name: "알림 설정" }),
		).not.toBeNull();
		await loaded(view);
	});

	test("브라우저에 남아 있는 예전 설정(localStorage)은 읽지도 쓰지도 않는다", async () => {
		const stale = JSON.stringify([{ id: "chat", enabled: false }]);
		localStorage.setItem("pocaz-notification-settings", stale);
		localStorage.setItem("pocaz-marketing-settings", stale);
		const view = renderPage();
		await loaded(view);

		// 서버는 모두 켜져 있으므로 화면도 그렇다
		expect(LABELS.every((label) => isOn(view, label))).toBe(true);

		fireEvent.click(switchOf(view, "채팅 알림"));
		await waitFor(() => expect(putSettings).toHaveBeenCalledTimes(1));
		expect(localStorage.getItem("pocaz-notification-settings")).toBe(stale);
		expect(localStorage.getItem("pocaz-marketing-settings")).toBe(stale);
	});

	describe("토글하면", () => {
		test("바꾼 항목만 서버에 저장하고, 저장이 끝나도 바뀐 채로 있고 토스트는 없다", async () => {
			const view = renderPage();
			await loaded(view);

			fireEvent.click(switchOf(view, "좋아요 알림"));

			await waitFor(() => expect(putSettings).toHaveBeenCalledTimes(1));
			expect(putSettings).toHaveBeenCalledWith({ like: false });
			await waitFor(() => expect(serverSettings.like).toBe(false));
			expect(isOn(view, "좋아요 알림")).toBe(false);
			// 다른 항목은 그대로다
			expect(
				["채팅 알림", "댓글 알림", "관심 상품 알림", "거래 알림"].every(
					(label) => isOn(view, label),
				),
			).toBe(true);
			expect(toast.error).not.toHaveBeenCalled();
			expect(toast.success).not.toHaveBeenCalled();
		});

		test("다시 누르면 켜는 값을 저장한다", async () => {
			serverSettings = { ...allOn, market: false };
			const view = renderPage();
			await loaded(view);

			fireEvent.click(switchOf(view, "관심 상품 알림"));

			await waitFor(() =>
				expect(putSettings).toHaveBeenCalledWith({ market: true }),
			);
			await waitFor(() => expect(isOn(view, "관심 상품 알림")).toBe(true));
		});

		test("서버가 응답하기 전에 먼저 화면이 바뀐다", async () => {
			const save = deferred();
			putSettings.mockImplementationOnce(async (body) => {
				await save.promise;
				serverSettings = { ...serverSettings, ...body };
				return edenResult(200, { ...serverSettings });
			});
			const view = renderPage();
			await loaded(view);

			fireEvent.click(switchOf(view, "채팅 알림"));

			await waitFor(() => expect(isOn(view, "채팅 알림")).toBe(false));
			expect(serverSettings.chat).toBe(true);
			save.finish(undefined);
			await waitFor(() => expect(serverSettings.chat).toBe(false));
			expect(isOn(view, "채팅 알림")).toBe(false);
		});

		test("저장하는 동안 같은 항목을 또 눌러도 한 번만 저장한다", async () => {
			const save = deferred();
			putSettings.mockImplementationOnce(async (body) => {
				await save.promise;
				serverSettings = { ...serverSettings, ...body };
				return edenResult(200, { ...serverSettings });
			});
			const view = renderPage();
			await loaded(view);

			fireEvent.click(switchOf(view, "댓글 알림"));
			await waitFor(() => expect(putSettings).toHaveBeenCalledTimes(1));
			fireEvent.click(switchOf(view, "댓글 알림"));
			fireEvent.click(switchOf(view, "댓글 알림"));
			save.finish(undefined);

			await waitFor(() => expect(serverSettings.comment).toBe(false));
			expect(putSettings).toHaveBeenCalledTimes(1);
			expect(isOn(view, "댓글 알림")).toBe(false);
		});

		test("저장이 끝나면 같은 항목을 다시 바꿀 수 있다", async () => {
			const view = renderPage();
			await loaded(view);

			fireEvent.click(switchOf(view, "거래 알림"));
			await waitFor(() => expect(serverSettings.trade).toBe(false));
			await waitFor(() => expect(isOn(view, "거래 알림")).toBe(false));
			fireEvent.click(switchOf(view, "거래 알림"));

			await waitFor(() => expect(serverSettings.trade).toBe(true));
			expect(putSettings).toHaveBeenCalledTimes(2);
			expect(isOn(view, "거래 알림")).toBe(true);
		});

		test("바꾼 값은 캐시에 남아 화면을 다시 열어도 새로 받지 않고 반영된다", async () => {
			const first = renderPage();
			await loaded(first);
			fireEvent.click(switchOf(first, "채팅 알림"));
			await waitFor(() => expect(serverSettings.chat).toBe(false));
			first.unmount();

			const second = renderPage();
			await loaded(second);

			expect(isOn(second, "채팅 알림")).toBe(false);
			expect(getSettings).toHaveBeenCalledTimes(1);
		});

		test.each([
			["서버 오류(500)", async () => edenResult(500, { error: "boom" })],
			[
				"로그인 만료(401)",
				async () => edenResult(401, { error: "Unauthorized" }),
			],
			[
				"네트워크 오류",
				async () => {
					throw new Error("network down");
				},
			],
		])(
			"%s로 저장하지 못하면 그 항목을 되돌리고 토스트로 알린다",
			async (_name, respond) => {
				const logged = spyOn(console, "error").mockImplementation(() => {});
				putSettings.mockImplementationOnce(respond);
				const view = renderPage();
				await loaded(view);

				fireEvent.click(switchOf(view, "좋아요 알림"));

				await waitFor(() =>
					expect(toast.error).toHaveBeenCalledWith("설정을 저장하지 못했어요"),
				);
				expect(toast.error).toHaveBeenCalledTimes(1);
				expect(isOn(view, "좋아요 알림")).toBe(true);
				expect(serverSettings.like).toBe(true);
				expect(logged).toHaveBeenCalled();
				logged.mockRestore();
			},
		);

		test("저장에 실패해 되돌린 뒤에는 다시 눌러 저장할 수 있다", async () => {
			const logged = spyOn(console, "error").mockImplementation(() => {});
			putSettings.mockImplementationOnce(async () =>
				edenResult(500, { error: "boom" }),
			);
			const view = renderPage();
			await loaded(view);
			fireEvent.click(switchOf(view, "채팅 알림"));
			await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
			await waitFor(() => expect(isOn(view, "채팅 알림")).toBe(true));

			fireEvent.click(switchOf(view, "채팅 알림"));

			await waitFor(() => expect(serverSettings.chat).toBe(false));
			await waitFor(() => expect(isOn(view, "채팅 알림")).toBe(false));
			expect(putSettings).toHaveBeenCalledTimes(2);
			logged.mockRestore();
		});

		test("한 항목의 저장이 실패해도 그 사이에 바꾼 다른 항목은 그대로 둔다", async () => {
			const logged = spyOn(console, "error").mockImplementation(() => {});
			const failing = deferred();
			putSettings.mockImplementationOnce(() => failing.promise);
			const view = renderPage();
			await loaded(view);

			// 채팅은 응답이 늦어지고, 그 사이 좋아요를 끈다
			fireEvent.click(switchOf(view, "채팅 알림"));
			await waitFor(() => expect(isOn(view, "채팅 알림")).toBe(false));
			fireEvent.click(switchOf(view, "좋아요 알림"));
			await waitFor(() => expect(serverSettings.like).toBe(false));
			await waitFor(() => expect(isOn(view, "좋아요 알림")).toBe(false));

			// 채팅 저장이 실패하면 채팅만 되돌아온다
			failing.finish(edenResult(500, { error: "boom" }));
			await waitFor(() => expect(isOn(view, "채팅 알림")).toBe(true));
			expect(isOn(view, "좋아요 알림")).toBe(false);
			expect(toast.error).toHaveBeenCalledTimes(1);
			logged.mockRestore();
		});
	});

	test("설정을 불러오지 못하면 오류 안내를 보여 준다", async () => {
		const logged = spyOn(console, "error").mockImplementation(() => {});
		getSettings.mockImplementationOnce(async () =>
			edenResult(500, { error: "boom" }),
		);
		const view = renderPage();

		await view.findByText("알림 설정을 불러오지 못했습니다");
		expect(view.queryByText("잠시 후 다시 시도해주세요")).not.toBeNull();
		expect(view.queryAllByRole("switch")).toHaveLength(0);
		logged.mockRestore();
	});
});

describe("알림 설정 쿼리 옵션", () => {
	test("내 정보 쿼리 키 아래에 두어 알림함 쿼리의 무효화에 휘말리지 않는다", () => {
		const options = notificationSettingsQueryOptions();

		expect([...options.queryKey]).toEqual([
			"users",
			"me",
			"notification-settings",
		]);
		expect(options.queryKey[0]).not.toBe("notifications");
	});
});
