import { afterEach, describe, expect, test } from "bun:test";
import type { MarketListItem } from "@/components/market/v2/types";
import { registerDom } from "../helpers/dom";

registerDom();
const { cleanup, render } = await import("@testing-library/react");
const { default: MarketGridItem } = await import(
	"@/components/market/v2/client/market-grid-item"
);

/** 지금부터 minutes분 전 시각 */
const minutesAgo = (minutes: number) =>
	new Date(Date.now() - minutes * 60_000).toISOString();

function makeItem(overrides: Partial<MarketListItem> = {}): MarketListItem {
	return {
		id: "market-1",
		title: "르세라핌 김채원 포카",
		description: null,
		price: 15000,
		condition: null,
		isNegotiable: false,
		group: null,
		artist: null,
		status: "available",
		createdAt: minutesAgo(3),
		user: { id: "seller-1", nickname: "판매자", profileImage: null },
		images: [],
		...overrides,
	};
}

describe("마켓 목록 카드의 올린 시간", () => {
	afterEach(cleanup);

	test("판매자 이름 옆에 상대 시간(3분 전)을 보여 준다", () => {
		const view = render(<MarketGridItem item={makeItem()} />);

		const posted = view.getByText("3분 전");
		expect(posted.tagName).toBe("TIME");
		// 이름은 그대로 따로 보이고, 시간과 같은 줄에 놓인다
		expect(view.getByText("판매자").parentElement).toBe(posted.parentElement);
	});

	test("<time>에는 올린 시각이 그대로 들어간다", () => {
		const createdAt = minutesAgo(3);
		const view = render(<MarketGridItem item={makeItem({ createdAt })} />);

		expect(view.getByText("3분 전").getAttribute("datetime")).toBe(createdAt);
	});

	test("Eden이 날짜 문자열을 Date로 바꿔 줘도 <time>에는 ISO 시각이 들어간다", () => {
		const createdAt = new Date(minutesAgo(3));
		const view = render(
			<MarketGridItem
				item={makeItem({ createdAt: createdAt as unknown as string })}
			/>,
		);

		const posted = view.getByText("3분 전");
		expect(posted.getAttribute("datetime")).toBe(createdAt.toISOString());
	});

	test("읽을 수 없는 시각이어도 카드는 그려지고 datetime만 빠진다", () => {
		const view = render(
			<MarketGridItem item={makeItem({ createdAt: "not-a-date" })} />,
		);

		expect(view.queryByText("판매자")).not.toBeNull();
		const posted = view.container.querySelector("time");
		expect(posted?.hasAttribute("datetime")).toBe(false);
	});

	test.each([
		["방금 전", 0],
		["59분 전", 59],
		["1시간 전", 60],
		["5시간 전", 5 * 60],
		["1일 전", 24 * 60],
		["6일 전", 6 * 24 * 60],
	])("%s로 줄여 보여 준다", (text, minutes) => {
		const view = render(
			<MarketGridItem item={makeItem({ createdAt: minutesAgo(minutes) })} />,
		);

		expect(view.queryByText(text)).not.toBeNull();
	});

	test("일주일이 넘으면 날짜로 보여 준다", () => {
		const view = render(
			<MarketGridItem
				item={makeItem({ createdAt: "2020-01-02T03:00:00.000Z" })}
			/>,
		);

		expect(view.queryByText("2020.01.02")).not.toBeNull();
	});

	test("판매완료 상품에도 올린 시간이 보인다", () => {
		const view = render(<MarketGridItem item={makeItem({ status: "sold" })} />);

		expect(view.queryByText("3분 전")).not.toBeNull();
		expect(view.queryByText("판매완료")).not.toBeNull();
	});

	test("시간을 넣어도 카드 링크의 이름과 주소는 그대로다", () => {
		const view = render(<MarketGridItem item={makeItem()} />);

		const link = view.getByRole("link", {
			name: "르세라핌 김채원 포카, 판매중, 15,000원",
		});
		expect(link.getAttribute("href")).toBe("/market/market-1");
	});
});
