import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import type { ChatRoomListItem } from "@/types/entities";
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
	api: { chat: { "unread-count": { get: getUnreadCount } } },
}));

registerDom();
// 앱 라우터 밖에서는 useRouter·usePathname이 동작하지 않으므로 필요한 것만 바꾸고, 나머지 내보내기는 그대로 둔다
const actualNavigation = await import("next/navigation");
mock.module("next/navigation", () => ({
	...actualNavigation,
	useRouter: () => ({ push: mock() }),
	usePathname: () => "/",
}));

const { cleanup, render, waitFor, within } = await import(
	"@testing-library/react"
);
const { QueryClient, QueryClientProvider } = await import(
	"@tanstack/react-query"
);
const { ChatListItem } = await import("@/components/chat/chat-list-item");
const { ChatUnreadBadge } = await import("@/components/chat/chat-unread-badge");
const { default: BottomMenu } = await import("@/components/home/bottom-menu");
const { chatUnreadCountQueryKey, chatUnreadCountQueryOptions } = await import(
	"@/lib/queries/chat"
);

function makeRoom(overrides: Partial<ChatRoomListItem> = {}): ChatRoomListItem {
	return {
		id: "room-1",
		name: null,
		createdAt: "2026-10-02T00:00:00.000Z",
		members: [{ id: "user-2", nickname: "상대", profileImage: null }],
		lastMessage: {
			content: "포카 아직 있나요?",
			createdAt: "2026-10-02T01:00:00.000Z",
			user: { id: "user-2", nickname: "상대" },
		},
		messageCount: 5,
		unreadCount: 0,
		market: null,
		...overrides,
	};
}

const unreadLabel = /^안 읽은 메시지 \d+개$/;

describe("채팅 목록 항목의 안 읽음 뱃지", () => {
	afterEach(cleanup);

	test("안 읽은 메시지가 있으면 개수를 뱃지로 보여 주고, 읽어 주는 이름이 붙는다", () => {
		const view = render(<ChatListItem room={makeRoom({ unreadCount: 3 })} />);

		const badge = view.getByLabelText("안 읽은 메시지 3개");
		expect(badge.textContent).toBe("3");
	});

	test("마지막 메시지와 같은 줄에 있어 시간 아래에 놓인다", () => {
		const view = render(<ChatListItem room={makeRoom({ unreadCount: 2 })} />);

		const badge = view.getByLabelText("안 읽은 메시지 2개");
		const lastMessage = view.getByText("포카 아직 있나요?");
		expect(badge.parentElement).toBe(lastMessage.parentElement);
	});

	test.each([
		[1, "1"],
		[99, "99"],
		[100, "99+"],
		[1234, "99+"],
	])("%i개는 %s로 표기하고, 읽어 주는 이름에는 실제 개수를 쓴다", (count, text) => {
		const view = render(
			<ChatListItem room={makeRoom({ unreadCount: count })} />,
		);

		const badge = view.getByLabelText(`안 읽은 메시지 ${count}개`);
		expect(badge.textContent).toBe(text);
	});

	test("안 읽은 메시지가 없으면 뱃지를 그리지 않는다", () => {
		const view = render(<ChatListItem room={makeRoom({ unreadCount: 0 })} />);

		expect(view.queryByLabelText(unreadLabel)).toBeNull();
		// 마지막 메시지는 그대로 보인다
		expect(view.queryByText("포카 아직 있나요?")).not.toBeNull();
	});
});

describe("ChatUnreadBadge", () => {
	afterEach(cleanup);

	test.each([0, -1])("%i 이하면 아무것도 그리지 않는다", (count) => {
		const view = render(<ChatUnreadBadge count={count} />);

		expect(view.container.innerHTML).toBe("");
	});
});

describe("하단 탭의 채팅 안 읽음 뱃지", () => {
	let queryClient = new QueryClient();

	function renderMenu() {
		return render(
			<QueryClientProvider client={queryClient}>
				<BottomMenu />
			</QueryClientProvider>,
		);
	}

	/** 채팅 탭 링크. 하단 탭에서 /chat/list로 가는 링크는 이것 하나다 */
	function chatTab(view: ReturnType<typeof renderMenu>) {
		const link = view
			.getAllByRole("link")
			.find((element) => element.getAttribute("href") === "/chat/list");
		if (!link) throw new Error("채팅 탭이 없습니다.");
		return link;
	}

	beforeEach(() => {
		queryClient = new QueryClient();
		getUnreadCount.mockReset();
		getUnreadCount.mockImplementation(async () =>
			edenResult(200, { count: 0 }),
		);
	});

	afterEach(cleanup);

	test("탭 이름을 한국어로 보여 주고 각 탭은 해당 화면으로 이어진다", () => {
		const view = renderMenu();

		const tabs = view
			.getAllByRole("link")
			.map((link) => [link.textContent, link.getAttribute("href")]);
		expect(tabs).toEqual([
			["홈", "/"],
			["마켓", "/market"],
			["채팅", "/chat/list"],
			["커뮤니티", "/community"],
			["마이페이지", "/mypage"],
		]);
	});

	test("안 읽은 수를 채팅 탭 아이콘에만 보여 준다", async () => {
		getUnreadCount.mockImplementation(async () =>
			edenResult(200, { count: 7 }),
		);
		const view = renderMenu();

		const badge = await within(chatTab(view)).findByLabelText(
			"안 읽은 메시지 7개",
		);
		expect(badge.textContent).toBe("7");
		// 다른 탭에는 뱃지가 없다
		expect(view.getAllByLabelText(unreadLabel)).toHaveLength(1);
		expect(view.getAllByRole("link")).toHaveLength(5);
	});

	test("99개를 넘으면 99+로 줄여 보여 준다", async () => {
		getUnreadCount.mockImplementation(async () =>
			edenResult(200, { count: 150 }),
		);
		const view = renderMenu();

		const badge = await view.findByLabelText("안 읽은 메시지 150개");
		expect(badge.textContent).toBe("99+");
	});

	test("0이면 뱃지를 숨긴다", async () => {
		const view = renderMenu();

		await waitFor(() => expect(getUnreadCount).toHaveBeenCalledTimes(1));
		await waitFor(() =>
			expect(queryClient.getQueryState(chatUnreadCountQueryKey)?.status).toBe(
				"success",
			),
		);
		expect(view.queryByLabelText(unreadLabel)).toBeNull();
		// 탭 이름은 그대로 보인다
		expect(within(chatTab(view)).queryByText("채팅")).not.toBeNull();
	});

	test("로그인하지 않아 401이면 0으로 보고 뱃지를 숨긴다", async () => {
		getUnreadCount.mockImplementation(async () =>
			edenResult(401, { error: "Unauthorized" }),
		);
		const view = renderMenu();

		await waitFor(() => expect(getUnreadCount).toHaveBeenCalledTimes(1));
		await waitFor(() =>
			expect(queryClient.getQueryData<number>(chatUnreadCountQueryKey)).toBe(0),
		);
		expect(view.queryByLabelText(unreadLabel)).toBeNull();
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
		const view = renderMenu();

		await waitFor(() => expect(getUnreadCount).toHaveBeenCalledTimes(1));
		await waitFor(() =>
			expect(queryClient.getQueryData<number>(chatUnreadCountQueryKey)).toBe(0),
		);
		expect(queryClient.getQueryState(chatUnreadCountQueryKey)?.status).toBe(
			"success",
		);
		expect(view.queryByLabelText(unreadLabel)).toBeNull();
	});

	test("쿼리 키를 무효화하면 새로 받아 뱃지가 바뀐다", async () => {
		getUnreadCount.mockImplementation(async () =>
			edenResult(200, { count: 4 }),
		);
		const view = renderMenu();
		await view.findByLabelText("안 읽은 메시지 4개");

		// 채팅방을 읽음 처리한 뒤의 상태: 다 읽어서 0이 된다
		getUnreadCount.mockImplementation(async () =>
			edenResult(200, { count: 0 }),
		);
		await queryClient.invalidateQueries({ queryKey: chatUnreadCountQueryKey });

		await waitFor(() => expect(view.queryByLabelText(unreadLabel)).toBeNull());
	});
});

describe("안 읽음 수 쿼리 옵션", () => {
	test("30초마다, 포커스가 돌아올 때 새로 받고 실패해도 다시 시도하지 않는다", () => {
		expect([...chatUnreadCountQueryOptions.queryKey]).toEqual([
			"chat",
			"unread-count",
		]);
		expect(chatUnreadCountQueryOptions.refetchInterval).toBe(30_000);
		expect(chatUnreadCountQueryOptions.refetchOnWindowFocus).toBe(true);
		expect(chatUnreadCountQueryOptions.retry).toBe(false);
	});
});
