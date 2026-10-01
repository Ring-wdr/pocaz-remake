import { afterEach, describe, expect, mock, test } from "bun:test";
import { registerDom } from "../helpers/dom";

// 요청마다 응답 시점을 테스트가 정한다
const requests: { status: string; resolve: (value: unknown) => void }[] = [];
mock.module("@/components/market/v2/data/get-market-list", () => ({
	getMarketList: (query: { status: string }) =>
		new Promise((resolve) => {
			requests.push({ status: query.status, resolve });
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
const { act, cleanup, fireEvent, render } = await import(
	"@testing-library/react"
);
const { default: MarketListClient } = await import(
	"@/components/market/v2/client/market-list-client"
);

const pageOf = (title: string) => ({
	data: {
		items: [{ id: title, title }],
		nextCursor: null,
		hasMore: false,
	},
	error: null,
});

describe("마켓 목록 필터", () => {
	afterEach(cleanup);

	test("필터를 빠르게 바꾸면 늦게 도착한 이전 응답이 화면을 덮지 않는다", async () => {
		const view = render(
			<MarketListClient
				initialState={{
					items: [],
					nextCursor: null,
					hasMore: false,
					error: null,
				}}
				initialFilters={{ keyword: "", status: "all", sort: "latest" }}
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
});
