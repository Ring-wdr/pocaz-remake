import { afterEach, describe, expect, mock, test } from "bun:test";
import { registerDom } from "../helpers/dom";

registerDom();
const { cleanup, fireEvent, render } = await import("@testing-library/react");
const { SearchBar } = await import("@/components/ui/search-bar/search-bar");

describe("Enter로 보내는 입력창", () => {
	afterEach(cleanup);

	test("한글 조합을 끝내는 Enter(isComposing)는 보내지 않고, 이어지는 Enter만 보낸다", () => {
		const onSearch = mock((_value: string) => {});
		const view = render(
			<SearchBar placeholder="검색" defaultValue="포카" onSearch={onSearch} />,
		);
		const input = view.getByRole("textbox", { name: "검색" });

		// 크롬은 조합 중 Enter 한 번에 keydown을 두 번 보낸다
		fireEvent.keyDown(input, { key: "Enter", isComposing: true });
		fireEvent.keyDown(input, { key: "Enter", isComposing: false });

		expect(onSearch).toHaveBeenCalledTimes(1);
		expect(onSearch).toHaveBeenCalledWith("포카");
	});
});
