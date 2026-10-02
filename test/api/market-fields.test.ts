import { beforeEach, describe, expect, test } from "bun:test";
import { prisma } from "@/lib/prisma";
import { callApi } from "../helpers/api";
import { createUser, hasTestDb, resetDb } from "../helpers/db";

type ListItem = {
	title: string;
	condition: string | null;
	isNegotiable: boolean;
};

const titlesOf = (res: { body: Record<string, unknown> }) =>
	(res.body.items as ListItem[]).map((item) => item.title).sort();

/**
 * 필터 테스트용 상품. 상태·협상 여부·판매 상태가 서로 다르게 섞여 있다.
 */
async function seedMarkets(userId: string) {
	const rows = [
		{ title: "포카 A", condition: "new", isNegotiable: true },
		{ title: "포카 B", condition: "like-new", isNegotiable: false },
		{ title: "포카 C", condition: "good", isNegotiable: true },
		{ title: "포카 D", condition: "used", isNegotiable: false },
		{ title: "포카 E", condition: null, isNegotiable: true },
		{ title: "포카 F", condition: "new", isNegotiable: false, status: "sold" },
		{ title: "포카 G", condition: "good", isNegotiable: true, status: "sold" },
	];
	for (const row of rows) {
		await prisma.market.create({ data: { ...row, price: 1000, userId } });
	}
}

describe.skipIf(!hasTestDb)("POST /markets 상태·협상 가능 필드", () => {
	beforeEach(resetDb);

	test("condition과 isNegotiable을 저장하고 응답과 상세에 돌려준다", async () => {
		const { auth } = await createUser("판매자");

		const created = await callApi("POST", "/markets", {
			user: auth,
			body: {
				title: "르세라핌 김채원 포카",
				description: "상세 설명",
				price: 15000,
				condition: "like-new",
				isNegotiable: true,
			},
		});

		expect(created.status).toBe(201);
		expect(created.body).toMatchObject({
			condition: "like-new",
			isNegotiable: true,
			description: "상세 설명",
		});
		const row = await prisma.market.findUniqueOrThrow({
			where: { id: created.body.id as string },
		});
		expect(row).toMatchObject({
			condition: "like-new",
			isNegotiable: true,
			description: "상세 설명",
		});

		const detail = await callApi("GET", `/markets/${created.body.id}`);
		expect(detail.status).toBe(200);
		expect(detail.body).toMatchObject({
			condition: "like-new",
			isNegotiable: true,
		});
	});

	test("생략하면 상태는 비어 있고 협상 불가다", async () => {
		const { auth } = await createUser("판매자");

		const created = await callApi("POST", "/markets", {
			user: auth,
			body: { title: "상태 미입력", price: 1000 },
		});

		expect(created.status).toBe(201);
		expect(created.body).toMatchObject({
			condition: null,
			isNegotiable: false,
		});
	});

	test("알 수 없는 상태 값이나 잘못된 타입은 422", async () => {
		const { auth } = await createUser("판매자");

		const badCondition = await callApi("POST", "/markets", {
			user: auth,
			body: { title: "포카", condition: "mint" },
		});
		const badNegotiable = await callApi("POST", "/markets", {
			user: auth,
			body: { title: "포카", isNegotiable: "yes" },
		});

		expect(badCondition.status).toBe(422);
		expect(badNegotiable.status).toBe(422);
		expect(await prisma.market.count()).toBe(0);
	});
});

describe.skipIf(!hasTestDb)("PUT /markets/:id 상태·협상 가능 필드", () => {
	beforeEach(resetDb);

	test("상태와 협상 가능 여부를 바꾼다", async () => {
		const { user, auth } = await createUser("판매자");
		const market = await prisma.market.create({
			data: {
				title: "포카",
				condition: "new",
				isNegotiable: false,
				price: 1000,
				userId: user.id,
			},
		});

		const res = await callApi("PUT", `/markets/${market.id}`, {
			user: auth,
			body: { condition: "used", isNegotiable: true },
		});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			condition: "used",
			isNegotiable: true,
			title: "포카",
		});
		const row = await prisma.market.findUniqueOrThrow({
			where: { id: market.id },
		});
		expect(row).toMatchObject({ condition: "used", isNegotiable: true });
	});

	test("다른 필드만 바꾸면 상태와 협상 가능 여부는 그대로다", async () => {
		const { user, auth } = await createUser("판매자");
		const market = await prisma.market.create({
			data: {
				title: "포카",
				condition: "good",
				isNegotiable: true,
				price: 1000,
				userId: user.id,
			},
		});

		const res = await callApi("PUT", `/markets/${market.id}`, {
			user: auth,
			body: { title: "새 제목" },
		});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			title: "새 제목",
			condition: "good",
			isNegotiable: true,
		});
	});

	test("주인이 아니면 403이고 값은 바뀌지 않는다", async () => {
		const owner = await createUser("판매자");
		const other = await createUser("다른사람");
		const market = await prisma.market.create({
			data: { title: "포카", condition: "new", userId: owner.user.id },
		});

		const res = await callApi("PUT", `/markets/${market.id}`, {
			user: other.auth,
			body: { condition: "used", isNegotiable: true },
		});

		expect(res.status).toBe(403);
		const row = await prisma.market.findUniqueOrThrow({
			where: { id: market.id },
		});
		expect(row).toMatchObject({ condition: "new", isNegotiable: false });
	});
});

describe.skipIf(!hasTestDb)("상품 목록의 상태·협상 가능 필터", () => {
	beforeEach(async () => {
		await resetDb();
		const { user } = await createUser("판매자");
		await seedMarkets(user.id);
	});

	test("GET /markets: condition으로 거른다", async () => {
		const res = await callApi("GET", "/markets?condition=good");

		expect(res.status).toBe(200);
		expect(titlesOf(res)).toEqual(["포카 C", "포카 G"]);
	});

	test("GET /markets: negotiable=true면 협상 가능한 상품만, false면 협상 불가만", async () => {
		const yes = await callApi("GET", "/markets?negotiable=true");
		const no = await callApi("GET", "/markets?negotiable=false");

		expect(titlesOf(yes)).toEqual(["포카 A", "포카 C", "포카 E", "포카 G"]);
		expect(titlesOf(no)).toEqual(["포카 B", "포카 D", "포카 F"]);
	});

	test("GET /markets: 필터를 주지 않으면 모두 돌려주고 응답에 두 필드가 있다", async () => {
		const res = await callApi("GET", "/markets");

		expect(res.status).toBe(200);
		const items = res.body.items as ListItem[];
		expect(items).toHaveLength(7);
		const first = items.find((item) => item.title === "포카 A");
		expect(first).toMatchObject({ condition: "new", isNegotiable: true });
		const noCondition = items.find((item) => item.title === "포카 E");
		expect(noCondition?.condition).toBeNull();
	});

	test("GET /markets: 두 필터를 함께 쓰면 둘 다 만족하는 상품만", async () => {
		const both = await callApi(
			"GET",
			"/markets?condition=good&negotiable=true",
		);
		const none = await callApi(
			"GET",
			"/markets?condition=like-new&negotiable=true",
		);

		expect(titlesOf(both)).toEqual(["포카 C", "포카 G"]);
		expect(titlesOf(none)).toEqual([]);
	});

	test("GET /markets/search: 키워드·판매 상태와 함께 거른다", async () => {
		const keyword = encodeURIComponent("포카");

		const byCondition = await callApi(
			"GET",
			`/markets/search?keyword=${keyword}&condition=new`,
		);
		const byNegotiable = await callApi(
			"GET",
			`/markets/search?keyword=${keyword}&negotiable=true&status=sold`,
		);
		const all = await callApi(
			"GET",
			`/markets/search?keyword=${keyword}&condition=good&negotiable=true&status=available`,
		);

		expect(titlesOf(byCondition)).toEqual(["포카 A", "포카 F"]);
		expect(titlesOf(byNegotiable)).toEqual(["포카 G"]);
		expect(titlesOf(all)).toEqual(["포카 C"]);
	});

	test("GET /markets/status/:status: 판매 상태 안에서 거른다", async () => {
		const sold = await callApi("GET", "/markets/status/sold?condition=new");
		const soldNegotiable = await callApi(
			"GET",
			"/markets/status/sold?negotiable=true",
		);
		const availableNegotiable = await callApi(
			"GET",
			"/markets/status/available?negotiable=true",
		);

		expect(titlesOf(sold)).toEqual(["포카 F"]);
		expect(titlesOf(soldNegotiable)).toEqual(["포카 G"]);
		expect(titlesOf(availableNegotiable)).toEqual([
			"포카 A",
			"포카 C",
			"포카 E",
		]);
	});

	test("필터를 건 채로 다음 페이지를 이어서 가져온다", async () => {
		const first = await callApi("GET", "/markets?negotiable=true&limit=3");
		expect(first.body.hasMore).toBe(true);
		const second = await callApi(
			"GET",
			`/markets?negotiable=true&limit=3&cursor=${first.body.nextCursor}`,
		);

		const items = [
			...(first.body.items as ListItem[]),
			...(second.body.items as ListItem[]),
		];
		expect(items.map((item) => item.title).sort()).toEqual([
			"포카 A",
			"포카 C",
			"포카 E",
			"포카 G",
		]);
		expect(items.every((item) => item.isNegotiable)).toBe(true);
		expect(second.body.hasMore).toBe(false);
	});

	test("알 수 없는 condition이나 negotiable 값은 422", async () => {
		const badCondition = await callApi("GET", "/markets?condition=mint");
		const badNegotiable = await callApi("GET", "/markets?negotiable=maybe");
		const badStatusCondition = await callApi(
			"GET",
			"/markets/status/sold?condition=mint",
		);
		const badSearch = await callApi(
			"GET",
			`/markets/search?keyword=${encodeURIComponent("포카")}&negotiable=1`,
		);

		expect(badCondition.status).toBe(422);
		expect(badNegotiable.status).toBe(422);
		expect(badStatusCondition.status).toBe(422);
		expect(badSearch.status).toBe(422);
	});
});

describe.skipIf(!hasTestDb)("상품 응답의 상태·협상 가능 필드", () => {
	beforeEach(resetDb);

	test("사용자별 목록과 상세에도 두 필드가 담긴다", async () => {
		const { user } = await createUser("판매자");
		const market = await prisma.market.create({
			data: {
				title: "포카",
				condition: "like-new",
				isNegotiable: true,
				userId: user.id,
			},
		});

		const list = await callApi("GET", `/markets/user/${user.id}`);
		const detail = await callApi("GET", `/markets/${market.id}`);

		expect(list.status).toBe(200);
		expect((list.body.items as ListItem[])[0]).toMatchObject({
			condition: "like-new",
			isNegotiable: true,
		});
		expect(detail.body).toMatchObject({
			condition: "like-new",
			isNegotiable: true,
		});
	});

	test("DB에 알 수 없는 상태 값이 들어 있어도 500 대신 null로 내보낸다", async () => {
		const { user } = await createUser("판매자");
		const market = await prisma.market.create({
			data: { title: "포카", condition: "mint", userId: user.id },
		});

		const list = await callApi("GET", "/markets");
		const detail = await callApi("GET", `/markets/${market.id}`);

		expect(list.status).toBe(200);
		expect((list.body.items as ListItem[])[0].condition).toBeNull();
		expect(detail.status).toBe(200);
		expect(detail.body.condition).toBeNull();
	});
});
