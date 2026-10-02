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

const deleteMarket = mock(
	async (): Promise<unknown> =>
		edenResult(200, { message: "Market deleted successfully" }),
);
const markets = mock((_params: { id: string }) => ({ delete: deleteMarket }));
const push = mock((_href: string) => {});
const refresh = mock(() => {});
const toast = { success: mock(), error: mock() };

mock.module("@/utils/eden", () => ({ api: { markets } }));
mock.module("sonner", () => ({ toast }));

registerDom();
// 앱 라우터 밖에서는 useRouter가 예외를 던지므로 push·refresh만 가진 라우터로 바꾸고, 나머지 내보내기는 그대로 둔다
const actualNavigation = await import("next/navigation");
mock.module("next/navigation", () => ({
	...actualNavigation,
	useRouter: () => ({ push, refresh }),
}));

const { cleanup, fireEvent, render, waitFor, within } = await import(
	"@testing-library/react"
);
const { QueryClient, QueryClientProvider } = await import(
	"@tanstack/react-query"
);
const { OverlayProvider } = await import("overlay-kit");
const { Header } = await import("@/app/market/[productId]/components");

/**
 * 요소가 화면에 있는지. 단언에 DOM 노드를 그대로 넘기면 실패했을 때 happy-dom 객체 전체가
 * 오류 메시지(수십 MB)로 찍혀 테스트가 멈춘 것처럼 보이므로, 불리언으로 바꿔서 넘긴다.
 */
function isShown(node: HTMLElement | null): boolean {
	return node !== null;
}

const MENU_LABEL = "상품 메뉴";
const CONFIRM_TITLE = "상품 삭제";
const CONFIRM_DESCRIPTION =
	"정말 삭제하시겠습니까? 채팅방과 찜도 함께 사라집니다.";

let queryClient = new QueryClient();

function renderHeader(isOwner: boolean) {
	const view = render(
		<QueryClientProvider client={queryClient}>
			<OverlayProvider>
				<Header marketId="market-1" isOwner={isOwner} />
			</OverlayProvider>
		</QueryClientProvider>,
	);
	const trigger = () =>
		view.getByRole("button", { name: MENU_LABEL }) as HTMLButtonElement;
	/** 메뉴를 열고 항목 하나를 누른다 */
	const pick = async (label: "수정" | "삭제") => {
		fireEvent.click(trigger());
		fireEvent.click(await view.findByRole("menuitem", { name: label }));
	};
	/** 삭제 메뉴를 눌러 확인 모달까지 연다 */
	const openDeleteConfirm = async () => {
		await pick("삭제");
		return view.findByRole("dialog", { name: CONFIRM_TITLE });
	};
	return { view, trigger, pick, openDeleteConfirm };
}

describe("상품 상세 헤더의 주인 메뉴", () => {
	afterEach(cleanup);

	beforeEach(() => {
		queryClient = new QueryClient();
		for (const fn of [markets, push, refresh, toast.success, toast.error]) {
			fn.mockClear();
		}
		deleteMarket.mockReset();
		deleteMarket.mockImplementation(async () =>
			edenResult(200, { message: "Market deleted successfully" }),
		);
	});

	test("주인에게는 메뉴 버튼이 보인다", () => {
		const { view } = renderHeader(true);

		expect(isShown(view.queryByRole("button", { name: MENU_LABEL }))).toBe(
			true,
		);
		expect(isShown(view.queryByText("상품 상세"))).toBe(true);
	});

	test("주인이 아니면 메뉴 버튼이 보이지 않고 나머지 헤더는 그대로다", () => {
		const { view } = renderHeader(false);

		expect(isShown(view.queryByRole("button", { name: MENU_LABEL }))).toBe(
			false,
		);
		expect(isShown(view.queryByText("상품 상세"))).toBe(true);
		const back = view.getByRole("link", { name: "마켓으로 돌아가기" });
		expect(back.getAttribute("href")).toBe("/market");
	});

	test("메뉴에는 수정과 삭제가 있다", async () => {
		const { view, trigger } = renderHeader(true);

		fireEvent.click(trigger());

		const items = (await view.findAllByRole("menuitem")).map(
			(item) => item.textContent,
		);
		expect(items).toEqual(["수정", "삭제"]);
	});

	test("수정을 누르면 수정 페이지로 이동하고 아무것도 지우지 않는다", async () => {
		const { view, pick } = renderHeader(true);

		await pick("수정");

		expect(push).toHaveBeenCalledTimes(1);
		expect(push).toHaveBeenCalledWith("/market/market-1/edit");
		expect(isShown(view.queryByRole("dialog"))).toBe(false);
		expect(deleteMarket).not.toHaveBeenCalled();
	});

	test("삭제를 누르면 먼저 확인을 받고, 확인하기 전에는 지우지 않는다", async () => {
		const { openDeleteConfirm } = renderHeader(true);

		const dialog = await openDeleteConfirm();

		expect(
			within(dialog).getByRole("heading", { name: CONFIRM_TITLE }),
		).toBeDefined();
		expect(isShown(within(dialog).queryByText(CONFIRM_DESCRIPTION))).toBe(true);
		expect(
			isShown(within(dialog).queryByRole("button", { name: "취소" })),
		).toBe(true);
		expect(deleteMarket).not.toHaveBeenCalled();
		expect(push).not.toHaveBeenCalled();
	});

	test("확인하면 상품을 지우고, 토스트를 띄운 뒤 마켓 목록으로 이동하며 캐시를 정리한다", async () => {
		const invalidate = spyOn(queryClient, "invalidateQueries");
		const remove = spyOn(queryClient, "removeQueries");
		const { openDeleteConfirm } = renderHeader(true);
		const dialog = await openDeleteConfirm();

		fireEvent.click(within(dialog).getByRole("button", { name: "삭제" }));

		await waitFor(() =>
			expect(toast.success).toHaveBeenCalledWith("상품을 삭제했어요"),
		);
		expect(markets).toHaveBeenCalledWith({ id: "market-1" });
		expect(deleteMarket).toHaveBeenCalledTimes(1);
		expect(toast.error).not.toHaveBeenCalled();
		expect(push).toHaveBeenCalledTimes(1);
		expect(push).toHaveBeenCalledWith("/market");
		expect(refresh).toHaveBeenCalledTimes(1);
		// 상품과 함께 지워진 채팅방이 목록에 남지 않게 한다
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["chat", "rooms"] });
		expect(remove).toHaveBeenCalledWith({
			queryKey: ["markets", "market-1", "info"],
		});
	});

	test("확인 창에서 취소하면 지우지도 이동하지도 않는다", async () => {
		const { view, trigger, openDeleteConfirm } = renderHeader(true);
		const dialog = await openDeleteConfirm();

		fireEvent.click(within(dialog).getByRole("button", { name: "취소" }));

		await waitFor(() =>
			expect(isShown(view.queryByRole("dialog"))).toBe(false),
		);
		expect(deleteMarket).not.toHaveBeenCalled();
		expect(push).not.toHaveBeenCalled();
		expect(refresh).not.toHaveBeenCalled();
		expect(toast.success).not.toHaveBeenCalled();
		await waitFor(() => expect(trigger().disabled).toBe(false));
	});

	test("지우는 동안에는 메뉴 버튼이 잠기고 요청은 한 번만 간다", async () => {
		let finish: (value: unknown) => void = () => {};
		deleteMarket.mockImplementationOnce(
			() =>
				new Promise((resolve) => {
					finish = resolve;
				}),
		);
		const { trigger, openDeleteConfirm } = renderHeader(true);
		const dialog = await openDeleteConfirm();
		fireEvent.click(within(dialog).getByRole("button", { name: "삭제" }));

		await waitFor(() => expect(trigger().disabled).toBe(true));
		fireEvent.click(trigger());
		expect(deleteMarket).toHaveBeenCalledTimes(1);

		finish(edenResult(200, { message: "Market deleted successfully" }));
		await waitFor(() => expect(push).toHaveBeenCalledWith("/market"));
		await waitFor(() => expect(trigger().disabled).toBe(false));
	});

	test.each([
		// 거래 기록이 있는 상품은 서버가 409로 막는다. 판매완료로 남겨 두라고 안내한다
		[
			409,
			"거래 내역이 있는 상품은 삭제할 수 없어요. 판매완료 상태로 남겨 두세요",
		],
		[500, "상품을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요."],
		[403, "상품을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요."],
	])(
		"%i 오류면 실패를 알리고 이동하지 않으며 다시 시도할 수 있다",
		async (status, message) => {
			deleteMarket.mockImplementationOnce(async () =>
				edenResult(status, { error: "english message" }),
			);
			const logged = spyOn(console, "error").mockImplementation(() => {});
			const { trigger, openDeleteConfirm } = renderHeader(true);
			const dialog = await openDeleteConfirm();

			fireEvent.click(within(dialog).getByRole("button", { name: "삭제" }));

			await waitFor(() => expect(toast.error).toHaveBeenCalledWith(message));
			expect(toast.success).not.toHaveBeenCalled();
			expect(push).not.toHaveBeenCalled();
			expect(refresh).not.toHaveBeenCalled();
			await waitFor(() => expect(trigger().disabled).toBe(false));
			logged.mockRestore();
		},
	);

	test("네트워크 오류로 요청이 던져져도 실패 토스트를 띄우고 메뉴를 다시 연다", async () => {
		const logged = spyOn(console, "error").mockImplementation(() => {});
		deleteMarket.mockImplementationOnce(async () => {
			throw new Error("network down");
		});
		const { trigger, openDeleteConfirm } = renderHeader(true);
		const dialog = await openDeleteConfirm();

		fireEvent.click(within(dialog).getByRole("button", { name: "삭제" }));

		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith(
				"상품을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.",
			),
		);
		expect(push).not.toHaveBeenCalled();
		await waitFor(() => expect(trigger().disabled).toBe(false));
		logged.mockRestore();
	});
});
