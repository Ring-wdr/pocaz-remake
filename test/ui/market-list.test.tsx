import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import type { ComponentProps } from "react";
import { registerDom } from "../helpers/dom";

type ListQuery = {
	status: string;
	condition: string;
	negotiable: boolean;
	groupId: string | null;
	artistId: string | null;
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
const { QueryClient, QueryClientProvider } = await import(
	"@tanstack/react-query"
);
const { default: MarketListClient } = await import(
	"@/components/market/v2/client/market-list-client"
);
const { groupArtistsQueryOptions } = await import("@/lib/queries/artists");

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
	groupId: null,
	artistId: null,
	sort: "latest",
} as const;

const emptyState = {
	items: [],
	nextCursor: null,
	hasMore: false,
	error: null,
};

const groups = [
	{ id: "group-1", name: "르세라핌" },
	{ id: "group-2", name: "뉴진스" },
];
const artistsOfGroup1 = [
	{ id: "artist-1", name: "김채원" },
	{ id: "artist-2", name: "사쿠라" },
];
const artistsOfGroup2 = [{ id: "artist-3", name: "민지" }];

// 멤버 목록은 클라이언트가 가져오므로 쿼리 클라이언트가 필요하다. 요청이 남지 않게 캐시에 미리 넣어 두고 쓴다.
let queryClient = new QueryClient();

function seedArtists() {
	queryClient.setQueryData(
		groupArtistsQueryOptions("group-1").queryKey,
		artistsOfGroup1,
	);
	queryClient.setQueryData(
		groupArtistsQueryOptions("group-2").queryKey,
		artistsOfGroup2,
	);
}

function renderList(
	props: Partial<ComponentProps<typeof MarketListClient>> = {},
) {
	return render(
		<QueryClientProvider client={queryClient}>
			<MarketListClient
				initialState={emptyState}
				initialFilters={defaultFilters}
				groups={[]}
				initialGroupArtists={null}
				limit={20}
				{...props}
			/>
		</QueryClientProvider>,
	);
}

describe("마켓 목록 필터", () => {
	beforeEach(() => {
		requests.length = 0;
		queryClient = new QueryClient();
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
		const view = renderList();

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
		const view = renderList();
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
		const view = renderList();

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
		const view = renderList({
			initialFilters: {
				...defaultFilters,
				condition: "good",
				negotiable: true,
			},
		});
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

	test("그룹 칩과 멤버 칩이 요청과 주소창 쿼리에 반영되고, 그룹을 바꾸면 멤버 선택이 풀린다", () => {
		seedArtists();
		const view = renderList({ groups });
		const groupChips = within(view.getByRole("group", { name: "그룹" }));
		// 그룹을 고르기 전에는 멤버 칩 줄이 없다
		expect(view.queryByRole("group", { name: "멤버" })).toBeNull();
		expect(
			groupChips
				.getByRole("button", { name: "전체" })
				.getAttribute("aria-pressed"),
		).toBe("true");

		fireEvent.click(groupChips.getByRole("button", { name: "르세라핌" }));

		expect(requests.at(-1)?.query).toMatchObject({
			groupId: "group-1",
			artistId: null,
		});
		expect(window.location.search).toBe("?groupId=group-1");
		const memberChips = within(view.getByRole("group", { name: "멤버" }));
		expect(
			groupChips
				.getByRole("button", { name: "르세라핌" })
				.getAttribute("aria-pressed"),
		).toBe("true");
		expect(
			memberChips
				.getByRole("button", { name: "그룹 전체" })
				.getAttribute("aria-pressed"),
		).toBe("true");

		fireEvent.click(memberChips.getByRole("button", { name: "김채원" }));

		expect(requests.at(-1)?.query).toMatchObject({
			groupId: "group-1",
			artistId: "artist-1",
		});
		expect(window.location.search).toBe("?groupId=group-1&artistId=artist-1");

		// 판매 상태를 바꿔도 그룹·멤버 조건이 유지된다
		fireEvent.click(view.getByRole("button", { name: "판매완료" }));

		expect(requests.at(-1)?.query).toMatchObject({
			status: "sold",
			groupId: "group-1",
			artistId: "artist-1",
		});

		// 다른 그룹을 고르면 멤버 선택은 풀리고, 새 그룹의 멤버 칩이 나온다
		fireEvent.click(groupChips.getByRole("button", { name: "뉴진스" }));

		expect(requests.at(-1)?.query).toMatchObject({
			groupId: "group-2",
			artistId: null,
		});
		expect(window.location.search).toBe("?groupId=group-2&status=sold");
		const newMemberChips = within(view.getByRole("group", { name: "멤버" }));
		expect(newMemberChips.getByRole("button", { name: "민지" })).toBeDefined();
		expect(newMemberChips.queryByRole("button", { name: "김채원" })).toBeNull();

		// 전체로 돌아가면 쿼리에서 빠지고 멤버 칩 줄도 사라진다
		fireEvent.click(groupChips.getByRole("button", { name: "전체" }));

		expect(requests.at(-1)?.query).toMatchObject({
			groupId: null,
			artistId: null,
		});
		expect(window.location.search).toBe("?status=sold");
		expect(view.queryByRole("group", { name: "멤버" })).toBeNull();
	});

	test("더 보기도 고른 그룹·멤버 조건으로 다음 페이지를 요청한다", async () => {
		seedArtists();
		const view = renderList({ groups });
		fireEvent.click(
			within(view.getByRole("group", { name: "그룹" })).getByRole("button", {
				name: "르세라핌",
			}),
		);
		fireEvent.click(
			within(view.getByRole("group", { name: "멤버" })).getByRole("button", {
				name: "김채원",
			}),
		);

		// 그룹만 고른 요청은 이미 밀려난 요청이라 반영되지 않고, 멤버까지 고른 요청의 결과가 화면에 남는다
		await act(async () => {
			requests[0].resolve(pageOf("그룹만 고른 목록"));
			requests[1].resolve(pageOf("첫 페이지", "cursor-1"));
		});
		fireEvent.click(await view.findByRole("button", { name: "더 보기" }));

		expect(requests[2].query).toMatchObject({
			groupId: "group-1",
			artistId: "artist-1",
			cursor: "cursor-1",
		});
	});

	test("주소창의 그룹·멤버로 시작하면 칩이 눌려 있고, 서버가 넘긴 멤버 목록이 바로 보인다", () => {
		const view = renderList({
			groups,
			initialFilters: {
				...defaultFilters,
				groupId: "group-1",
				artistId: "artist-2",
			},
			initialGroupArtists: { groupId: "group-1", artists: artistsOfGroup1 },
		});
		const groupChips = within(view.getByRole("group", { name: "그룹" }));
		const memberChips = within(view.getByRole("group", { name: "멤버" }));

		expect(
			groupChips
				.getByRole("button", { name: "르세라핌" })
				.getAttribute("aria-pressed"),
		).toBe("true");
		expect(
			memberChips
				.getByRole("button", { name: "사쿠라" })
				.getAttribute("aria-pressed"),
		).toBe("true");
		expect(
			memberChips
				.getByRole("button", { name: "김채원" })
				.getAttribute("aria-pressed"),
		).toBe("false");
		expect(
			memberChips
				.getByRole("button", { name: "그룹 전체" })
				.getAttribute("aria-pressed"),
		).toBe("false");
	});

	test("그룹 목록이 비어 있으면 그룹 칩 줄을 그리지 않는다", () => {
		const view = renderList({ groups: [] });

		expect(view.queryByRole("group", { name: "그룹" })).toBeNull();
		expect(view.queryByRole("group", { name: "멤버" })).toBeNull();
		// 다른 필터 줄은 그대로 있다
		expect(view.queryByRole("group", { name: "상품 상태" })).not.toBeNull();
	});
});
