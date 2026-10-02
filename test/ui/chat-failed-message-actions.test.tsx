import { afterEach, describe, expect, mock, test } from "bun:test";
import { registerDom } from "../helpers/dom";

registerDom();
const { cleanup, fireEvent, render } = await import("@testing-library/react");
const { ChatFailedMessageActions } = await import(
	"@/components/chat/chat-failed-message-actions"
);

function renderActions() {
	const onRetry = mock((_content: string, _clientId: string) => {});
	const onDelete = mock((_clientId: string) => {});
	const view = render(
		<ChatFailedMessageActions
			content="포카 아직 있나요?"
			clientId="client-1"
			onRetry={onRetry}
			onDelete={onDelete}
		/>,
	);
	return { view, onRetry, onDelete };
}

describe("전송에 실패한 메시지의 재시도·삭제 버튼", () => {
	afterEach(cleanup);

	test("전송 실패 안내와 재시도, 삭제 버튼이 함께 보인다", () => {
		const { view } = renderActions();

		expect(view.queryByText("전송 실패")).not.toBeNull();
		expect(view.queryByRole("button", { name: "재시도" })).not.toBeNull();
		expect(view.queryByRole("button", { name: "삭제" })).not.toBeNull();
	});

	test("재시도를 누르면 같은 내용과 같은 clientId로 다시 보내 달라고 요청하고, 삭제는 부르지 않는다", () => {
		const { view, onRetry, onDelete } = renderActions();

		fireEvent.click(view.getByRole("button", { name: "재시도" }));

		expect(onRetry).toHaveBeenCalledTimes(1);
		expect(onRetry).toHaveBeenCalledWith("포카 아직 있나요?", "client-1");
		expect(onDelete).not.toHaveBeenCalled();
	});

	test("삭제를 누르면 그 메시지의 clientId로 삭제를 요청하고, 다시 보내지는 않는다", () => {
		const { view, onRetry, onDelete } = renderActions();

		fireEvent.click(view.getByRole("button", { name: "삭제" }));

		expect(onDelete).toHaveBeenCalledTimes(1);
		expect(onDelete).toHaveBeenCalledWith("client-1");
		expect(onRetry).not.toHaveBeenCalled();
	});
});
