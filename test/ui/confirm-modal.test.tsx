import { describe, expect, test } from "bun:test";
import { registerDom } from "../helpers/dom";

registerDom();
const { fireEvent, render, screen } = await import("@testing-library/react");
const { OverlayProvider } = await import("overlay-kit");
const { confirmAction } = await import("@/components/ui/modal/open-confirm");

describe("confirmAction", () => {
	test("확인을 누르면 true", async () => {
		render(<OverlayProvider>{null}</OverlayProvider>);

		const result = confirmAction({ title: "게시글을 삭제할까요?" });
		fireEvent.click(await screen.findByRole("button", { name: "확인" }));

		expect(await result).toBe(true);
	});

	test("취소를 누르면 false", async () => {
		render(<OverlayProvider>{null}</OverlayProvider>);

		const result = confirmAction({ title: "게시글을 삭제할까요?" });
		fireEvent.click(await screen.findByRole("button", { name: "취소" }));

		expect(await result).toBe(false);
	});
});
