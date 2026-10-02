import {
	afterEach,
	beforeEach,
	describe,
	expect,
	mock,
	spyOn,
	test,
} from "bun:test";
import type { ComponentProps } from "react";
import type { ChatMarketInfo } from "@/types/entities";
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

const completeTrade = mock(
	async (_body: { buyerId: string }): Promise<unknown> => edenResult(201, {}),
);
const markets = mock((_params: { id: string }) => ({
	complete: { post: completeTrade },
}));
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
const { QueryClient, QueryClientProvider } = await import(
	"@tanstack/react-query"
);
const { OverlayProvider } = await import("overlay-kit");
const { ChatMarketBanner } = await import(
	"@/components/chat/chat-market-banner"
);

const owner = { id: "owner-1", nickname: "판매자" };
const buyer = { id: "buyer-1", nickname: "구매자" };

function makeMarket(overrides: Partial<ChatMarketInfo> = {}): ChatMarketInfo {
	return {
		id: "market-1",
		title: "르세라핌 포토카드",
		price: 12000,
		status: "available",
		userId: owner.id,
		thumbnail: null,
		transaction: null,
		...overrides,
	};
}

const completedTransaction = {
	id: "transaction-1",
	buyerId: buyer.id,
	sellerId: owner.id,
	price: 12000,
	completedAt: "2026-10-02T00:00:00.000Z",
	myReviewed: false,
};

let queryClient = new QueryClient();

function renderBanner(props: ComponentProps<typeof ChatMarketBanner>) {
	return render(
		<QueryClientProvider client={queryClient}>
			<OverlayProvider>
				<ChatMarketBanner {...props} />
			</OverlayProvider>
		</QueryClientProvider>,
	);
}

/** 주인 입장의 배너를 그리고 "거래 완료" 버튼을 눌러 확인 모달까지 연다 */
async function openCompleteConfirm(overrides: Partial<ChatMarketInfo> = {}) {
	const view = renderBanner({
		market: makeMarket(overrides),
		currentUserId: owner.id,
		partner: buyer,
	});
	const button = view.getByRole("button", { name: "거래 완료" });
	fireEvent.click(button);
	const dialog = await view.findByRole("dialog");
	return { view, button, dialog };
}

describe("채팅방 상품 배너의 거래 완료 버튼", () => {
	afterEach(cleanup);

	beforeEach(() => {
		queryClient = new QueryClient();
		for (const fn of [markets, refresh, toast.success, toast.error]) {
			fn.mockClear();
		}
		completeTrade.mockReset();
		completeTrade.mockImplementation(async () =>
			edenResult(201, { id: completedTransaction.id }),
		);
	});

	test("상품 주인에게는 버튼이 보이고, 버튼은 상품 링크 안이 아니라 옆에 있다", () => {
		const view = renderBanner({
			market: makeMarket(),
			currentUserId: owner.id,
			partner: buyer,
		});

		const button = view.getByRole("button", { name: "거래 완료" });
		const link = view.getByRole("link");
		expect(link.getAttribute("href")).toBe("/market/market-1");
		// 링크 안에 버튼을 넣으면 인터랙티브 요소가 중첩된다
		expect(link.contains(button)).toBe(false);
	});

	test("구매자(상품 주인이 아닌 사용자)에게는 버튼이 보이지 않는다", () => {
		const view = renderBanner({
			market: makeMarket(),
			currentUserId: buyer.id,
			partner: owner,
		});

		expect(view.queryByRole("button", { name: "거래 완료" })).toBeNull();
		expect(within(view.getByRole("link")).queryByText("판매중")).not.toBeNull();
	});

	test("상대가 방을 나가 거래 상대가 없으면 버튼을 숨긴다", () => {
		const view = renderBanner({
			market: makeMarket(),
			currentUserId: owner.id,
			partner: null,
		});

		expect(view.queryByRole("button", { name: "거래 완료" })).toBeNull();
	});

	test("예약중인 상품에는 버튼이 보이고, 이미 판매완료 상태인 상품에는 보이지 않는다", () => {
		const reserved = renderBanner({
			market: makeMarket({ status: "reserved" }),
			currentUserId: owner.id,
			partner: buyer,
		});
		expect(
			reserved.queryByRole("button", { name: "거래 완료" }),
		).not.toBeNull();
		reserved.unmount();

		const sold = renderBanner({
			market: makeMarket({ status: "sold" }),
			currentUserId: owner.id,
			partner: buyer,
		});
		expect(sold.queryByRole("button", { name: "거래 완료" })).toBeNull();
	});

	test("상태는 영문 코드 대신 한국어 라벨로 보인다", () => {
		for (const [status, label] of [
			["available", "판매중"],
			["reserved", "예약중"],
			["sold", "판매완료"],
		]) {
			const view = renderBanner({
				market: makeMarket({ status }),
				currentUserId: buyer.id,
				partner: owner,
			});
			const link = within(view.getByRole("link"));

			expect(link.queryByText(label)).not.toBeNull();
			expect(link.queryByText(status)).toBeNull();
			view.unmount();
		}
	});

	test.each([
		["주인", owner.id, buyer],
		["구매자", buyer.id, owner],
	])("거래가 있으면 %s에게도 상태 라벨 대신 거래 완료 뱃지가 보이고 버튼은 없다", (_role, currentUserId, partner) => {
		const view = renderBanner({
			market: makeMarket({ status: "sold", transaction: completedTransaction }),
			currentUserId,
			partner,
		});
		const link = within(view.getByRole("link"));

		expect(link.queryByText("거래 완료")).not.toBeNull();
		expect(link.queryByText("판매완료")).toBeNull();
		expect(view.queryByRole("button", { name: "거래 완료" })).toBeNull();
	});

	test("확인하면 상대를 구매자로 거래를 완료하고, 화면과 캐시를 새로 받는다", async () => {
		const invalidate = spyOn(queryClient, "invalidateQueries");
		const { view, dialog } = await openCompleteConfirm();

		expect(
			within(dialog).getByRole("heading", { name: "거래 완료" }),
		).not.toBeNull();
		expect(
			within(dialog).queryByText(
				"구매자님과 거래를 완료할까요? 상품이 판매완료로 바뀌고 양쪽 거래 내역에 남아요.",
			),
		).not.toBeNull();
		fireEvent.click(within(dialog).getByRole("button", { name: "거래 완료" }));

		await waitFor(() =>
			expect(toast.success).toHaveBeenCalledWith(
				"거래를 완료했어요. 거래 내역에서 확인할 수 있어요.",
			),
		);
		expect(markets).toHaveBeenCalledWith({ id: "market-1" });
		expect(completeTrade).toHaveBeenCalledTimes(1);
		expect(completeTrade).toHaveBeenCalledWith({ buyerId: "buyer-1" });
		expect(toast.error).not.toHaveBeenCalled();
		expect(refresh).toHaveBeenCalledTimes(1);
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["chat", "rooms"] });
		expect(invalidate).toHaveBeenCalledWith({
			queryKey: ["markets", "market-1", "info"],
		});
		// router.refresh()로 새 market이 내려오기 전에도 같은 거래를 다시 완료할 수 없다
		await waitFor(() =>
			expect(view.queryByRole("button", { name: "거래 완료" })).toBeNull(),
		);
		expect(
			within(view.getByRole("link")).queryByText("거래 완료"),
		).not.toBeNull();
	});

	test("취소하면 API를 부르지 않고 버튼이 그대로 남는다", async () => {
		const { view, button, dialog } = await openCompleteConfirm();

		fireEvent.click(within(dialog).getByRole("button", { name: "취소" }));

		await waitFor(() => expect(view.queryByRole("dialog")).toBeNull());
		expect(completeTrade).not.toHaveBeenCalled();
		expect(refresh).not.toHaveBeenCalled();
		expect(toast.success).not.toHaveBeenCalled();
		expect((button as HTMLButtonElement).disabled).toBe(false);
	});

	test("요청하는 동안에는 버튼이 비활성화되어 한 번만 요청한다", async () => {
		let finish: (value: unknown) => void = () => {};
		completeTrade.mockImplementationOnce(
			() =>
				new Promise((resolve) => {
					finish = resolve;
				}),
		);
		const { view, button, dialog } = await openCompleteConfirm();
		fireEvent.click(within(dialog).getByRole("button", { name: "거래 완료" }));

		await waitFor(() =>
			expect((button as HTMLButtonElement).disabled).toBe(true),
		);
		fireEvent.click(button);
		expect(view.queryByRole("dialog")).toBeNull();
		expect(completeTrade).toHaveBeenCalledTimes(1);

		finish(edenResult(201, { id: completedTransaction.id }));
		await waitFor(() => expect(toast.success).toHaveBeenCalled());
	});

	test.each([
		[409, "이미 거래가 완료된 상품이에요", 1],
		[
			400,
			"거래를 완료할 수 없어요. 상대가 이 상품 채팅방의 참여자인지 확인해 주세요",
			0,
		],
		[403, "거래 완료에 실패했습니다. 잠시 후 다시 시도해 주세요", 0],
		[500, "거래 완료에 실패했습니다. 잠시 후 다시 시도해 주세요", 0],
	])("%i 오류면 안내 토스트를 띄우고 완료로 취급하지 않는다", async (status, message, refreshCount) => {
		completeTrade.mockImplementationOnce(async () =>
			edenResult(status, { error: "english message" }),
		);
		const { view, button, dialog } = await openCompleteConfirm();

		fireEvent.click(within(dialog).getByRole("button", { name: "거래 완료" }));

		await waitFor(() => expect(toast.error).toHaveBeenCalledWith(message));
		expect(toast.success).not.toHaveBeenCalled();
		// 이미 완료된 거래(409)는 화면을 서버 상태에 맞추려고 새로 받는다
		expect(refresh).toHaveBeenCalledTimes(refreshCount);
		// 다시 시도할 수 있게 버튼은 살아 있다
		await waitFor(() =>
			expect((button as HTMLButtonElement).disabled).toBe(false),
		);
		expect(within(view.getByRole("link")).queryByText("거래 완료")).toBeNull();
	});

	test("네트워크 오류로 요청이 던져져도 실패 토스트를 띄우고 버튼을 다시 연다", async () => {
		const logged = spyOn(console, "error").mockImplementation(() => {});
		completeTrade.mockImplementationOnce(async () => {
			throw new Error("network down");
		});
		const { button, dialog } = await openCompleteConfirm();

		fireEvent.click(within(dialog).getByRole("button", { name: "거래 완료" }));

		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith(
				"거래 완료에 실패했습니다. 잠시 후 다시 시도해 주세요",
			),
		);
		await waitFor(() =>
			expect((button as HTMLButtonElement).disabled).toBe(false),
		);
		expect(refresh).not.toHaveBeenCalled();
		logged.mockRestore();
	});
});
