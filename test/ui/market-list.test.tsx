import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { registerDom } from "../helpers/dom";

type ListQuery = {
	status: string;
	condition: string;
	negotiable: boolean;
	cursor: string | null;
};

// 요청마다 응답 시점을 테스트가 정한다
const requests: {
	status: string;
	query: ListQuery;
	resolve: (value: unknown) => void;
}[] = [];
mock.module("@/components/market/v2/data/get-market-list", () => ({
	getMarketList: (query: ListQuery) =>
		new Promise((resolve) => {
			requests.push({ status: query.status, query, resolve });
		}),
}));
// 상품 카드(next/link·이미지) 대신 제목만 그린다
mock.module("@/components/market/v2/client/market-grid", () => ({
	default: ({ items }: { items: { id: string; title: string }[] }) => (
		<ul>
			{items.map((item) => (
				<li key={item.id}>{item.title}</li>
			))}
		</ul>
	),
}));

registerDom();
const { act, cleanup, fireEvent, render, within } = await import(
	"@testing-library/react"
);
const { default: MarketListClient } = await import(
	"@/components/market/v2/client/market-list-client"
);

const pageOf = (title: string, nextCursor: string | null = null) => ({
	data: {
		items: [{ id: title, title }],
		nextCursor,
		hasMore: nextCursor !== null,
	},
	error: null,
});

const defaultFilters = {
	keyword: "",
	status: "all",
	condition: "all",
	negotiable: false,
	sort: "latest",
} as const;

const emptyState = {
	items: [],
	nextCursor: null,
	hasMore: false,
	error: null,
};

describe("마켓 목록 필터", () => {
	beforeEach(() => {
		requests.length = 0;
		window.history.replaceState({}, "", "/market");
	});
	afterEach(cleanup);
	afterEach(async () => {
		// React는 진행 중인 비동기 전환을 전역으로 묶어, 전부 끝나야 isPending을 푼다.
		// 응답하지 않은 요청이 남으면 다음 테스트의 "더 보기" 버튼이 계속 비활성이라 모두 응답시킨다.
		await act(async () => {
			for (const request of requests) request.resolve(pageOf("남은 요청"));
		});
	});

	test("필터를 빠르게 바꾸면 늦게 도착한 이전 응답이 화면을 덮지 않는다", async () => {
		const view = render(
			<MarketListClient
				initialState={emptyState}
				initialFilters={defaultFilters}
				limit={20}
			/>,
		);

		fireEvent.click(view.getByRole("button", { name: "예약중" }));
		fireEvent.click(view.getByRole("button", { name: "판매완료" }));
		expect(requests.map((request) => request.status)).toEqual([
			"reserved",
			"sold",
		]);

		// 나중에 보낸 요청이 먼저 오고, 먼저 보낸 요청이 나중에 온다
		await act(async () => requests[1].resolve(pageOf("판매완료 상품")));
		await act(async () => requests[0].resolve(pageOf("예약중 상품")));

		expect(view.queryByText("판매완료 상품")).not.toBeNull();
		expect(view.queryByText("예약중 상품")).toBeNull();
	});

	test("상품 상태 칩과 협상 가능 토글이 요청과 주소창 쿼리에 반영된다", () => {
		const view = render(
			<MarketListClient
				initialState={emptyState}
				initialFilters={defaultFilters}
				limit={20}
			/>,
		);
		const conditionChips = within(
			view.getByRole("group", { name: "상품 상태" }),
		);
		const negotiableToggle = view.getByRole("button", { name: "협상 가능만" });

		fireEvent.click(conditionChips.getByRole("button", { name: "거의 새것" }));

		expect(requests.at(-1)?.query).toMatchObject({
			condition: "like-new",
			negotiable: false,
		});
		expect(window.location.search).toBe("?condition=like-new");
		expect(
			conditionChips
				.getByRole("button", { name: "거의 새것" })
				.getAttribute("aria-pressed"),
		).toBe("true");

		fireEvent.click(negotiableToggle);

		expect(requests.at(-1)?.query).toMatchObject({
			condition: "like-new",
			negotiable: true,
		});
		expect(window.location.search).toBe("?condition=like-new&negotiable=true");
		expect(negotiableToggle.getAttribute("aria-pressed")).toBe("true");

		// 판매 상태를 바꿔도 상품 상태와 협상 가능 조건이 유지된다
		fireEvent.click(view.getByRole("button", { name: "판매완료" }));

		expect(requests.at(-1)?.query).toMatchObject({
			status: "sold",
			condition: "like-new",
			negotiable: true,
		});

		// 전체와 토글 해제는 쿼리에서 빠진다
		fireEvent.click(conditionChips.getByRole("button", { name: "전체" }));
		fireEvent.click(negotiableToggle);

		expect(requests.at(-1)?.query).toMatchObject({
			status: "sold",
			condition: "all",
			negotiable: false,
		});
		expect(window.location.search).toBe("?status=sold");
	});

	test("더 보기도 선택한 상품 상태와 협상 가능 조건으로 다음 페이지를 요청한다", async () => {
		const view = render(
			<MarketListClient
				initialState={emptyState}
				initialFilters={defaultFilters}
				limit={20}
			/>,
		);

		fireEvent.click(view.getByRole("button", { name: "협상 가능만" }));
		await act(async () => requests[0].resolve(pageOf("첫 페이지", "cursor-1")));
		// 응답을 반영하는 전환이 끝나면 버튼이 다시 눌린다
		fireEvent.click(await view.findByRole("button", { name: "더 보기" }));

		expect(requests[1].query).toMatchObject({
			negotiable: true,
			cursor: "cursor-1",
		});
	});

	test("주소창의 필터로 시작하면 칩이 그 상태로 눌려 있다", () => {
		const view = render(
			<MarketListClient
				initialState={emptyState}
				initialFilters={{
					...defaultFilters,
					condition: "good",
					negotiable: true,
				}}
				limit={20}
			/>,
		);
		const conditionChips = within(
			view.getByRole("group", { name: "상품 상태" }),
		);

		expect(
			conditionChips
				.getByRole("button", { name: "사용감 적음" })
				.getAttribute("aria-pressed"),
		).toBe("true");
		expect(
			conditionChips
				.getByRole("button", { name: "전체" })
				.getAttribute("aria-pressed"),
		).toBe("false");
		expect(
			view
				.getByRole("button", { name: "협상 가능만" })
				.getAttribute("aria-pressed"),
		).toBe("true");
	});
});
