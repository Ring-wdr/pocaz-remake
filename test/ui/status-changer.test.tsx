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

const put = mock(
	async (_body: { status: string }): Promise<unknown> => edenResult(200, {}),
);
const markets = mock((_params: { id: string }) => ({ put }));
const refresh = mock(() => {});
const toast = { success: mock(), error: mock() };

mock.module("@/utils/eden", () => ({ api: { markets } }));
mock.module("sonner", () => ({ toast }));

registerDom();
// 앱 라우터 밖에서는 useRouter가 예외를 던지므로 refresh만 가진 라우터로 바꾸고, 나머지 내보내기는 그대로 둔다
const actualNavigation = await import("next/navigation");
mock.module("next/navigation", () => ({
	...actualNavigation,
	useRouter: () => ({ refresh }),
}));

const { cleanup, fireEvent, render, waitFor, within } = await import(
	"@testing-library/react"
);
const { OverlayProvider } = await import("overlay-kit");
const { default: StatusChanger } = await import(
	"@/components/market/status-changer"
);

const CONFIRM_TITLE = "판매완료로 변경";

function renderChanger(currentStatus: "available" | "reserved" | "sold") {
	const view = render(
		<OverlayProvider>
			<StatusChanger marketId="market-1" currentStatus={currentStatus} />
		</OverlayProvider>,
	);
	const trigger = () => view.getByRole("button", { name: /판매 상태 변경/ });
	/** 선택 목록을 열어 상태를 고른다 */
	const pick = async (label: string) => {
		fireEvent.click(trigger());
		fireEvent.click(await view.findByRole("option", { name: label }));
	};
	return { view, trigger, pick };
}

describe("판매 상태 변경", () => {
	afterEach(cleanup);

	beforeEach(() => {
		for (const fn of [markets, put, refresh, toast.success, toast.error]) {
			fn.mockClear();
		}
		put.mockReset();
		put.mockImplementation(async () => edenResult(200, {}));
	});

	test("판매완료를 고르면 바로 바꾸지 않고 확인을 받은 뒤, 확인하면 변경한다", async () => {
		const { view, trigger, pick } = renderChanger("available");

		await pick("판매완료");

		const dialog = await view.findByRole("dialog", { name: CONFIRM_TITLE });
		expect(
			within(dialog).queryByText(
				"채팅방에서 '거래 완료'를 누르면 구매자와의 거래가 내역에 남아요. 구매자 지정 없이 상태만 바꿀까요?",
			),
		).not.toBeNull();
		// 확인하기 전에는 요청도, 표시 변경도 없다
		expect(put).not.toHaveBeenCalled();
		expect(trigger().textContent).toContain("판매중");

		fireEvent.click(
			within(dialog).getByRole("button", { name: "상태만 변경" }),
		);

		await waitFor(() => expect(put).toHaveBeenCalledWith({ status: "sold" }));
		expect(markets).toHaveBeenCalledWith({ id: "market-1" });
		await waitFor(() =>
			expect(toast.success).toHaveBeenCalledWith(
				"판매완료 상태로 변경되었습니다.",
			),
		);
		expect(refresh).toHaveBeenCalledTimes(1);
		expect(trigger().textContent).toContain("판매완료");
	});

	test("취소하면 요청하지 않고 선택이 이전 상태로 남는다", async () => {
		const { view, trigger, pick } = renderChanger("reserved");

		await pick("판매완료");
		const dialog = await view.findByRole("dialog", { name: CONFIRM_TITLE });
		fireEvent.click(within(dialog).getByRole("button", { name: "취소" }));

		await waitFor(() =>
			expect(view.queryByRole("dialog", { name: CONFIRM_TITLE })).toBeNull(),
		);
		expect(put).not.toHaveBeenCalled();
		expect(refresh).not.toHaveBeenCalled();
		expect(toast.success).not.toHaveBeenCalled();
		expect(trigger().textContent).toContain("예약중");
		expect(trigger().textContent).not.toContain("판매완료");
	});

	test("판매중·예약중으로 바꿀 때는 확인 없이 바로 변경한다", async () => {
		const { view, trigger, pick } = renderChanger("available");

		await pick("예약중");

		await waitFor(() =>
			expect(put).toHaveBeenCalledWith({ status: "reserved" }),
		);
		expect(view.queryByRole("dialog", { name: CONFIRM_TITLE })).toBeNull();
		await waitFor(() =>
			expect(toast.success).toHaveBeenCalledWith(
				"예약중 상태로 변경되었습니다.",
			),
		);
		expect(trigger().textContent).toContain("예약중");
	});

	test("확인한 뒤 요청이 실패하면 이전 상태로 되돌리고 실패를 알린다", async () => {
		put.mockImplementationOnce(async () => edenResult(500, "error"));
		const { view, trigger, pick } = renderChanger("available");

		await pick("판매완료");
		const dialog = await view.findByRole("dialog", { name: CONFIRM_TITLE });
		fireEvent.click(
			within(dialog).getByRole("button", { name: "상태만 변경" }),
		);

		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith(
				"상태 변경에 실패했습니다. 다시 시도해 주세요.",
			),
		);
		expect(toast.success).not.toHaveBeenCalled();
		expect(refresh).not.toHaveBeenCalled();
		await waitFor(() => expect(trigger().textContent).toContain("판매중"));
	});
});
