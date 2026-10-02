import {
	afterEach,
	beforeEach,
	describe,
	expect,
	mock,
	spyOn,
	test,
} from "bun:test";
import type { ReactNode } from "react";
import type { ChatMessageView } from "@/lib/hooks/use-chat-messages";
import type { ChatMember, PaginatedMessages } from "@/types/entities";
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

const emptyPage: PaginatedMessages = {
	messages: [],
	nextCursor: null,
	hasMore: false,
};

const postMessage = mock(
	async (_body: { content: string }): Promise<unknown> => edenResult(500),
);
const getMessages = mock(
	async (): Promise<unknown> => edenResult(200, emptyPage),
);
const readRoom = mock(
	async (): Promise<unknown> =>
		edenResult(200, { lastReadAt: "2026-10-02T00:00:00.000Z" }),
);
const rooms = mock((_params: { id: string }) => ({
	messages: { post: postMessage, get: getMessages },
	read: { post: readRoom },
}));
const push = mock((_href: string) => {});
const refresh = mock(() => {});
const toast = { success: mock(), error: mock() };

mock.module("@/utils/eden", () => ({ api: { chat: { rooms } } }));
mock.module("sonner", () => ({ toast }));

// 실시간 연결(Supabase Realtime)은 만들지 않는다. 나머지 내보내기는 그대로 둔다
const actualRealtime = await import("@/lib/hooks/use-chat-realtime");
mock.module("@/lib/hooks/use-chat-realtime", () => ({
	...actualRealtime,
	useChatRealtime: () => ({
		isConnected: false,
		reconnect: () => {},
		disconnect: () => {},
	}),
	useChatPresence: () => ({ onlineUsers: [] }),
}));

// 가상 스크롤(Virtuoso)은 DOM에 크기가 없으면 메시지를 그리지 않으므로, 메시지를 그대로 늘어놓는 목록으로 바꾼다
mock.module("@/components/chat/chat-message-list", () => ({
	ChatMessageList: ({
		messages,
		renderMessage,
	}: {
		messages: ChatMessageView[];
		renderMessage: (message: ChatMessageView) => ReactNode;
	}) => (
		<div role="log">
			{messages.map((message) => (
				<div key={message.id}>{renderMessage(message)}</div>
			))}
		</div>
	),
}));

registerDom();
// 앱 라우터 밖에서는 useRouter가 예외를 던지므로 필요한 것만 바꾸고, 나머지 내보내기는 그대로 둔다
const actualNavigation = await import("next/navigation");
mock.module("next/navigation", () => ({
	...actualNavigation,
	useRouter: () => ({ push, refresh }),
}));

const { cleanup, fireEvent, render, waitFor } = await import(
	"@testing-library/react"
);
const { QueryClient, QueryClientProvider } = await import(
	"@tanstack/react-query"
);
const { default: ChatRoom } = await import("@/components/chat/chat-room");

const CONTENT = "포카 아직 있나요?";

const me: ChatMember = {
	id: "me",
	nickname: "나",
	profileImage: null,
	joinedAt: "2026-10-01T00:00:00.000Z",
};
const partner: ChatMember = { ...me, id: "partner", nickname: "상대" };

let queryClient = new QueryClient();

function renderRoom() {
	return render(
		<QueryClientProvider client={queryClient}>
			<ChatRoom
				roomId="room-1"
				roomName={null}
				members={[me, partner]}
				market={null}
				initialPage={emptyPage}
				currentUserId={me.id}
				lastReadAt={null}
			/>
		</QueryClientProvider>,
	);
}

type View = ReturnType<typeof renderRoom>;

/** 입력창에 내용을 쓰고 보내기 버튼을 누른다 */
function send(view: View, content: string) {
	fireEvent.change(view.getByPlaceholderText("메시지를 입력하세요"), {
		target: { value: content },
	});
	fireEvent.click(view.getByRole("button", { name: "메시지 보내기" }));
}

/** 화면에 있는 개수. 단언에 DOM 요소를 넘기지 않으려고 개수로 센다 */
const countOf = (view: View, text: string) => view.queryAllByText(text).length;

/** 서버가 저장해 돌려주는 메시지 */
const serverMessage = (id: string) => ({
	id,
	content: CONTENT,
	createdAt: new Date().toISOString(),
	user: { id: me.id, nickname: me.nickname, profileImage: null },
});

describe("채팅방의 전송 실패 메시지 재시도", () => {
	afterEach(cleanup);

	beforeEach(() => {
		// 처음 받아 온 메시지를 새로 받지 않게 하고, 요청 실패를 다시 시도하는 시간도 쓰지 않는다
		queryClient = new QueryClient({
			defaultOptions: { queries: { staleTime: Infinity, retry: false } },
		});
		for (const fn of [
			postMessage,
			getMessages,
			readRoom,
			rooms,
			push,
			refresh,
			toast.success,
			toast.error,
		]) {
			fn.mockClear();
		}
		// 따로 정하지 않으면 전송은 실패한다
		postMessage.mockReset();
		postMessage.mockImplementation(async () => edenResult(500));
	});

	test("재시도를 누르면 같은 내용을 다시 보내고, 보내는 동안은 전송 중으로 바뀐다", async () => {
		const view = renderRoom();
		send(view, CONTENT);
		await view.findByText("전송 실패");
		expect(postMessage).toHaveBeenCalledTimes(1);

		let finish: (value: unknown) => void = () => {};
		postMessage.mockImplementationOnce(
			() =>
				new Promise((resolve) => {
					finish = resolve;
				}),
		);
		fireEvent.click(view.getByRole("button", { name: "재시도" }));

		// 같은 말풍선이 전송 중 상태가 되고 실패 안내와 버튼은 사라진다
		await view.findByText("전송 중...");
		expect(countOf(view, "전송 실패")).toBe(0);
		expect(view.queryAllByRole("button", { name: "재시도" }).length).toBe(0);
		expect(countOf(view, CONTENT)).toBe(1);
		expect(postMessage).toHaveBeenCalledTimes(2);
		expect(postMessage.mock.calls).toEqual([
			[{ content: CONTENT }],
			[{ content: CONTENT }],
		]);

		// 서버가 받으면 서버 메시지 하나만 남는다
		finish(edenResult(201, serverMessage("server-1")));
		await waitFor(() => expect(countOf(view, "전송 중...")).toBe(0));
		expect(countOf(view, "전송 실패")).toBe(0);
		expect(countOf(view, CONTENT)).toBe(1);
		expect(postMessage).toHaveBeenCalledTimes(2);
	});

	test("재시도도 실패하면 다시 전송 실패가 되고 한 번 더 재시도할 수 있다", async () => {
		const view = renderRoom();
		send(view, CONTENT);
		await view.findByText("전송 실패");

		// 두 번째도 실패
		fireEvent.click(view.getByRole("button", { name: "재시도" }));
		await waitFor(() => expect(postMessage).toHaveBeenCalledTimes(2));
		await waitFor(() => expect(countOf(view, "전송 실패")).toBe(1));
		expect(countOf(view, CONTENT)).toBe(1);

		// 세 번째는 성공
		postMessage.mockImplementationOnce(async () =>
			edenResult(201, serverMessage("server-1")),
		);
		fireEvent.click(view.getByRole("button", { name: "재시도" }));
		await waitFor(() => expect(postMessage).toHaveBeenCalledTimes(3));
		await waitFor(() => expect(countOf(view, "전송 실패")).toBe(0));
		expect(view.queryAllByRole("button", { name: "재시도" }).length).toBe(0);
		expect(countOf(view, CONTENT)).toBe(1);
	});

	test("네트워크 오류로 다시 실패해도 같은 메시지가 실패 상태로 돌아간다", async () => {
		const logged = spyOn(console, "error").mockImplementation(() => {});
		try {
			const view = renderRoom();
			send(view, CONTENT);
			await view.findByText("전송 실패");

			postMessage.mockImplementationOnce(async () => {
				throw new Error("network down");
			});
			fireEvent.click(view.getByRole("button", { name: "재시도" }));

			await waitFor(() => expect(postMessage).toHaveBeenCalledTimes(2));
			await waitFor(() => expect(countOf(view, "전송 실패")).toBe(1));
			expect(view.queryAllByRole("button", { name: "재시도" }).length).toBe(1);
			expect(countOf(view, CONTENT)).toBe(1);
		} finally {
			logged.mockRestore();
		}
	});

	test("삭제를 누르면 다시 보내지 않고 메시지만 지운다", async () => {
		const view = renderRoom();
		send(view, CONTENT);
		await view.findByText("전송 실패");

		fireEvent.click(view.getByRole("button", { name: "삭제" }));

		await waitFor(() => expect(countOf(view, CONTENT)).toBe(0));
		expect(countOf(view, "전송 실패")).toBe(0);
		expect(toast.success).toHaveBeenCalledWith("메시지가 삭제되었습니다.");
		expect(postMessage).toHaveBeenCalledTimes(1);
	});
});
