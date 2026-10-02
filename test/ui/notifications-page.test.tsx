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

interface Row {
	id: string;
	type: string;
	title: string;
	body: string | null;
	href: string | null;
	readAt: string | null;
	createdAt: string;
}

const minutesAgo = (minutes: number) =>
	new Date(Date.now() - minutes * 60_000).toISOString();

function makeRow(overrides: Partial<Row> & { id: string }): Row {
	return {
		type: "comment",
		title: `제목 ${overrides.id}`,
		body: `본문 ${overrides.id}`,
		href: `/community/posts/${overrides.id}`,
		readAt: null,
		createdAt: minutesAgo(5),
		...overrides,
	};
}

/** 서버가 가진 알림. 최신순이다. 요청 처리 함수들이 이 배열을 읽고 바꾼다 */
let rows: Row[] = [];

const getNotifications = mock(
	async (args: { query: { limit?: number; cursor?: string } }) => {
		const limit = args.query.limit ?? 20;
		const start = args.query.cursor
			? rows.findIndex((row) => row.id === args.query.cursor) + 1
			: 0;
		// 캐시가 서버 쪽 객체를 그대로 쥐지 않도록 복사해서 돌려준다
		const items = rows.slice(start, start + limit).map((row) => ({ ...row }));
		const hasMore = start + limit < rows.length;
		return edenResult(200, {
			items,
			nextCursor: hasMore ? items[items.length - 1].id : null,
			hasMore,
		}) as unknown;
	},
);
const getUnreadCount = mock(
	async (): Promise<unknown> =>
		edenResult(200, {
			count: rows.filter((row) => row.readAt === null).length,
		}),
);
const patchRead = mock(async (id: string): Promise<unknown> => {
	const row = rows.find((candidate) => candidate.id === id);
	if (!row) return edenResult(404, { error: "Notification not found" });
	row.readAt ??= new Date().toISOString();
	return edenResult(200, { id, readAt: row.readAt });
});
const postReadAll = mock(async (): Promise<unknown> => {
	let updated = 0;
	for (const row of rows) {
		if (row.readAt === null) {
			row.readAt = new Date().toISOString();
			updated++;
		}
	}
	return edenResult(200, { updated });
});
const notificationById = mock((params: { id: string }) => ({
	read: { patch: () => patchRead(params.id) },
}));
const notifications = Object.assign(notificationById, {
	get: getNotifications,
	"unread-count": { get: getUnreadCount },
	"read-all": { post: postReadAll },
});
const push = mock((_href: string) => {});
const toast = { success: mock(), error: mock() };

mock.module("@/utils/eden", () => ({ api: { notifications } }));
mock.module("sonner", () => ({ toast }));

registerDom();
// 앱 라우터 밖에서는 useRouter가 예외를 던지므로 push만 가진 라우터로 바꾸고, 나머지 내보내기는 그대로 둔다
const actualNavigation = await import("next/navigation");
mock.module("next/navigation", () => ({
	...actualNavigation,
	useRouter: () => ({ push }),
}));

const { cleanup, fireEvent, render, waitFor, within } = await import(
	"@testing-library/react"
);
const { QueryClient, QueryClientProvider } = await import(
	"@tanstack/react-query"
);
const { default: NotificationsPage } = await import("@/app/notifications/page");
const { notificationsInfiniteQueryOptions, notificationUnreadCountQueryKey } =
	await import("@/lib/queries/notifications");

let queryClient = new QueryClient();

function renderPage() {
	return render(
		<QueryClientProvider client={queryClient}>
			<NotificationsPage />
		</QueryClientProvider>,
	);
}

type View = ReturnType<typeof renderPage>;

// 주의: waitFor 안에서 DOM 요소를 expect(...).toBeNull()로 비교하지 않는다. 실패하면 요소 전체를 문자열로 만드느라
// 이벤트 루프가 오래 막혀 화면이 갱신되지 않는다. 개수나 불리언으로 비교한다.

/** 항목(li) 하나. 제목으로 찾는다 */
function rowOf(view: View, title: string) {
	const item = view.getByText(title).closest("li");
	if (!item) throw new Error(`알림 "${title}"의 항목이 없습니다.`);
	return item;
}

/** 항목 안의 눌러 보는 버튼 */
function buttonOf(view: View, title: string) {
	return within(rowOf(view, title)).getByRole("button");
}

/** 안 읽음 점의 개수. 항목을 주면 그 항목 안에서만 센다 */
function unreadDots(view: View, title?: string) {
	const scope = title ? within(rowOf(view, title)) : view;
	return scope.queryAllByLabelText("안 읽음").length;
}

const markAllReadButton = (view: View) =>
	view.getByRole("button", { name: "모두 읽음" }) as HTMLButtonElement;

/** 캐시에 있는 안 읽음 수(모두 읽음 버튼의 활성 여부가 이 값을 따른다). 아직 받지 못했으면 undefined */
const unreadCountInCache = () =>
	queryClient.getQueryData<number>(notificationUnreadCountQueryKey);

/** 안 읽음 수 쿼리가 서버 값으로 채워질 때까지 기다린다 */
const untilUnreadCount = (count: number) =>
	waitFor(() => expect(unreadCountInCache()).toBe(count));

/** 서버가 응답을 마쳤을 때 이어서 진행하도록, 응답 시점을 테스트가 정하는 요청을 만든다 */
function deferred() {
	let finish: (value: unknown) => void = () => {};
	const promise = new Promise<unknown>((resolve) => {
		finish = resolve;
	});
	return { promise, finish };
}

describe("알림함 페이지", () => {
	beforeEach(() => {
		rows = [];
		queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		for (const fn of [
			getNotifications,
			getUnreadCount,
			patchRead,
			postReadAll,
			notificationById,
			push,
			toast.success,
			toast.error,
		]) {
			fn.mockClear();
		}
	});

	afterEach(cleanup);

	test("제목이 알림인 헤더에 모두 읽음 버튼이 있다", async () => {
		rows = [makeRow({ id: "n1" })];
		const view = renderPage();

		const header = view.getByRole("banner");
		expect(
			within(header).queryByRole("heading", { level: 1, name: "알림" }),
		).not.toBeNull();
		expect(
			within(header).queryByRole("button", { name: "모두 읽음" }),
		).not.toBeNull();
		await view.findByText("제목 n1");
	});

	test("불러오는 동안에는 자리표시를 보여 주고, 끝나면 알림을 그린다", async () => {
		rows = [makeRow({ id: "n1" })];
		const view = renderPage();

		expect(view.container.querySelectorAll('[aria-busy="true"]')).toHaveLength(
			1,
		);
		expect(view.queryAllByText("제목 n1")).toHaveLength(0);

		await view.findByText("제목 n1");
		expect(view.container.querySelectorAll('[aria-busy="true"]')).toHaveLength(
			0,
		);
	});

	test("제목, 본문, 상대 시간을 보여 준다", async () => {
		rows = [
			makeRow({
				id: "n1",
				title: "김팬님이 댓글을 남겼어요",
				body: "르세라핌 포카 구해요",
				createdAt: minutesAgo(5),
			}),
			makeRow({ id: "n2", title: "지난 알림", createdAt: minutesAgo(180) }),
		];
		const view = renderPage();
		await view.findByText("김팬님이 댓글을 남겼어요");

		const first = within(rowOf(view, "김팬님이 댓글을 남겼어요"));
		expect(first.queryByText("르세라핌 포카 구해요")).not.toBeNull();
		expect(first.queryByText("5분 전")).not.toBeNull();
		const second = within(rowOf(view, "지난 알림"));
		expect(second.queryByText("3시간 전")).not.toBeNull();
	});

	test("알림 종류마다 다른 아이콘을 보여 주고, 모르는 종류는 종 아이콘이다", async () => {
		const icons: [string, string][] = [
			["comment", "message-circle"],
			["like", "heart"],
			["chat", "message-circle-heart"],
			["market", "store"],
			["trade", "shopping-bag"],
			["review", "star"],
			["something-new", "bell"],
		];
		rows = icons.map(([type]) => makeRow({ id: type, type }));
		const view = renderPage();
		await view.findByText("제목 comment");

		for (const [type, iconName] of icons) {
			const icon = rowOf(view, `제목 ${type}`).querySelector("svg");
			expect(icon?.getAttribute("class")).toContain(`lucide-${iconName}`);
		}
	});

	test("안 읽은 알림에만 안 읽음 점이 있다", async () => {
		rows = [
			makeRow({ id: "unread" }),
			makeRow({ id: "read", readAt: minutesAgo(1) }),
		];
		const view = renderPage();
		await view.findByText("제목 unread");

		expect(unreadDots(view, "제목 unread")).toBe(1);
		expect(unreadDots(view, "제목 read")).toBe(0);
		expect(unreadDots(view)).toBe(1);
	});

	test("본문이 없는 알림은 제목만 보여 준다", async () => {
		rows = [makeRow({ id: "n1", body: null })];
		const view = renderPage();
		await view.findByText("제목 n1");

		expect(view.queryAllByText("본문 n1")).toHaveLength(0);
		expect(unreadDots(view, "제목 n1")).toBe(1);
	});

	describe("알림을 누르면", () => {
		test("읽음 처리를 요청하고 알림함 쿼리를 새로 받은 뒤 href로 이동한다", async () => {
			rows = [
				makeRow({ id: "n1", href: "/community/posts/post-1" }),
				makeRow({ id: "n2" }),
			];
			const invalidate = spyOn(queryClient, "invalidateQueries");
			const view = renderPage();
			await view.findByText("제목 n1");

			fireEvent.click(buttonOf(view, "제목 n1"));

			await waitFor(() =>
				expect(push).toHaveBeenCalledWith("/community/posts/post-1"),
			);
			expect(push).toHaveBeenCalledTimes(1);
			expect(notificationById).toHaveBeenCalledWith({ id: "n1" });
			expect(patchRead).toHaveBeenCalledTimes(1);
			// 이동하기 전에 목록과 종 아이콘의 안 읽음 수를 새로 받도록 무효화한다
			expect(invalidate).toHaveBeenCalledWith({ queryKey: ["notifications"] });
			expect(invalidate.mock.invocationCallOrder[0]).toBeLessThan(
				push.mock.invocationCallOrder[0],
			);
			// 서버 값으로 맞춘 뒤에도 읽은 것으로 보이고, 다른 알림은 그대로다
			await waitFor(() => expect(unreadDots(view, "제목 n1")).toBe(0));
			expect(unreadDots(view, "제목 n2")).toBe(1);
		});

		test("요청이 끝나기 전에 먼저 읽음으로 보이고 안 읽음 수를 하나 줄인다", async () => {
			rows = [makeRow({ id: "n1" }), makeRow({ id: "n2" })];
			const view = renderPage();
			await view.findByText("제목 n1");
			await untilUnreadCount(2);
			const patch = deferred();
			patchRead.mockImplementationOnce(() => patch.promise);

			fireEvent.click(buttonOf(view, "제목 n1"));

			// 응답이 오기 전인데도 점이 사라지고 수가 줄었다
			await waitFor(() => expect(unreadDots(view, "제목 n1")).toBe(0));
			expect(unreadCountInCache()).toBe(1);
			expect(unreadDots(view, "제목 n2")).toBe(1);
			expect(push).not.toHaveBeenCalled();

			// 서버도 읽음 처리하고 응답하면 이동한다
			rows[0].readAt = new Date().toISOString();
			patch.finish(edenResult(200, { id: "n1", readAt: rows[0].readAt }));
			await waitFor(() =>
				expect(push).toHaveBeenCalledWith("/community/posts/n1"),
			);
		});

		test("요청이 진행 중일 때 다시 눌러도 한 번만 요청하고 한 번만 이동한다", async () => {
			rows = [makeRow({ id: "n1" })];
			const view = renderPage();
			await view.findByText("제목 n1");
			const patch = deferred();
			patchRead.mockImplementationOnce(() => patch.promise);
			const button = buttonOf(view, "제목 n1");

			fireEvent.click(button);
			await waitFor(() => expect(patchRead).toHaveBeenCalledTimes(1));
			fireEvent.click(button);
			fireEvent.click(button);
			patch.finish(
				edenResult(200, { id: "n1", readAt: new Date().toISOString() }),
			);

			await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
			expect(patchRead).toHaveBeenCalledTimes(1);
		});

		test("요청을 기다리는 사이 다른 화면으로 떠났으면 이동하지 않고, 목록은 그래도 새로 받는다", async () => {
			rows = [makeRow({ id: "n1" })];
			const invalidate = spyOn(queryClient, "invalidateQueries");
			const view = renderPage();
			await view.findByText("제목 n1");
			const patch = deferred();
			patchRead.mockImplementationOnce(() => patch.promise);

			fireEvent.click(buttonOf(view, "제목 n1"));
			await waitFor(() => expect(patchRead).toHaveBeenCalledTimes(1));
			view.unmount();
			rows[0].readAt = new Date().toISOString();
			patch.finish(edenResult(200, { id: "n1", readAt: rows[0].readAt }));

			await waitFor(() =>
				expect(invalidate).toHaveBeenCalledWith({
					queryKey: ["notifications"],
				}),
			);
			expect(push).not.toHaveBeenCalled();
		});

		test("href가 없으면 읽음 처리만 하고 이동하지 않는다", async () => {
			rows = [makeRow({ id: "n1", href: null })];
			const view = renderPage();
			await view.findByText("제목 n1");

			fireEvent.click(buttonOf(view, "제목 n1"));

			await waitFor(() => expect(unreadDots(view, "제목 n1")).toBe(0));
			expect(patchRead).toHaveBeenCalledTimes(1);
			// 읽음 처리 뒤 안 읽음 수를 새로 받는다(처음 한 번과 합쳐 두 번 이상)
			await waitFor(() =>
				expect(getUnreadCount.mock.calls.length).toBeGreaterThan(1),
			);
			expect(push).not.toHaveBeenCalled();
		});

		test("이미 읽은 알림은 읽음 처리를 다시 요청하지 않고 이동만 한다", async () => {
			rows = [
				makeRow({
					id: "n1",
					readAt: minutesAgo(1),
					href: "/mypage/purchases",
				}),
			];
			const view = renderPage();
			await view.findByText("제목 n1");

			fireEvent.click(buttonOf(view, "제목 n1"));

			await waitFor(() =>
				expect(push).toHaveBeenCalledWith("/mypage/purchases"),
			);
			expect(notificationById).not.toHaveBeenCalled();
			expect(patchRead).not.toHaveBeenCalled();
		});

		test("읽음 처리에 실패해도 이동하고, 목록은 서버 값(안 읽음)으로 되돌아온다", async () => {
			const logged = spyOn(console, "error").mockImplementation(() => {});
			rows = [makeRow({ id: "n1", href: "/market/market-1" })];
			patchRead.mockImplementationOnce(async () =>
				edenResult(500, { error: "boom" }),
			);
			const view = renderPage();
			await view.findByText("제목 n1");

			fireEvent.click(buttonOf(view, "제목 n1"));

			await waitFor(() =>
				expect(push).toHaveBeenCalledWith("/market/market-1"),
			);
			// 서버는 아직 안 읽은 상태이므로 새로 받은 목록에서 점이 다시 나타난다
			await waitFor(() => expect(unreadDots(view, "제목 n1")).toBe(1));
			expect(rows[0].readAt).toBeNull();
			logged.mockRestore();
		});

		test("네트워크 오류로 요청이 던져져도 이동한다", async () => {
			const logged = spyOn(console, "error").mockImplementation(() => {});
			rows = [makeRow({ id: "n1" })];
			patchRead.mockImplementationOnce(async () => {
				throw new Error("network down");
			});
			const view = renderPage();
			await view.findByText("제목 n1");

			fireEvent.click(buttonOf(view, "제목 n1"));

			await waitFor(() =>
				expect(push).toHaveBeenCalledWith("/community/posts/n1"),
			);
			expect(logged).toHaveBeenCalled();
			logged.mockRestore();
		});
	});

	describe("모두 읽음", () => {
		test("안 읽은 알림이 있으면 눌러서 모두 읽음 처리하고, 끝나면 목록과 버튼이 바뀐다", async () => {
			rows = [
				makeRow({ id: "n1" }),
				makeRow({ id: "n2" }),
				makeRow({ id: "n3", readAt: minutesAgo(1) }),
			];
			const invalidate = spyOn(queryClient, "invalidateQueries");
			const view = renderPage();
			await view.findByText("제목 n1");
			await waitFor(() => expect(markAllReadButton(view).disabled).toBe(false));
			expect(unreadDots(view)).toBe(2);

			fireEvent.click(markAllReadButton(view));

			await waitFor(() => expect(postReadAll).toHaveBeenCalledTimes(1));
			await waitFor(() =>
				expect(invalidate).toHaveBeenCalledWith({
					queryKey: ["notifications"],
				}),
			);
			await waitFor(() => expect(unreadDots(view)).toBe(0));
			await waitFor(() => expect(markAllReadButton(view).disabled).toBe(true));
			expect(toast.error).not.toHaveBeenCalled();
			expect(push).not.toHaveBeenCalled();
		});

		test("안 읽은 알림이 없으면 비활성이라 눌러도 요청하지 않는다", async () => {
			rows = [makeRow({ id: "n1", readAt: minutesAgo(1) })];
			const view = renderPage();
			await view.findByText("제목 n1");
			await untilUnreadCount(0);

			expect(markAllReadButton(view).disabled).toBe(true);
			fireEvent.click(markAllReadButton(view));
			expect(postReadAll).not.toHaveBeenCalled();
		});

		test("알림이 하나도 없어도 비활성이다", async () => {
			const view = renderPage();
			await view.findByText("아직 알림이 없어요");
			await untilUnreadCount(0);

			expect(markAllReadButton(view).disabled).toBe(true);
		});

		test("실패하면 토스트로 알리고 서버 값으로 다시 맞춘다", async () => {
			rows = [makeRow({ id: "n1" })];
			postReadAll.mockImplementationOnce(async () =>
				edenResult(500, { error: "boom" }),
			);
			const view = renderPage();
			await view.findByText("제목 n1");
			await waitFor(() => expect(markAllReadButton(view).disabled).toBe(false));

			fireEvent.click(markAllReadButton(view));

			await waitFor(() =>
				expect(toast.error).toHaveBeenCalledWith("모두 읽음 처리하지 못했어요"),
			);
			// 서버는 아직 안 읽은 상태이므로 점과 활성 버튼이 그대로다
			await waitFor(() => expect(markAllReadButton(view).disabled).toBe(false));
			expect(unreadDots(view)).toBe(1);
		});

		test("요청이 진행 중인 동안에는 비활성이라 한 번만 요청한다", async () => {
			rows = [makeRow({ id: "n1" })];
			const post = deferred();
			postReadAll.mockImplementationOnce(() => post.promise);
			const view = renderPage();
			await view.findByText("제목 n1");
			await waitFor(() => expect(markAllReadButton(view).disabled).toBe(false));

			fireEvent.click(markAllReadButton(view));
			await waitFor(() => expect(markAllReadButton(view).disabled).toBe(true));
			fireEvent.click(markAllReadButton(view));

			rows[0].readAt = new Date().toISOString();
			post.finish(edenResult(200, { updated: 1 }));
			await waitFor(() => expect(unreadDots(view)).toBe(0));
			expect(postReadAll).toHaveBeenCalledTimes(1);
		});
	});

	test("알림이 없으면 안내 문구를 보여 준다", async () => {
		const view = renderPage();

		await view.findByText("아직 알림이 없어요");
		expect(
			view.queryByText("댓글, 좋아요, 거래, 채팅 소식이 여기에 모여요"),
		).not.toBeNull();
		expect(view.queryAllByRole("listitem")).toHaveLength(0);
	});

	test("알림을 불러오지 못하면 오류 안내를 보여 준다", async () => {
		const logged = spyOn(console, "error").mockImplementation(() => {});
		getNotifications.mockImplementationOnce(
			async () => edenResult(500, { error: "boom" }) as unknown,
		);
		const view = renderPage();

		await view.findByText("알림을 불러오지 못했습니다");
		expect(view.queryByText("잠시 후 다시 시도해주세요")).not.toBeNull();
		expect(view.queryAllByText("아직 알림이 없어요")).toHaveLength(0);
		logged.mockRestore();
	});
});

describe("알림 더 보기", () => {
	class FakeIntersectionObserver {
		static instances: FakeIntersectionObserver[] = [];
		observed: Element[] = [];
		disconnected = false;
		constructor(private callback: IntersectionObserverCallback) {
			FakeIntersectionObserver.instances.push(this);
		}
		observe(element: Element) {
			this.observed.push(element);
		}
		unobserve() {}
		disconnect() {
			this.disconnected = true;
		}
		takeRecords() {
			return [];
		}
		/** 목록 끝의 표지가 화면에 보이게 된 것처럼 알린다 */
		reveal() {
			this.callback(
				[{ isIntersecting: true } as IntersectionObserverEntry],
				this as unknown as IntersectionObserver,
			);
		}
	}

	const originalObserver = globalThis.IntersectionObserver;

	beforeEach(() => {
		FakeIntersectionObserver.instances = [];
		globalThis.IntersectionObserver =
			FakeIntersectionObserver as unknown as typeof IntersectionObserver;
		queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		getNotifications.mockClear();
		// 한 페이지는 20건이라 25건이면 두 페이지다. 숫자가 클수록 오래된 알림이다
		rows = Array.from({ length: 25 }, (_, index) =>
			makeRow({ id: `n${index + 1}`, readAt: minutesAgo(1) }),
		);
	});

	afterEach(() => {
		cleanup();
		globalThis.IntersectionObserver = originalObserver;
	});

	/**
	 * 목록 끝 표지(목록 바로 뒤 요소)를 지켜보는 관찰자. next/link도 같은 API로 링크를 관찰하므로 표지를 기준으로 고른다.
	 * 요소가 담긴 배열을 비교하면 실패 메시지가 거대해지므로 호출하는 쪽은 length만 비교한다.
	 */
	const sentinelObservers = (view: View) => {
		const sentinel = view.container.querySelector("ul")?.nextElementSibling;
		return FakeIntersectionObserver.instances.filter(
			(observer) =>
				!observer.disconnected &&
				sentinel != null &&
				observer.observed.includes(sentinel),
		);
	};

	test("목록 끝이 보이면 nextCursor로 다음 페이지를 받아 이어 붙인다", async () => {
		const view = renderPage();
		await view.findByText("제목 n1");
		expect(view.getAllByRole("listitem")).toHaveLength(20);
		expect(getNotifications).toHaveBeenCalledTimes(1);
		expect(getNotifications).toHaveBeenLastCalledWith({ query: { limit: 20 } });

		await waitFor(() => expect(sentinelObservers(view).length).toBe(1));
		sentinelObservers(view)[0].reveal();

		await view.findByText("제목 n25");
		expect(view.getAllByRole("listitem")).toHaveLength(25);
		expect(getNotifications).toHaveBeenCalledTimes(2);
		expect(getNotifications).toHaveBeenLastCalledWith({
			query: { limit: 20, cursor: "n20" },
		});
	});

	test("다음 페이지가 없으면 목록 끝을 관찰하지 않고 더 받지 않는다", async () => {
		rows = rows.slice(0, 3);
		const view = renderPage();
		await view.findByText("제목 n1");

		expect(view.getAllByRole("listitem")).toHaveLength(3);
		expect(sentinelObservers(view).length).toBe(0);
		expect(getNotifications).toHaveBeenCalledTimes(1);
	});
});

describe("알림 목록 쿼리 옵션", () => {
	test("알림함 키 아래에 두어 알림 쿼리의 무효화 한 번에 안 읽음 수와 함께 새로 받는다", () => {
		const options = notificationsInfiniteQueryOptions();

		expect([...options.queryKey]).toEqual(["notifications", "list"]);
		expect(options.queryKey.slice(0, 1)).toEqual(["notifications"]);
		expect([...notificationUnreadCountQueryKey].slice(0, 1)).toEqual([
			"notifications",
		]);
		expect(options.refetchOnWindowFocus).toBe(true);
	});
});
