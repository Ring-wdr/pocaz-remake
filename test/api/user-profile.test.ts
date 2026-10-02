import { beforeEach, describe, expect, test } from "bun:test";
import { prisma } from "@/lib/prisma";
import { callApi } from "../helpers/api";
import { createUser, hasTestDb, resetDb } from "../helpers/db";

const NO_SUCH_ID = "00000000-0000-0000-0000-000000000000";

type TestAccount = Awaited<ReturnType<typeof createUser>>;

/** 판매 상태가 정해진 상품을 DB에 바로 만든다 */
async function createMarket(
	seller: TestAccount,
	status: "available" | "reserved" | "sold",
	title = `${status} 포카`,
) {
	return prisma.market.create({
		data: { title, price: 10000, status, userId: seller.user.id },
	});
}

describe.skipIf(!hasTestDb)("GET /users/:id의 판매중 상품 수", () => {
	beforeEach(resetDb);

	test("activeMarketCount는 판매중인 상품만 센다", async () => {
		const seller = await createUser("판매자");
		await createMarket(seller, "available", "판매중 A");
		await createMarket(seller, "available", "판매중 B");
		await createMarket(seller, "reserved");
		await createMarket(seller, "sold");

		const res = await callApi("GET", `/users/${seller.user.id}`);

		expect(res.status).toBe(200);
		expect(res.body.activeMarketCount).toBe(2);
	});

	test("다른 사람의 판매중 상품은 세지 않고, 올린 상품이 없으면 0이다", async () => {
		const seller = await createUser("판매자");
		const other = await createUser("다른 판매자");
		const newbie = await createUser("새내기");
		await createMarket(seller, "available");
		await createMarket(other, "available");
		await createMarket(other, "available");

		const sellerRes = await callApi("GET", `/users/${seller.user.id}`);
		const newbieRes = await callApi("GET", `/users/${newbie.user.id}`);

		expect(sellerRes.body.activeMarketCount).toBe(1);
		expect(newbieRes.body.activeMarketCount).toBe(0);
	});

	test("상태가 바뀌면 수도 바뀐다", async () => {
		const seller = await createUser("판매자");
		const market = await createMarket(seller, "available");
		await createMarket(seller, "available");
		const count = async () =>
			(await callApi("GET", `/users/${seller.user.id}`)).body.activeMarketCount;

		const before = await count();
		const reserve = await callApi("PUT", `/markets/${market.id}`, {
			user: seller.auth,
			body: { status: "reserved" },
		});
		const afterReserve = await count();
		await callApi("PUT", `/markets/${market.id}`, {
			user: seller.auth,
			body: { status: "available" },
		});
		const afterRestore = await count();

		expect(reserve.status).toBe(200);
		expect([before, afterReserve, afterRestore]).toEqual([2, 1, 2]);
	});

	test("기존 필드는 그대로 돌려준다", async () => {
		const seller = await createUser("판매자");

		const res = await callApi("GET", `/users/${seller.user.id}`);

		expect(res.body).toEqual({
			id: seller.user.id,
			nickname: "판매자",
			profileImage: null,
			score: 0,
			createdAt: seller.user.createdAt.toISOString(),
			tradeCount: 0,
			reviewCount: 0,
			averageRating: null,
			activeMarketCount: 0,
		});
	});
});

describe.skipIf(!hasTestDb)("공개 프로필 조회", () => {
	beforeEach(resetDb);

	test("로그인하지 않아도 프로필을 볼 수 있다", async () => {
		const seller = await createUser("판매자");

		const res = await callApi("GET", `/users/${seller.user.id}`);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			id: seller.user.id,
			nickname: "판매자",
		});
		// 이메일 같은 비공개 정보는 내보내지 않는다
		expect(res.body).not.toHaveProperty("email");
		expect(res.body).not.toHaveProperty("supabaseId");
	});

	test("프로필 페이지가 쓰는 판매 상품·후기 목록도 로그인 없이 볼 수 있다", async () => {
		const seller = await createUser("판매자");
		await createMarket(seller, "available");

		const markets = await callApi("GET", `/markets/user/${seller.user.id}`);
		const reviews = await callApi("GET", `/users/${seller.user.id}/reviews`);

		expect(markets.status).toBe(200);
		expect(markets.body.items).toHaveLength(1);
		expect(reviews.status).toBe(200);
	});

	test("/users/me는 공개 프로필 경로에 가려지지 않고 로그인한 사용자 자신을 돌려준다", async () => {
		const me = await createUser("나");

		const anonymous = await callApi("GET", "/users/me");
		const loggedIn = await callApi("GET", "/users/me", { user: me.auth });

		expect(anonymous.status).toBe(401);
		expect(loggedIn.status).toBe(200);
		expect(loggedIn.body).toMatchObject({
			id: me.user.id,
			email: me.user.email,
		});
	});

	test("없는 사용자는 404", async () => {
		const res = await callApi("GET", `/users/${NO_SUCH_ID}`);

		expect(res.status).toBe(404);
		expect(res.body).toEqual({ error: "User not found" });
	});

	test("탈퇴한 사용자는 로그인 여부와 관계없이 404이고, 판매 상품이 남아 있어도 수를 내보내지 않는다", async () => {
		const seller = await createUser("판매자");
		const viewer = await createUser("구경꾼");
		await createMarket(seller, "available");
		await callApi("DELETE", "/users/me", { user: seller.auth });

		const anonymous = await callApi("GET", `/users/${seller.user.id}`);
		const loggedIn = await callApi("GET", `/users/${seller.user.id}`, {
			user: viewer.auth,
		});

		expect(anonymous.status).toBe(404);
		expect(loggedIn.status).toBe(404);
		expect(anonymous.body).toEqual({ error: "User not found" });
	});
});
