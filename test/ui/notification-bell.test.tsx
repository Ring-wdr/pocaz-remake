import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
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

const getUnreadCount = mock(
	async (): Promise<unknown> => edenResult(200, { count: 0 }),
);

mock.module("@/utils/eden", () => ({
	api: { notifications: { "unread-count": { get: getUnreadCount } } },
}));

registerDom();
// 앱 라우터 밖에서는 usePathname이 동작하지 않으므로 필요한 것만 바꾸고, 나머지 내보내기는 그대로 둔다
let pathname = "/";
const actualNavigation = await import("next/navigation");
mock.module("next/navigation", () => ({
	...actualNavigation,
	useRouter: () => ({ push: mock() }),
	usePathname: () => pathname,
}));

const { cleanup, render, waitFor, within } = await import(
	"@testing-library/react"
);
const { QueryClient, QueryClientProvider } = await import(
	"@tanstack/react-query"
);
const { NotificationBell } = await import(
	"@/components/notifications/notification-bell"
);
const { default: Header } = await import("@/components/home/header");
const { notificationUnreadCountQueryKey, notificationUnreadCountQueryOptions } =
	await import("@/lib/queries/notifications");

const unreadLabel = /^안 읽은 알림 \d+개$/;

let queryClient = new QueryClient();

function renderWith(element: React.ReactElement) {
	return render(
		<QueryClientProvider client={queryClient}>{element}</QueryClientProvider>,
	);
}

/** 안 읽은 수 요청이 끝나 쿼리가 성공 상태가 될 때까지 기다린다 */
async function untilCountLoaded() {
	await waitFor(() => expect(getUnreadCount).toHaveBeenCalledTimes(1));
	await waitFor(() =>
		expect(
			queryClient.getQueryState(notificationUnreadCountQueryKey)?.status,
		).toBe("success"),
	);
}

describe("알림 종 아이콘", () => {
	beforeEach(() => {
		queryClient = new QueryClient();
		getUnreadCount.mockReset();
		getUnreadCount.mockImplementation(async () =>
			edenResult(200, { count: 0 }),
		);
	});

	afterEach(cleanup);

	test("알림함으로 가는 링크이고, 이름은 알림이다", async () => {
		const view = renderWith(<NotificationBell />);

		const link = view.getByRole("link", { name: "알림" });
		expect(link.getAttribute("href")).toBe("/notifications");
		await untilCountLoaded();
	});

	test("안 읽은 알림 수를 뱃지로 보여 주고, 읽어 주는 이름이 붙는다", async () => {
		getUnreadCount.mockImplementation(async () =>
			edenResult(200, { count: 7 }),
		);
		const view = renderWith(<NotificationBell />);

		const badge = await view.findByLabelText("안 읽은 알림 7개");
		expect(badge.textContent).toBe("7");
		// 뱃지는 링크 안에 있다
		expect(within(view.getByRole("link")).queryByLabelText(unreadLabel)).toBe(
			badge,
		);
	});

	test.each([
		[1, "1"],
		[99, "99"],
		[100, "99+"],
		[1234, "99+"],
	])("%i개는 %s로 표기하고, 읽어 주는 이름에는 실제 개수를 쓴다", async (count, text) => {
		getUnreadCount.mockImplementation(async () => edenResult(200, { count }));
		const view = renderWith(<NotificationBell />);

		const badge = await view.findByLabelText(`안 읽은 알림 ${count}개`);
		expect(badge.textContent).toBe(text);
	});

	test("0이면 뱃지를 숨기지만 링크는 그대로 보인다", async () => {
		const view = renderWith(<NotificationBell />);

		await untilCountLoaded();
		expect(view.queryAllByLabelText(unreadLabel)).toHaveLength(0);
		expect(view.queryByRole("link", { name: "알림" })).not.toBeNull();
	});

	test("로그인하지 않아 401이면 0으로 보고 뱃지를 숨긴다", async () => {
		getUnreadCount.mockImplementation(async () =>
			edenResult(401, { error: "Unauthorized" }),
		);
		const view = renderWith(<NotificationBell />);

		await untilCountLoaded();
		expect(
			queryClient.getQueryData<number>(notificationUnreadCountQueryKey),
		).toBe(0);
		expect(view.queryAllByLabelText(unreadLabel)).toHaveLength(0);
		expect(view.queryByRole("link", { name: "알림" })).not.toBeNull();
	});

	test.each([
		["서버 오류", async () => edenResult(500, { error: "boom" })],
		["응답 본문이 없는 성공", async () => edenResult(200, undefined)],
		[
			"네트워크 오류",
			async () => {
				throw new Error("network down");
			},
		],
	])("%s이면 오류를 드러내지 않고 0으로 보고 뱃지를 숨긴다", async (_name, respond) => {
		getUnreadCount.mockImplementation(respond);
		const view = renderWith(<NotificationBell />);

		await untilCountLoaded();
		expect(
			queryClient.getQueryData<number>(notificationUnreadCountQueryKey),
		).toBe(0);
		expect(view.queryAllByLabelText(unreadLabel)).toHaveLength(0);
	});

	test("쿼리 키를 무효화하면 새로 받아 뱃지가 바뀐다", async () => {
		getUnreadCount.mockImplementation(async () =>
			edenResult(200, { count: 4 }),
		);
		const view = renderWith(<NotificationBell />);
		await view.findByLabelText("안 읽은 알림 4개");

		// 알림을 읽은 뒤의 상태: 다 읽어서 0이 된다
		getUnreadCount.mockImplementation(async () =>
			edenResult(200, { count: 0 }),
		);
		await queryClient.invalidateQueries({ queryKey: ["notifications"] });

		await waitFor(() =>
			expect(view.queryAllByLabelText(unreadLabel)).toHaveLength(0),
		);
	});
});

describe("홈 헤더의 종 아이콘", () => {
	beforeEach(() => {
		pathname = "/";
		queryClient = new QueryClient();
		getUnreadCount.mockReset();
		getUnreadCount.mockImplementation(async () =>
			edenResult(200, { count: 3 }),
		);
	});

	afterEach(cleanup);

	test("로고와 같은 헤더 줄에 종 아이콘과 안 읽은 수가 보인다", async () => {
		const view = renderWith(<Header />);

		const header = view.getByRole("banner");
		const logo = within(header).getByRole("link", { name: /POCAZ/ });
		const bell = within(header).getByRole("link", { name: "알림" });
		expect(logo.getAttribute("href")).toBe("/");
		expect(bell.getAttribute("href")).toBe("/notifications");
		expect(logo.parentElement?.parentElement).toBe(bell.parentElement);
		await within(bell).findByLabelText("안 읽은 알림 3개");
	});

	test("홈이 아닌 화면에서는 헤더를 그리지 않는다", async () => {
		pathname = "/market";
		const view = renderWith(<Header />);

		expect(view.queryAllByRole("banner")).toHaveLength(0);
		expect(view.queryAllByRole("link", { name: "알림" })).toHaveLength(0);
		// 그리지 않으니 안 읽은 수도 요청하지 않는다
		expect(getUnreadCount).not.toHaveBeenCalled();
	});
});

describe("안 읽음 수 쿼리 옵션", () => {
	test("60초마다, 포커스가 돌아올 때 새로 받고 실패해도 다시 시도하지 않는다", () => {
		const options = notificationUnreadCountQueryOptions();

		expect([...options.queryKey]).toEqual(["notifications", "unread-count"]);
		expect(options.refetchInterval).toBe(60_000);
		expect(options.refetchOnWindowFocus).toBe(true);
		expect(options.retry).toBe(false);
	});
});
