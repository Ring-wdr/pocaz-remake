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

const postReview = mock(
	async (_body: { rating: number; content?: string }): Promise<unknown> =>
		edenResult(201, {}),
);
const transactions = mock((_params: { id: string }) => ({
	reviews: { post: postReview },
}));
const refresh = mock(() => {});
const toast = { success: mock(), error: mock() };

mock.module("@/utils/eden", () => ({ api: { transactions } }));
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
const { ReviewBottomSheet } = await import(
	"@/components/review/review-bottom-sheet"
);
const { WriteReviewButton } = await import(
	"@/components/review/write-review-button"
);

/**
 * 요소가 화면에 있는지. 단언에 DOM 노드를 그대로 넘기면 실패했을 때 happy-dom 객체 전체가
 * 오류 메시지(수십 MB)로 찍혀 테스트가 멈춘 것처럼 보이므로, 불리언으로 바꿔서 넘긴다.
 */
function isShown(node: HTMLElement | null): boolean {
	return node !== null;
}

const SUBMIT = "등록하기";
const FAILED_MESSAGE = "후기를 남기지 못했어요. 잠시 후 다시 시도해 주세요";

const owner = { id: "owner-1", nickname: "판매자" };
const buyer = { id: "buyer-1", nickname: "구매자" };

function resetMocks() {
	for (const fn of [transactions, refresh, toast.success, toast.error]) {
		fn.mockClear();
	}
	postReview.mockReset();
	postReview.mockImplementation(async () =>
		edenResult(201, { id: "review-1" }),
	);
}

describe("후기 바텀시트", () => {
	afterEach(cleanup);
	beforeEach(resetMocks);

	function renderSheet(
		props: Partial<ComponentProps<typeof ReviewBottomSheet>> = {},
	) {
		const onClose = mock();
		const onReviewed = mock();
		const view = render(
			<ReviewBottomSheet
				isOpen
				onClose={onClose}
				onReviewed={onReviewed}
				transactionId="transaction-1"
				partnerNickname="판매자"
				{...props}
			/>,
		);
		const dialog = view.getByRole("dialog");
		const submit = within(dialog).getByRole("button", {
			name: SUBMIT,
		}) as HTMLButtonElement;
		const textarea = within(dialog).getByRole("textbox") as HTMLTextAreaElement;
		const star = (value: number) =>
			within(dialog).getByRole("button", {
				name: `별 ${value}개`,
			}) as HTMLButtonElement;
		return { view, dialog, submit, textarea, star, onClose, onReviewed };
	}

	test("별 5개와 내용 입력창, 글자 수가 보이고 별점을 고르기 전에는 등록할 수 없다", () => {
		const { dialog, submit, textarea, star } = renderSheet();

		expect(
			isShown(within(dialog).queryByRole("heading", { name: "거래 후기" })),
		).toBe(true);
		expect(
			isShown(within(dialog).queryByText("판매자님과의 거래는 어떠셨나요?")),
		).toBe(true);
		for (const value of [1, 2, 3, 4, 5]) {
			expect(star(value).getAttribute("aria-pressed")).toBe("false");
		}
		expect(isShown(within(dialog).queryByRole("group", { name: "별점" }))).toBe(
			true,
		);
		expect(isShown(within(dialog).queryByText("별점을 선택해 주세요"))).toBe(
			true,
		);
		expect(textarea.maxLength).toBe(300);
		expect(isShown(within(dialog).queryByText("0/300"))).toBe(true);
		expect(submit.disabled).toBe(true);
	});

	test("거래 상대 이름을 모르면 이름 없이 묻는다", () => {
		const { dialog } = renderSheet({ partnerNickname: undefined });

		expect(isShown(within(dialog).queryByText("거래는 어떠셨나요?"))).toBe(
			true,
		);
	});

	test("별을 누르면 그 별점만 선택되고 등록할 수 있게 된다", () => {
		const { dialog, submit, star } = renderSheet();

		fireEvent.click(star(4));

		expect(star(4).getAttribute("aria-pressed")).toBe("true");
		for (const value of [1, 2, 3, 5]) {
			expect(star(value).getAttribute("aria-pressed")).toBe("false");
		}
		expect(isShown(within(dialog).queryByText("좋아요"))).toBe(true);
		expect(submit.disabled).toBe(false);

		// 다른 별을 누르면 선택이 옮겨 간다
		fireEvent.click(star(2));
		expect(star(2).getAttribute("aria-pressed")).toBe("true");
		expect(star(4).getAttribute("aria-pressed")).toBe("false");
		expect(isShown(within(dialog).queryByText("아쉬워요"))).toBe(true);
	});

	test("별점과 내용을 보내고, 성공하면 토스트를 띄우고 onReviewed를 부른다", async () => {
		const { submit, textarea, star, onReviewed, onClose } = renderSheet();

		fireEvent.click(star(5));
		fireEvent.change(textarea, { target: { value: "  친절했어요  " } });
		fireEvent.click(submit);

		await waitFor(() =>
			expect(toast.success).toHaveBeenCalledWith("후기를 남겼어요"),
		);
		expect(transactions).toHaveBeenCalledWith({ id: "transaction-1" });
		expect(postReview).toHaveBeenCalledTimes(1);
		// 앞뒤 공백은 지우고 보낸다
		expect(postReview).toHaveBeenCalledWith({
			rating: 5,
			content: "친절했어요",
		});
		expect(onReviewed).toHaveBeenCalledTimes(1);
		expect(toast.error).not.toHaveBeenCalled();
		// 시트를 닫는 일은 부른 쪽이 한다
		expect(onClose).not.toHaveBeenCalled();
	});

	test("내용을 비워 두거나 공백뿐이면 별점만 보낸다", async () => {
		const { submit, textarea, star } = renderSheet();

		fireEvent.click(star(3));
		fireEvent.click(submit);
		await waitFor(() => expect(postReview).toHaveBeenCalledTimes(1));
		expect(postReview.mock.calls[0]?.[0]).toEqual({ rating: 3 });
		expect(postReview.mock.calls[0]?.[0]?.content).toBeUndefined();

		await waitFor(() => expect(submit.disabled).toBe(false));
		fireEvent.change(textarea, { target: { value: "   " } });
		fireEvent.click(submit);
		await waitFor(() => expect(postReview).toHaveBeenCalledTimes(2));
		expect(postReview.mock.calls[1]?.[0]?.content).toBeUndefined();
	});

	test("쓴 글자 수를 세어 보여 준다", () => {
		const { dialog, textarea } = renderSheet();

		fireEvent.change(textarea, { target: { value: "좋았어요" } });

		expect(isShown(within(dialog).queryByText("4/300"))).toBe(true);
		expect(textarea.value).toBe("좋았어요");
	});

	test("요청하는 동안에는 모두 잠기고 한 번만 요청한다", async () => {
		let finish: (value: unknown) => void = () => {};
		postReview.mockImplementationOnce(
			() =>
				new Promise((resolve) => {
					finish = resolve;
				}),
		);
		const { dialog, submit, textarea, star, onClose, onReviewed } =
			renderSheet();
		fireEvent.click(star(5));
		fireEvent.change(textarea, { target: { value: "좋아요" } });
		fireEvent.click(submit);

		await waitFor(() => expect(submit.disabled).toBe(true));
		expect(isShown(within(dialog).queryByText("등록 중..."))).toBe(true);
		expect(textarea.readOnly).toBe(true);
		for (const value of [1, 2, 3, 4, 5]) {
			expect(star(value).disabled).toBe(true);
		}
		// 누르거나 ESC·바깥 클릭·닫기 버튼을 써도 요청은 하나이고 시트는 닫히지 않는다
		fireEvent.click(submit);
		fireEvent.keyDown(document, { key: "Escape" });
		fireEvent.click(dialog);
		fireEvent.click(within(dialog).getByRole("button", { name: "닫기" }));
		expect(postReview).toHaveBeenCalledTimes(1);
		expect(onClose).not.toHaveBeenCalled();

		finish(edenResult(201, { id: "review-1" }));
		await waitFor(() => expect(onReviewed).toHaveBeenCalledTimes(1));
		await waitFor(() => expect(submit.disabled).toBe(false));
	});

	test.each([
		[403, "이 거래의 후기는 남길 수 없어요"],
		[404, "거래를 찾을 수 없어요"],
		[400, FAILED_MESSAGE],
		[422, FAILED_MESSAGE],
		[500, FAILED_MESSAGE],
	])(
		"%i 오류면 안내 토스트를 띄우고 쓰던 내용을 남긴 채 다시 시도할 수 있다",
		async (status, message) => {
			postReview.mockImplementationOnce(async () =>
				edenResult(status, { error: "english message" }),
			);
			const { submit, textarea, star, onReviewed, onClose } = renderSheet();
			fireEvent.click(star(2));
			fireEvent.change(textarea, { target: { value: "아쉬웠어요" } });

			fireEvent.click(submit);

			await waitFor(() => expect(toast.error).toHaveBeenCalledWith(message));
			expect(toast.success).not.toHaveBeenCalled();
			expect(onReviewed).not.toHaveBeenCalled();
			expect(onClose).not.toHaveBeenCalled();
			await waitFor(() => expect(submit.disabled).toBe(false));
			expect(star(2).getAttribute("aria-pressed")).toBe("true");
			expect(textarea.value).toBe("아쉬웠어요");

			fireEvent.click(submit);
			await waitFor(() => expect(toast.success).toHaveBeenCalled());
			expect(postReview).toHaveBeenCalledTimes(2);
			expect(onReviewed).toHaveBeenCalledTimes(1);
		},
	);

	test("이미 후기를 남긴 거래(409)면 안내하고, 화면을 서버 상태에 맞추도록 onReviewed를 부른다", async () => {
		postReview.mockImplementationOnce(async () =>
			edenResult(409, { error: "Already reviewed" }),
		);
		const { submit, star, onReviewed } = renderSheet();
		fireEvent.click(star(5));

		fireEvent.click(submit);

		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith("이미 후기를 남긴 거래예요"),
		);
		expect(toast.success).not.toHaveBeenCalled();
		expect(onReviewed).toHaveBeenCalledTimes(1);
	});

	test("네트워크 오류로 요청이 던져져도 실패 토스트를 띄우고 다시 시도할 수 있다", async () => {
		const logged = spyOn(console, "error").mockImplementation(() => {});
		postReview.mockImplementationOnce(async () => {
			throw new Error("network down");
		});
		const { submit, star, onReviewed } = renderSheet();
		fireEvent.click(star(5));

		fireEvent.click(submit);

		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith(FAILED_MESSAGE),
		);
		await waitFor(() => expect(submit.disabled).toBe(false));
		expect(onReviewed).not.toHaveBeenCalled();
		logged.mockRestore();
	});

	test("닫기 버튼과 ESC로 닫을 수 있다", () => {
		const { dialog, onClose } = renderSheet();

		fireEvent.click(within(dialog).getByRole("button", { name: "닫기" }));
		fireEvent.keyDown(document, { key: "Escape" });

		expect(onClose).toHaveBeenCalledTimes(2);
	});

	test("바깥을 눌러 닫을 수 있지만, 쓰던 내용이 있으면 닫히지 않는다", () => {
		const { dialog, textarea, star, onClose } = renderSheet();

		fireEvent.click(dialog);
		expect(onClose).toHaveBeenCalledTimes(1);

		fireEvent.click(star(4));
		fireEvent.click(dialog);
		expect(onClose).toHaveBeenCalledTimes(1);

		fireEvent.click(star(4));
		fireEvent.change(textarea, { target: { value: "" } });
		// 별점을 골랐으면 그대로 초안이다. 내용만 지워서는 닫히지 않는다
		fireEvent.click(dialog);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	test("isOpen이 false면 아무것도 그리지 않는다", () => {
		const view = render(
			<ReviewBottomSheet
				isOpen={false}
				onClose={() => {}}
				transactionId="transaction-1"
			/>,
		);

		expect(isShown(view.queryByRole("dialog"))).toBe(false);
	});
});

function makeMarket(overrides: Partial<ChatMarketInfo> = {}): ChatMarketInfo {
	return {
		id: "market-1",
		title: "르세라핌 포토카드",
		price: 12000,
		status: "sold",
		userId: owner.id,
		thumbnail: null,
		transaction: {
			id: "transaction-1",
			buyerId: buyer.id,
			sellerId: owner.id,
			price: 12000,
			completedAt: "2026-10-02T00:00:00.000Z",
			myReviewed: false,
		},
		...overrides,
	};
}

function withMyReviewed(myReviewed: boolean): Partial<ChatMarketInfo> {
	const { transaction } = makeMarket();
	return transaction ? { transaction: { ...transaction, myReviewed } } : {};
}

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

describe("채팅방 배너의 후기 버튼", () => {
	afterEach(cleanup);
	beforeEach(() => {
		queryClient = new QueryClient();
		resetMocks();
	});

	test.each([
		["구매자", buyer.id, owner],
		["판매자", owner.id, buyer],
	])(
		"거래의 %s에게는 후기 남기기 버튼이 보이고, 버튼은 상품 링크 안이 아니라 옆에 있다",
		(_role, currentUserId, partner) => {
			const view = renderBanner({
				market: makeMarket(),
				currentUserId,
				partner,
			});

			const button = view.getByRole("button", { name: "후기 남기기" });
			expect(view.getByRole("link").contains(button)).toBe(false);
			expect(isShown(view.queryByText("후기 작성 완료"))).toBe(false);
			// 거래가 이미 있으므로 거래 완료 버튼은 없다
			expect(isShown(view.queryByRole("button", { name: "거래 완료" }))).toBe(
				false,
			);
		},
	);

	test.each([
		["구매자", buyer.id, owner],
		["판매자", owner.id, buyer],
	])(
		"이미 후기를 남긴 %s에게는 버튼 대신 후기 작성 완료가 보인다",
		(_role, currentUserId, partner) => {
			const view = renderBanner({
				market: makeMarket(withMyReviewed(true)),
				currentUserId,
				partner,
			});

			expect(isShown(view.queryByText("후기 작성 완료"))).toBe(true);
			expect(isShown(view.queryByRole("button", { name: "후기 남기기" }))).toBe(
				false,
			);
		},
	);

	test("거래 당사자가 아닌 채팅방 멤버에게는 둘 다 보이지 않는다", () => {
		const view = renderBanner({
			market: makeMarket(),
			currentUserId: "watcher-1",
			partner: owner,
		});

		expect(isShown(view.queryByRole("button", { name: "후기 남기기" }))).toBe(
			false,
		);
		expect(isShown(view.queryByText("후기 작성 완료"))).toBe(false);
	});

	test("거래가 없으면 보이지 않는다", () => {
		const view = renderBanner({
			market: makeMarket({ status: "available", transaction: null }),
			currentUserId: owner.id,
			partner: buyer,
		});

		expect(isShown(view.queryByRole("button", { name: "후기 남기기" }))).toBe(
			false,
		);
		expect(isShown(view.queryByText("후기 작성 완료"))).toBe(false);
	});

	test("누르면 시트가 열리고, 후기를 남기면 화면을 새로 받고 후기 작성 완료로 바뀐다", async () => {
		const view = renderBanner({
			market: makeMarket(),
			currentUserId: buyer.id,
			partner: owner,
		});

		fireEvent.click(view.getByRole("button", { name: "후기 남기기" }));
		const dialog = await view.findByRole("dialog");
		expect(
			isShown(within(dialog).queryByText("판매자님과의 거래는 어떠셨나요?")),
		).toBe(true);
		fireEvent.click(within(dialog).getByRole("button", { name: "별 5개" }));
		fireEvent.click(within(dialog).getByRole("button", { name: SUBMIT }));

		await waitFor(() =>
			expect(toast.success).toHaveBeenCalledWith("후기를 남겼어요"),
		);
		expect(transactions).toHaveBeenCalledWith({ id: "transaction-1" });
		expect(postReview).toHaveBeenCalledTimes(1);
		expect(postReview.mock.calls[0]?.[0]).toEqual({ rating: 5 });
		await waitFor(() =>
			expect(isShown(view.queryByRole("dialog"))).toBe(false),
		);
		// router.refresh()로 새 market이 내려오기 전에도 같은 거래에 다시 남길 수 없다
		expect(refresh).toHaveBeenCalledTimes(1);
		expect(isShown(view.queryByText("후기 작성 완료"))).toBe(true);
		expect(isShown(view.queryByRole("button", { name: "후기 남기기" }))).toBe(
			false,
		);
	});

	test("시트를 그냥 닫으면 API도 화면 갱신도 없고 버튼이 그대로 남는다", async () => {
		const view = renderBanner({
			market: makeMarket(),
			currentUserId: buyer.id,
			partner: owner,
		});

		fireEvent.click(view.getByRole("button", { name: "후기 남기기" }));
		const dialog = await view.findByRole("dialog");
		fireEvent.click(within(dialog).getByRole("button", { name: "닫기" }));

		await waitFor(() =>
			expect(isShown(view.queryByRole("dialog"))).toBe(false),
		);
		expect(postReview).not.toHaveBeenCalled();
		expect(refresh).not.toHaveBeenCalled();
		expect(isShown(view.queryByRole("button", { name: "후기 남기기" }))).toBe(
			true,
		);
	});

	test("이미 남긴 거래(409)면 안내와 함께 화면을 서버 상태에 맞춘다", async () => {
		postReview.mockImplementationOnce(async () =>
			edenResult(409, { error: "Already reviewed" }),
		);
		const view = renderBanner({
			market: makeMarket(),
			currentUserId: buyer.id,
			partner: owner,
		});

		fireEvent.click(view.getByRole("button", { name: "후기 남기기" }));
		const dialog = await view.findByRole("dialog");
		fireEvent.click(within(dialog).getByRole("button", { name: "별 4개" }));
		fireEvent.click(within(dialog).getByRole("button", { name: SUBMIT }));

		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith("이미 후기를 남긴 거래예요"),
		);
		await waitFor(() =>
			expect(isShown(view.queryByRole("dialog"))).toBe(false),
		);
		expect(refresh).toHaveBeenCalledTimes(1);
		expect(isShown(view.queryByText("후기 작성 완료"))).toBe(true);
	});

	test("실패하면 시트가 열린 채 남고 화면은 그대로다", async () => {
		postReview.mockImplementationOnce(async () => edenResult(500, {}));
		const view = renderBanner({
			market: makeMarket(),
			currentUserId: buyer.id,
			partner: owner,
		});

		fireEvent.click(view.getByRole("button", { name: "후기 남기기" }));
		const dialog = await view.findByRole("dialog");
		fireEvent.click(within(dialog).getByRole("button", { name: "별 1개" }));
		fireEvent.click(within(dialog).getByRole("button", { name: SUBMIT }));

		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith(FAILED_MESSAGE),
		);
		expect(isShown(view.queryByRole("dialog"))).toBe(true);
		expect(refresh).not.toHaveBeenCalled();
		expect(isShown(view.queryByText("후기 작성 완료"))).toBe(false);
	});

	test("이 방의 상대가 거래 상대가 아니면(거래하지 않은 구매 희망자와의 방) 이름 없이 묻는다", async () => {
		const view = renderBanner({
			market: makeMarket(),
			currentUserId: owner.id,
			partner: { id: "asker-1", nickname: "구경꾼" },
		});

		fireEvent.click(view.getByRole("button", { name: "후기 남기기" }));
		const dialog = await view.findByRole("dialog");

		expect(isShown(within(dialog).queryByText("거래는 어떠셨나요?"))).toBe(
			true,
		);
		expect(isShown(within(dialog).queryByText(/구경꾼/))).toBe(false);
	});

	test("상대가 방을 나가 partner가 없어도 후기는 남길 수 있다", async () => {
		const view = renderBanner({
			market: makeMarket(),
			currentUserId: owner.id,
			partner: null,
		});

		fireEvent.click(view.getByRole("button", { name: "후기 남기기" }));
		const dialog = await view.findByRole("dialog");

		expect(isShown(within(dialog).queryByText("거래는 어떠셨나요?"))).toBe(
			true,
		);
	});
});

describe("후기 쓰기 버튼(거래·구매 내역 항목)", () => {
	afterEach(cleanup);
	beforeEach(resetMocks);

	function renderButton() {
		return render(
			<OverlayProvider>
				<WriteReviewButton
					transactionId="transaction-9"
					partnerNickname="판매자"
				/>
			</OverlayProvider>,
		);
	}

	test("누르면 거래 상대 이름이 담긴 시트가 열리고, 후기를 남기면 목록을 새로 받고 버튼이 사라진다", async () => {
		const view = renderButton();

		fireEvent.click(view.getByRole("button", { name: "후기 쓰기" }));
		const dialog = await view.findByRole("dialog");
		expect(
			isShown(within(dialog).queryByText("판매자님과의 거래는 어떠셨나요?")),
		).toBe(true);
		fireEvent.click(within(dialog).getByRole("button", { name: "별 3개" }));
		fireEvent.change(within(dialog).getByRole("textbox"), {
			target: { value: "보통이었어요" },
		});
		fireEvent.click(within(dialog).getByRole("button", { name: SUBMIT }));

		await waitFor(() =>
			expect(toast.success).toHaveBeenCalledWith("후기를 남겼어요"),
		);
		expect(transactions).toHaveBeenCalledWith({ id: "transaction-9" });
		expect(postReview).toHaveBeenCalledWith({
			rating: 3,
			content: "보통이었어요",
		});
		expect(refresh).toHaveBeenCalledTimes(1);
		await waitFor(() =>
			expect(isShown(view.queryByRole("dialog"))).toBe(false),
		);
		expect(isShown(view.queryByRole("button", { name: "후기 쓰기" }))).toBe(
			false,
		);
	});

	test("시트를 그냥 닫으면 목록을 새로 받지 않고 버튼이 남는다", async () => {
		const view = renderButton();

		fireEvent.click(view.getByRole("button", { name: "후기 쓰기" }));
		const dialog = await view.findByRole("dialog");
		fireEvent.click(within(dialog).getByRole("button", { name: "닫기" }));

		await waitFor(() =>
			expect(isShown(view.queryByRole("dialog"))).toBe(false),
		);
		expect(postReview).not.toHaveBeenCalled();
		expect(refresh).not.toHaveBeenCalled();
		expect(isShown(view.queryByRole("button", { name: "후기 쓰기" }))).toBe(
			true,
		);
	});
});
