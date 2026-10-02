import {
	afterEach,
	beforeEach,
	describe,
	expect,
	mock,
	spyOn,
	test,
} from "bun:test";
import type { MarketListItem } from "@/components/market/v2/types";
import type { UserReviewItem } from "@/components/users/user-review-list";
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

type PageQuery = { query: { cursor?: string; limit?: number } };

const getMarkets = mock(
	async (_args: PageQuery): Promise<unknown> => edenResult(200, {}),
);
const marketsByUser = mock((_params: { userId: string }) => ({
	get: getMarkets,
}));
const getReviews = mock(
	async (_args: PageQuery): Promise<unknown> => edenResult(200, {}),
);
const usersById = mock((_params: { id: string }) => ({
	reviews: { get: getReviews },
}));

mock.module("@/utils/eden", () => ({
	api: { markets: { user: marketsByUser }, users: usersById },
}));

registerDom();
const { act, cleanup, fireEvent, render, waitFor } = await import(
	"@testing-library/react"
);
const { default: UserMarketList } = await import(
	"@/components/users/user-market-list"
);
const { default: UserReviewList } = await import(
	"@/components/users/user-review-list"
);

// 주의: waitFor 안에서 DOM 요소를 expect(...).toBeNull()로 비교하지 않는다. 실패하면 요소 전체를 문자열로 만드느라
// 이벤트 루프가 오래 막혀 화면이 갱신되지 않는다. 개수나 불리언으로 비교한다.

const SELLER_ID = "seller-1";
const LOAD_MORE = "더 보기";

/** 테스트가 응답 시점을 정하는 요청. 끝나지 않은 요청은 afterEach에서 모두 응답시킨다 */
const unanswered: ((value: unknown) => void)[] = [];

function holdRequest() {
	return new Promise<unknown>((resolve) => {
		unanswered.push(resolve);
	});
}

afterEach(cleanup);

afterEach(async () => {
	// React는 진행 중인 비동기 전환을 전역으로 묶어, 전부 끝나야 isPending을 푼다.
	// 응답하지 않은 요청이 남으면 다음 테스트의 "더 보기" 버튼이 계속 비활성이라 모두 응답시킨다.
	await act(async () => {
		for (const resolve of unanswered.splice(0)) {
			resolve(edenResult(500, { error: "남은 요청" }));
		}
	});
});

beforeEach(() => {
	for (const fn of [getMarkets, marketsByUser, getReviews, usersById]) {
		fn.mockReset();
	}
	marketsByUser.mockImplementation(() => ({ get: getMarkets }));
	usersById.mockImplementation(() => ({ reviews: { get: getReviews } }));
});

/** 화면에 있는 문구인지(요소를 단언에 그대로 넘기지 않는다) */
function hasText(
	view: { queryByText: (text: string) => unknown },
	text: string,
) {
	return view.queryByText(text) !== null;
}

/** 문구들이 화면에 이 순서대로 나오는지 */
function appearsInOrder(container: HTMLElement, texts: string[]) {
	const content = container.textContent ?? "";
	const positions = texts.map((text) => content.indexOf(text));
	return positions.every(
		(position, index) =>
			position >= 0 && (index === 0 || position > positions[index - 1]),
	);
}

describe("프로필의 판매 상품 목록", () => {
	function makeMarket(id: string): MarketListItem {
		return {
			id,
			title: `상품 ${id}`,
			description: null,
			price: 10000,
			condition: null,
			isNegotiable: false,
			group: null,
			artist: null,
			status: "available",
			createdAt: "2026-10-01T00:00:00.000Z",
			user: { id: SELLER_ID, nickname: "판매자", profileImage: null },
			images: [],
		};
	}

	const marketPage = (ids: string[], nextCursor: string | null = null) =>
		edenResult(200, {
			items: ids.map(makeMarket),
			nextCursor,
			hasMore: nextCursor !== null,
		});

	function renderList(
		props: { initialIds?: string[]; initialNextCursor?: string | null } = {},
	) {
		const { initialIds = ["m1", "m2"], initialNextCursor = "m2" } = props;
		return render(
			<UserMarketList
				userId={SELLER_ID}
				initialPage={{
					items: initialIds.map(makeMarket),
					nextCursor: initialNextCursor,
				}}
				limit={2}
			/>,
		);
	}

	test("더 보기를 누르면 다음 커서의 페이지를 불러와 아래에 붙인다", async () => {
		getMarkets.mockImplementationOnce(async () => marketPage(["m3", "m4"]));
		const view = renderList();
		expect(hasText(view, "상품 m1") && hasText(view, "상품 m2")).toBe(true);

		fireEvent.click(view.getByRole("button", { name: LOAD_MORE }));

		await waitFor(() => expect(hasText(view, "상품 m4")).toBe(true));
		expect(marketsByUser).toHaveBeenCalledWith({ userId: SELLER_ID });
		expect(getMarkets).toHaveBeenCalledTimes(1);
		expect(getMarkets).toHaveBeenCalledWith({
			query: { cursor: "m2", limit: 2 },
		});
		expect(
			appearsInOrder(view.container, [
				"상품 m1",
				"상품 m2",
				"상품 m3",
				"상품 m4",
			]),
		).toBe(true);
	});

	test("다음 페이지가 마지막이면 더 보기 버튼이 사라진다", async () => {
		getMarkets.mockImplementationOnce(async () => marketPage(["m3"], null));
		const view = renderList();

		fireEvent.click(view.getByRole("button", { name: LOAD_MORE }));

		await waitFor(() => expect(hasText(view, "상품 m3")).toBe(true));
		expect(view.queryAllByRole("button").length).toBe(0);
	});

	test("받은 커서를 이어서 쓰고, 이미 있는 상품이 다시 와도 한 번만 그린다", async () => {
		getMarkets
			.mockImplementationOnce(async () => marketPage(["m2", "m3"], "m3"))
			.mockImplementationOnce(async () => marketPage(["m4"]));
		const view = renderList();

		fireEvent.click(view.getByRole("button", { name: LOAD_MORE }));
		await waitFor(() => expect(hasText(view, "상품 m3")).toBe(true));
		// 요청이 끝나 버튼이 다시 눌릴 수 있게 되면 다음 페이지를 불러온다
		fireEvent.click(await view.findByRole("button", { name: LOAD_MORE }));
		await waitFor(() => expect(hasText(view, "상품 m4")).toBe(true));

		expect(getMarkets.mock.calls.map(([args]) => args.query.cursor)).toEqual([
			"m2",
			"m3",
		]);
		expect(view.queryAllByText("상품 m2").length).toBe(1);
	});

	test("불러오는 동안에는 버튼이 비활성화되어 요청을 한 번만 보낸다", async () => {
		getMarkets.mockImplementationOnce(holdRequest as () => Promise<unknown>);
		const view = renderList();
		const button = view.getByRole("button", {
			name: LOAD_MORE,
		}) as HTMLButtonElement;

		fireEvent.click(button);
		await waitFor(() => expect(button.disabled).toBe(true));
		fireEvent.click(button);

		expect(button.textContent).toBe("불러오는 중...");
		expect(getMarkets).toHaveBeenCalledTimes(1);

		await act(async () => unanswered.splice(0)[0](marketPage(["m3"])));
		await waitFor(() => expect(hasText(view, "상품 m3")).toBe(true));
	});

	test("불러오지 못하면 안내 문구를 보이고, 있던 상품과 더 보기 버튼은 그대로 두며, 다시 누르면 이어서 불러온다", async () => {
		getMarkets
			.mockImplementationOnce(async () =>
				edenResult(500, { error: "Internal Server Error" }),
			)
			.mockImplementationOnce(async () => marketPage(["m3"]));
		const view = renderList();

		fireEvent.click(view.getByRole("button", { name: LOAD_MORE }));
		await waitFor(() =>
			expect(
				hasText(view, "상품을 더 불러오지 못했습니다. 다시 시도해 주세요."),
			).toBe(true),
		);
		expect(hasText(view, "상품 m1") && hasText(view, "상품 m2")).toBe(true);

		// 요청이 끝나 버튼이 다시 눌릴 수 있게 되면 같은 버튼으로 다시 시도한다
		fireEvent.click(await view.findByRole("button", { name: LOAD_MORE }));
		await waitFor(() => expect(hasText(view, "상품 m3")).toBe(true));
		expect(
			hasText(view, "상품을 더 불러오지 못했습니다. 다시 시도해 주세요."),
		).toBe(false);
		// 실패한 요청도 같은 커서로 다시 보낸다
		expect(getMarkets.mock.calls.map(([args]) => args.query.cursor)).toEqual([
			"m2",
			"m2",
		]);
	});

	test("요청이 네트워크 오류로 던져져도 같은 안내 문구를 보인다", async () => {
		const logged = spyOn(console, "error").mockImplementation(() => {});
		getMarkets.mockImplementationOnce(async () => {
			throw new Error("network down");
		});
		const view = renderList();

		fireEvent.click(view.getByRole("button", { name: LOAD_MORE }));

		await waitFor(() =>
			expect(
				hasText(view, "상품을 더 불러오지 못했습니다. 다시 시도해 주세요."),
			).toBe(true),
		);
		expect(hasText(view, "상품 m1")).toBe(true);
		logged.mockRestore();
	});

	test("첫 페이지가 마지막이면 더 보기 버튼이 없다", () => {
		const view = renderList({ initialNextCursor: null });

		expect(hasText(view, "상품 m1")).toBe(true);
		expect(view.queryAllByRole("button").length).toBe(0);
		expect(getMarkets).not.toHaveBeenCalled();
	});

	test("올린 상품이 없으면 빈 상태 문구를 보인다", () => {
		const view = renderList({ initialIds: [], initialNextCursor: null });

		expect(hasText(view, "아직 판매 중인 상품이 없어요")).toBe(true);
		expect(view.queryAllByRole("button").length).toBe(0);
	});
});

describe("프로필의 후기 목록", () => {
	const hoursAgo = (hours: number) =>
		new Date(Date.now() - hours * 3_600_000).toISOString();

	function makeReview(
		id: string,
		overrides: Partial<UserReviewItem> = {},
	): UserReviewItem {
		return {
			id,
			rating: 5,
			content: `후기 ${id}`,
			createdAt: hoursAgo(3),
			reviewer: {
				id: `buyer-${id}`,
				nickname: `구매자 ${id}`,
				profileImage: null,
			},
			market: { id: `market-${id}`, title: `포카 ${id}` },
			...overrides,
		};
	}

	const reviewPage = (ids: string[], nextCursor: string | null = null) =>
		edenResult(200, {
			items: ids.map((id) => makeReview(id)),
			nextCursor,
			hasMore: nextCursor !== null,
		});

	function renderList(
		props: {
			initialItems?: UserReviewItem[];
			initialNextCursor?: string | null;
		} = {},
	) {
		const {
			initialItems = [makeReview("r1"), makeReview("r2")],
			initialNextCursor = "r2",
		} = props;
		return render(
			<UserReviewList
				userId={SELLER_ID}
				initialPage={{ items: initialItems, nextCursor: initialNextCursor }}
				limit={2}
			/>,
		);
	}

	test("별점과 내용, 작성자와 상품 링크, 상대 시간을 그린다", () => {
		const view = renderList({
			initialItems: [
				makeReview("r1", {
					rating: 4,
					content: "친절하고 빠르게 거래해 주셨어요",
					createdAt: hoursAgo(3),
					reviewer: { id: "buyer-1", nickname: "구매자", profileImage: null },
					market: { id: "market-1", title: "르세라핌 김채원 포카" },
				}),
			],
			initialNextCursor: null,
		});

		const stars = view.getByRole("img", { name: "별점 4점" });
		expect(stars.querySelectorAll("svg").length).toBe(4);
		expect(hasText(view, "친절하고 빠르게 거래해 주셨어요")).toBe(true);
		expect(
			view.getByRole("link", { name: "구매자" }).getAttribute("href"),
		).toBe("/users/buyer-1");
		expect(
			view
				.getByRole("link", { name: "르세라핌 김채원 포카" })
				.getAttribute("href"),
		).toBe("/market/market-1");
		expect(hasText(view, "3시간 전")).toBe(true);
	});

	test.each([1, 3, 5])("별점 %i점은 별 %i개로 그린다", (rating) => {
		const view = renderList({
			initialItems: [makeReview("r1", { rating })],
			initialNextCursor: null,
		});

		const stars = view.getByLabelText(`별점 ${rating}점`);
		expect(stars.querySelectorAll("svg").length).toBe(rating);
	});

	test("후기마다 자기 별점과 내용을 그린다", () => {
		const view = renderList({
			initialItems: [
				makeReview("r1", { rating: 5, content: "최고예요" }),
				makeReview("r2", { rating: 2, content: "아쉬웠어요" }),
			],
			initialNextCursor: null,
		});

		expect(view.queryAllByRole("listitem").length).toBe(2);
		expect(view.getByLabelText("별점 5점").querySelectorAll("svg").length).toBe(
			5,
		);
		expect(view.getByLabelText("별점 2점").querySelectorAll("svg").length).toBe(
			2,
		);
		expect(hasText(view, "최고예요") && hasText(view, "아쉬웠어요")).toBe(true);
	});

	test("내용을 적지 않은 후기는 별점과 거래 정보만 그린다", () => {
		const view = renderList({
			initialItems: [makeReview("r1", { rating: 3, content: null })],
			initialNextCursor: null,
		});

		expect(view.getByLabelText("별점 3점") !== null).toBe(true);
		expect(hasText(view, "구매자 r1")).toBe(true);
		expect(view.container.textContent).not.toContain("null");
	});

	test("더 보기를 누르면 다음 커서의 후기를 불러와 아래에 붙인다", async () => {
		getReviews.mockImplementationOnce(async () => reviewPage(["r3", "r4"]));
		const view = renderList();

		fireEvent.click(view.getByRole("button", { name: LOAD_MORE }));

		await waitFor(() => expect(hasText(view, "후기 r4")).toBe(true));
		expect(usersById).toHaveBeenCalledWith({ id: SELLER_ID });
		expect(getReviews).toHaveBeenCalledTimes(1);
		expect(getReviews).toHaveBeenCalledWith({
			query: { cursor: "r2", limit: 2 },
		});
		expect(view.queryAllByRole("listitem").length).toBe(4);
		expect(
			appearsInOrder(view.container, [
				"후기 r1",
				"후기 r2",
				"후기 r3",
				"후기 r4",
			]),
		).toBe(true);
		// 마지막 페이지라 버튼이 사라진다
		expect(view.queryAllByRole("button").length).toBe(0);
	});

	test("불러오지 못하면 안내 문구를 보이고 있던 후기와 더 보기 버튼은 그대로 둔다", async () => {
		getReviews.mockImplementationOnce(async () =>
			edenResult(500, { error: "Internal Server Error" }),
		);
		const view = renderList();

		fireEvent.click(view.getByRole("button", { name: LOAD_MORE }));

		await waitFor(() =>
			expect(
				hasText(view, "후기를 더 불러오지 못했습니다. 다시 시도해 주세요."),
			).toBe(true),
		);
		expect(view.queryAllByRole("listitem").length).toBe(2);
		// 요청이 끝나면 다시 시도할 수 있게 버튼이 살아난다
		expect(
			(await view.findByRole("button", { name: LOAD_MORE })) !== null,
		).toBe(true);
	});

	test("받은 후기가 없으면 빈 상태 문구를 보인다", () => {
		const view = renderList({ initialItems: [], initialNextCursor: null });

		expect(hasText(view, "아직 받은 후기가 없어요")).toBe(true);
		expect(view.queryAllByRole("listitem").length).toBe(0);
		expect(view.queryAllByRole("button").length).toBe(0);
	});
});
