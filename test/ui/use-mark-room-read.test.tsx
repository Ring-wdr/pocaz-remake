import {
	afterEach,
	beforeEach,
	describe,
	expect,
	jest,
	mock,
	spyOn,
	test,
} from "bun:test";
import type { ReactNode } from "react";
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

const readPost = mock(
	async (): Promise<unknown> =>
		edenResult(200, { lastReadAt: "2026-10-02T00:00:00.000Z" }),
);
const rooms = mock((_params: { id: string }) => ({ read: { post: readPost } }));

mock.module("@/utils/eden", () => ({ api: { chat: { rooms } } }));

registerDom();

const { act, cleanup, renderHook } = await import("@testing-library/react");
const { QueryClient, QueryClientProvider } = await import(
	"@tanstack/react-query"
);
const { MARK_READ_THROTTLE_MS, useMarkRoomRead } = await import(
	"@/lib/hooks/use-mark-room-read"
);

interface HookProps {
	roomId: string;
	isAtBottom: boolean;
	latestIncomingMessageId: string | null;
}

const initialProps: HookProps = {
	roomId: "room-1",
	isAtBottom: true,
	latestIncomingMessageId: "m1",
};

let queryClient = new QueryClient();

function renderMarkRead(props: HookProps = initialProps) {
	return renderHook((hookProps: HookProps) => useMarkRoomRead(hookProps), {
		initialProps: props,
		wrapper: ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		),
	});
}

/** 보내 둔 요청이 끝나 무효화까지 가도록 마이크로태스크를 비운다 */
const flush = () =>
	act(async () => {
		for (let i = 0; i < 10; i++) await Promise.resolve();
	});

// 실행기(Bun 1.3.14)에는 있지만 설치된 bun-types(1.3.3)에는 선언이 없다
const fakeClock = jest as unknown as {
	advanceTimersByTime: (ms: number) => void;
};

/** 가짜 시계를 앞으로 돌린다 */
const advance = (ms: number) =>
	act(async () => {
		fakeClock.advanceTimersByTime(ms);
		for (let i = 0; i < 10; i++) await Promise.resolve();
	});

function setVisibility(state: "visible" | "hidden") {
	Object.defineProperty(document, "visibilityState", {
		configurable: true,
		get: () => state,
	});
}

const becomeVisible = () => {
	setVisibility("visible");
	return act(async () => {
		document.dispatchEvent(new Event("visibilitychange"));
		for (let i = 0; i < 10; i++) await Promise.resolve();
	});
};

describe("채팅방 읽음 처리 훅", () => {
	beforeEach(() => {
		jest.useFakeTimers();
		queryClient = new QueryClient();
		rooms.mockClear();
		readPost.mockReset();
		readPost.mockImplementation(async () =>
			edenResult(200, { lastReadAt: "2026-10-02T00:00:00.000Z" }),
		);
		setVisibility("visible");
	});

	afterEach(() => {
		cleanup();
		jest.useRealTimers();
		Reflect.deleteProperty(document, "visibilityState");
	});

	test("방에 들어오면 한 번 요청하고, 끝나면 목록·안 읽음 수·알림 쿼리를 무효화한다", async () => {
		const invalidate = spyOn(queryClient, "invalidateQueries");

		renderMarkRead();
		await flush();

		expect(rooms).toHaveBeenCalledWith({ id: "room-1" });
		expect(readPost).toHaveBeenCalledTimes(1);
		expect(invalidate).toHaveBeenCalledTimes(3);
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["chat", "rooms"] });
		expect(invalidate).toHaveBeenCalledWith({
			queryKey: ["chat", "unread-count"],
		});
		// 서버가 이 방의 채팅 알림도 읽음 처리하므로 알림함과 종 아이콘도 새로 받는다
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["notifications"] });
	});

	test("맨 아래가 아니면 요청하지 않고, 맨 아래로 돌아오면 요청한다", async () => {
		const view = renderMarkRead({ ...initialProps, isAtBottom: false });
		await flush();
		expect(readPost).not.toHaveBeenCalled();

		view.rerender({ ...initialProps, isAtBottom: true });
		await flush();

		expect(readPost).toHaveBeenCalledTimes(1);
	});

	test("위로 스크롤해 둔 동안 온 메시지는 맨 아래로 돌아올 때 읽음 처리한다", async () => {
		const view = renderMarkRead();
		await flush();
		expect(readPost).toHaveBeenCalledTimes(1);
		await advance(MARK_READ_THROTTLE_MS * 2);

		view.rerender({
			...initialProps,
			isAtBottom: false,
			latestIncomingMessageId: "m2",
		});
		await flush();
		expect(readPost).toHaveBeenCalledTimes(1);

		view.rerender({
			...initialProps,
			isAtBottom: true,
			latestIncomingMessageId: "m2",
		});
		await flush();

		expect(readPost).toHaveBeenCalledTimes(2);
	});

	test("맨 아래에서 상대의 새 메시지가 오면 다시 요청하되 1초 안에는 한 번만 보낸다", async () => {
		const view = renderMarkRead();
		await flush();
		expect(readPost).toHaveBeenCalledTimes(1);

		// 간격 안에 메시지가 연달아 와도 바로 보내지 않고, 끝에 한 번만 보낸다
		await advance(100);
		view.rerender({ ...initialProps, latestIncomingMessageId: "m2" });
		await advance(100);
		view.rerender({ ...initialProps, latestIncomingMessageId: "m3" });
		await advance(100);
		view.rerender({ ...initialProps, latestIncomingMessageId: "m4" });
		await flush();
		expect(readPost).toHaveBeenCalledTimes(1);

		await advance(MARK_READ_THROTTLE_MS);
		expect(readPost).toHaveBeenCalledTimes(2);

		// 더 기다려도 새로 보내지 않는다
		await advance(MARK_READ_THROTTLE_MS * 3);
		expect(readPost).toHaveBeenCalledTimes(2);

		// 간격이 지난 뒤의 새 메시지는 바로 보낸다
		view.rerender({ ...initialProps, latestIncomingMessageId: "m5" });
		await flush();
		expect(readPost).toHaveBeenCalledTimes(3);
	});

	test("새 메시지가 없으면 맨 아래 → 위 → 맨 아래로 바뀌어도 되풀이하지 않는다", async () => {
		const view = renderMarkRead();
		await flush();

		view.rerender({ ...initialProps, isAtBottom: false });
		view.rerender({ ...initialProps, isAtBottom: true });
		await advance(MARK_READ_THROTTLE_MS * 3);

		expect(readPost).toHaveBeenCalledTimes(1);
	});

	test("보이지 않는 탭에서는 요청하지 않고, 다시 보일 때 요청한다", async () => {
		setVisibility("hidden");
		const view = renderMarkRead();
		await flush();
		expect(readPost).not.toHaveBeenCalled();

		// 안 보이는 동안 온 메시지도 읽은 것으로 치지 않는다
		view.rerender({ ...initialProps, latestIncomingMessageId: "m2" });
		await advance(MARK_READ_THROTTLE_MS * 2);
		expect(readPost).not.toHaveBeenCalled();

		await becomeVisible();

		expect(readPost).toHaveBeenCalledTimes(1);
	});

	test("탭이 돌아와도 위로 스크롤해 둔 채라면 요청하지 않는다", async () => {
		setVisibility("hidden");
		renderMarkRead({ ...initialProps, isAtBottom: false });

		await becomeVisible();

		expect(readPost).not.toHaveBeenCalled();
	});

	test("탭이 다시 보이면 새 메시지가 없어도 요청한다", async () => {
		renderMarkRead();
		await flush();
		await advance(MARK_READ_THROTTLE_MS * 2);
		expect(readPost).toHaveBeenCalledTimes(1);

		await becomeVisible();

		expect(readPost).toHaveBeenCalledTimes(2);
	});

	test("숨겨진 탭이 보일 때는 요청 간격도 지킨다", async () => {
		renderMarkRead();
		await flush();
		expect(readPost).toHaveBeenCalledTimes(1);

		await becomeVisible();
		expect(readPost).toHaveBeenCalledTimes(1);

		await advance(MARK_READ_THROTTLE_MS);
		expect(readPost).toHaveBeenCalledTimes(2);
	});

	test("간격을 기다리는 요청이 있는 채로 방을 떠나면 바로 보내고, 없으면 보내지 않는다", async () => {
		const stay = renderMarkRead();
		await flush();
		stay.unmount();
		await flush();
		expect(readPost).toHaveBeenCalledTimes(1);

		readPost.mockClear();
		await advance(MARK_READ_THROTTLE_MS * 2);
		const leave = renderMarkRead();
		await flush();
		expect(readPost).toHaveBeenCalledTimes(1);
		leave.rerender({ ...initialProps, latestIncomingMessageId: "m2" });
		await flush();
		expect(readPost).toHaveBeenCalledTimes(1);

		leave.unmount();
		await flush();

		expect(readPost).toHaveBeenCalledTimes(2);
		await advance(MARK_READ_THROTTLE_MS * 3);
		expect(readPost).toHaveBeenCalledTimes(2);
	});

	test("요청이 실패하면 무효화하지 않고 사용자에게도 알리지 않으며, 다음 기회에 다시 시도한다", async () => {
		const invalidate = spyOn(queryClient, "invalidateQueries");
		readPost.mockImplementationOnce(async () =>
			edenResult(500, { error: "boom" }),
		);
		const view = renderMarkRead();
		await flush();
		expect(readPost).toHaveBeenCalledTimes(1);
		expect(invalidate).not.toHaveBeenCalled();
		await advance(MARK_READ_THROTTLE_MS * 2);

		// 새 메시지가 없어도 실패한 상태라면 맨 아래로 돌아올 때 다시 시도한다
		view.rerender({ ...initialProps, isAtBottom: false });
		view.rerender({ ...initialProps, isAtBottom: true });
		await flush();

		expect(readPost).toHaveBeenCalledTimes(2);
		expect(invalidate).toHaveBeenCalledTimes(3);
	});

	test("네트워크 오류로 요청이 던져져도 예외를 밖으로 내지 않는다", async () => {
		const logged = spyOn(console, "error").mockImplementation(() => {});
		readPost.mockImplementationOnce(async () => {
			throw new Error("network down");
		});
		const invalidate = spyOn(queryClient, "invalidateQueries");

		renderMarkRead();
		await flush();

		expect(readPost).toHaveBeenCalledTimes(1);
		expect(invalidate).not.toHaveBeenCalled();
		expect(logged).toHaveBeenCalled();
		logged.mockRestore();
	});

	test("다른 방으로 바뀌면 그 방을 읽음 처리한다", async () => {
		const view = renderMarkRead({
			...initialProps,
			latestIncomingMessageId: null,
		});
		await flush();
		expect(rooms).toHaveBeenLastCalledWith({ id: "room-1" });
		await advance(MARK_READ_THROTTLE_MS * 2);

		// 두 방 모두 상대의 메시지가 없어도(null) 새 방은 새로 요청한다
		view.rerender({
			roomId: "room-2",
			isAtBottom: true,
			latestIncomingMessageId: null,
		});
		await flush();

		expect(readPost).toHaveBeenCalledTimes(2);
		expect(rooms).toHaveBeenLastCalledWith({ id: "room-2" });
	});
});
