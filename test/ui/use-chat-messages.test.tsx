import { afterEach, describe, expect, mock, test } from "bun:test";
import type { ReactNode } from "react";
import type { ChatMessage, PaginatedMessages } from "@/types/entities";
import { registerDom } from "../helpers/dom";

const emptyPage: PaginatedMessages = {
	messages: [],
	nextCursor: null,
	hasMore: false,
};

// 처음 받아 온 메시지는 다시 받지 않지만, 혹시 요청이 가도 빈 목록을 돌려준다
mock.module("@/utils/eden", () => ({
	api: {
		chat: {
			rooms: () => ({
				messages: {
					get: async () => ({ data: emptyPage, error: null, status: 200 }),
				},
			}),
		},
	},
}));
// 실시간 연결(Supabase Realtime)은 만들지 않는다. 나머지 내보내기는 그대로 둔다
const actualRealtime = await import("@/lib/hooks/use-chat-realtime");
mock.module("@/lib/hooks/use-chat-realtime", () => ({
	...actualRealtime,
	useChatRealtime: () => ({
		isConnected: false,
		reconnect: () => {},
		disconnect: () => {},
	}),
}));

registerDom();
const { act, cleanup, renderHook } = await import("@testing-library/react");
const { QueryClient, QueryClientProvider } = await import(
	"@tanstack/react-query"
);
const { useChatMessages } = await import("@/lib/hooks/use-chat-messages");

const ME = "user-me";

function renderChatMessages() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { staleTime: Infinity, retry: false } },
	});
	return renderHook(
		() =>
			useChatMessages({
				roomId: "room-1",
				initialPage: emptyPage,
				currentUserId: ME,
			}),
		{
			wrapper: ({ children }: { children: ReactNode }) => (
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			),
		},
	);
}

type Hook = ReturnType<typeof renderChatMessages>;

/** 내용으로 찾은 화면의 메시지 */
const itemOf = (hook: Hook, content: string) =>
	hook.result.current.items.find((item) => item.content === content);

/** 메시지를 보내려고 쌓아 둔 뒤 전송에 실패한 상태로 만든다 */
function appendFailed(hook: Hook, content: string) {
	let clientId = "";
	act(() => {
		clientId = hook.result.current.appendLocal(content).clientId;
	});
	act(() => hook.result.current.markAsFailed(clientId));
	return clientId;
}

describe("useChatMessages의 markAsSending", () => {
	afterEach(cleanup);

	test("실패한 메시지만 전송 중으로 되돌리고 내용과 clientId는 그대로 둔다", () => {
		const hook = renderChatMessages();
		const first = appendFailed(hook, "첫 번째");
		const second = appendFailed(hook, "두 번째");
		expect(itemOf(hook, "첫 번째")?.status).toBe("failed");
		expect(itemOf(hook, "두 번째")?.status).toBe("failed");

		act(() => hook.result.current.markAsSending(first));

		expect(itemOf(hook, "첫 번째")).toMatchObject({
			status: "sending",
			clientId: first,
			content: "첫 번째",
		});
		expect(itemOf(hook, "두 번째")).toMatchObject({
			status: "failed",
			clientId: second,
		});
		// 자리도 그대로다
		expect(hook.result.current.items.map((item) => item.content)).toEqual([
			"첫 번째",
			"두 번째",
		]);
	});

	test("전송 중으로 되돌린 메시지가 다시 실패하면 실패 상태로 돌아가고, 성공하면 서버 메시지로 바뀐다", () => {
		const hook = renderChatMessages();
		const clientId = appendFailed(hook, "포카 아직 있나요?");

		act(() => hook.result.current.markAsSending(clientId));
		act(() => hook.result.current.markAsFailed(clientId));
		expect(itemOf(hook, "포카 아직 있나요?")?.status).toBe("failed");

		act(() => hook.result.current.markAsSending(clientId));
		const saved: ChatMessage = {
			id: "server-1",
			content: "포카 아직 있나요?",
			createdAt: new Date().toISOString(),
			user: { id: ME, nickname: "나", profileImage: null },
		};
		act(() => hook.result.current.markAsSent(clientId, saved));

		const sent = hook.result.current.items.filter(
			(item) => item.content === "포카 아직 있나요?",
		);
		expect(sent).toHaveLength(1);
		expect(sent[0]).toMatchObject({ id: "server-1", status: "sent" });
	});

	test("모르는 clientId는 아무것도 바꾸지 않는다", () => {
		const hook = renderChatMessages();
		appendFailed(hook, "첫 번째");

		act(() => hook.result.current.markAsSending("unknown"));

		expect(itemOf(hook, "첫 번째")?.status).toBe("failed");
		expect(hook.result.current.items).toHaveLength(1);
	});
});
