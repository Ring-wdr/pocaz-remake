import {
	afterEach,
	beforeEach,
	describe,
	expect,
	mock,
	spyOn,
	test,
} from "bun:test";
import { prisma } from "@/lib/prisma";
import { activityService } from "@/lib/services/activity";
import { callApi, type TestUser } from "../helpers/api";
import { createUser, hasTestDb, resetDb } from "../helpers/db";

const TITLE = "르세라핌 김채원 포카";
const NO_SUCH_ID = "00000000-0000-0000-0000-000000000000";

/**
 * 판매자의 상품 하나와, 구매자가 그 상품으로 판매자와 대화 중인 채팅방을 만든다.
 */
async function setup(price: number | null = 15000) {
	const seller = await createUser("seller");
	const buyer = await createUser("buyer");
	const market = await prisma.market.create({
		data: { title: TITLE, price, userId: seller.user.id },
	});
	const room = await prisma.chatRoom.create({
		data: {
			marketId: market.id,
			members: {
				create: [{ userId: buyer.user.id }, { userId: seller.user.id }],
			},
		},
	});
	return { seller, buyer, market, room };
}

function complete(
	marketId: string,
	user: TestUser | undefined,
	body: { buyerId: string; price?: number },
) {
	return callApi("POST", `/markets/${marketId}/complete`, { user, body });
}

async function marketStatus(marketId: string) {
	const market = await prisma.market.findUniqueOrThrow({
		where: { id: marketId },
	});
	return market.status;
}

describe.skipIf(!hasTestDb)("POST /markets/:id/complete", () => {
	beforeEach(resetDb);
	afterEach(() => mock.restore());

	test("구매자를 지정하면 201로 거래를 남기고 상품을 판매완료로 바꾼다", async () => {
		const { seller, buyer, market } = await setup();

		const res = await complete(market.id, seller.auth, {
			buyerId: buyer.user.id,
		});

		expect(res.status).toBe(201);
		expect(res.body).toMatchObject({
			marketId: market.id,
			buyerId: buyer.user.id,
			sellerId: seller.user.id,
			price: 15000,
		});
		expect(Number.isNaN(Date.parse(res.body.completedAt as string))).toBe(
			false,
		);
		const row = await prisma.transaction.findUniqueOrThrow({
			where: { id: res.body.id as string },
		});
		expect(row).toMatchObject({
			type: "purchase",
			status: "completed",
			price: 15000,
		});
		expect(await marketStatus(market.id)).toBe("sold");
	});

	test("구매 내역과 거래 내역에 양쪽 모두 보인다", async () => {
		const { seller, buyer, market } = await setup();

		await complete(market.id, seller.auth, { buyerId: buyer.user.id });
		const buyerTrades = await callApi("GET", "/users/me/trades", {
			user: buyer.auth,
		});
		const sellerTrades = await callApi("GET", "/users/me/trades", {
			user: seller.auth,
		});
		const buyerPurchases = await callApi("GET", "/users/me/purchases", {
			user: buyer.auth,
		});
		const sellerPurchases = await callApi("GET", "/users/me/purchases", {
			user: seller.auth,
		});

		expect(buyerTrades.body.items).toMatchObject([
			{
				title: TITLE,
				price: 15000,
				type: "buy",
				partner: "seller",
				href: `/market/${market.id}`,
			},
		]);
		expect(sellerTrades.body.items).toMatchObject([
			{
				title: TITLE,
				price: 15000,
				type: "sell",
				partner: "buyer",
				href: `/market/${market.id}`,
			},
		]);
		expect(buyerPurchases.body.items).toMatchObject([
			{ title: TITLE, price: 15000, seller: "seller" },
		]);
		expect(sellerPurchases.body.items).toEqual([]);
	});

	test("마이페이지 거래 수에 반영된다", async () => {
		const { seller, buyer, market } = await setup();
		const before = await callApi("GET", "/users/me/summary", {
			user: seller.auth,
		});

		await complete(market.id, seller.auth, { buyerId: buyer.user.id });
		const sellerSummary = await callApi("GET", "/users/me/summary", {
			user: seller.auth,
		});
		const buyerSummary = await callApi("GET", "/users/me/summary", {
			user: buyer.auth,
		});

		expect(before.body.trades).toBe(0);
		expect(sellerSummary.body.trades).toBe(1);
		expect(buyerSummary.body.trades).toBe(1);
	});

	test("판매자와 구매자 모두에게 거래 활동 기록이 남는다", async () => {
		const { seller, buyer, market } = await setup();

		const res = await complete(market.id, seller.auth, {
			buyerId: buyer.user.id,
		});
		const sellerActivity = await callApi(
			"GET",
			"/users/me/activity?type=trade",
			{ user: seller.auth },
		);
		const buyerActivity = await callApi(
			"GET",
			"/users/me/activity?type=trade",
			{
				user: buyer.auth,
			},
		);

		expect(sellerActivity.body.items).toMatchObject([
			{
				type: "trade",
				text: `"${TITLE}" 판매 완료`,
				target: TITLE,
				targetHref: `/market/${market.id}`,
			},
		]);
		expect(buyerActivity.body.items).toMatchObject([
			{
				type: "trade",
				text: `"${TITLE}" 구매 완료`,
				target: TITLE,
				targetHref: `/market/${market.id}`,
			},
		]);
		expect(
			await prisma.activity.count({
				where: { targetType: "transaction", targetId: res.body.id as string },
			}),
		).toBe(2);
	});

	test("price를 보내면 그 값으로 남는다(0도 그대로)", async () => {
		const first = await setup();
		const second = await setup();

		const custom = await complete(first.market.id, first.seller.auth, {
			buyerId: first.buyer.user.id,
			price: 12000,
		});
		const free = await complete(second.market.id, second.seller.auth, {
			buyerId: second.buyer.user.id,
			price: 0,
		});

		expect(custom.body.price).toBe(12000);
		expect(free.body.price).toBe(0);
	});

	test("price가 없으면 상품 가격으로, 상품에도 가격이 없으면 0으로 남는다", async () => {
		const priced = await setup(8000);
		const unpriced = await setup(null);

		const fromMarket = await complete(priced.market.id, priced.seller.auth, {
			buyerId: priced.buyer.user.id,
		});
		const fallback = await complete(unpriced.market.id, unpriced.seller.auth, {
			buyerId: unpriced.buyer.user.id,
		});

		expect(fromMarket.body.price).toBe(8000);
		expect(fallback.body.price).toBe(0);
	});

	test("price는 0 이상의 정수만 받는다", async () => {
		const { seller, buyer, market } = await setup();

		const fraction = await complete(market.id, seller.auth, {
			buyerId: buyer.user.id,
			price: 10.5,
		});
		const negative = await complete(market.id, seller.auth, {
			buyerId: buyer.user.id,
			price: -1,
		});

		expect(fraction.status).toBe(422);
		expect(negative.status).toBe(422);
		expect(await prisma.transaction.count()).toBe(0);
	});

	test("판매자가 아니면 403이고 아무것도 바뀌지 않는다", async () => {
		const { buyer, market } = await setup();
		const stranger = await createUser("stranger");

		const byBuyer = await complete(market.id, buyer.auth, {
			buyerId: buyer.user.id,
		});
		const byStranger = await complete(market.id, stranger.auth, {
			buyerId: buyer.user.id,
		});

		expect(byBuyer.status).toBe(403);
		expect(byStranger.status).toBe(403);
		expect(await prisma.transaction.count()).toBe(0);
		expect(await prisma.activity.count()).toBe(0);
		expect(await marketStatus(market.id)).toBe("available");
	});

	test("없는 상품이면 404", async () => {
		const seller = await createUser("seller");
		const buyer = await createUser("buyer");

		const res = await complete(NO_SUCH_ID, seller.auth, {
			buyerId: buyer.user.id,
		});

		expect(res.status).toBe(404);
	});

	test("자기 자신을 구매자로 지정하면 400", async () => {
		const { seller, market } = await setup();

		const res = await complete(market.id, seller.auth, {
			buyerId: seller.user.id,
		});

		expect(res.status).toBe(400);
		expect(await prisma.transaction.count()).toBe(0);
		expect(await marketStatus(market.id)).toBe("available");
	});

	test("없는 사용자나 탈퇴한 사용자는 구매자가 될 수 없다", async () => {
		const { seller, buyer, market } = await setup();

		const unknown = await complete(market.id, seller.auth, {
			buyerId: NO_SUCH_ID,
		});
		await prisma.user.update({
			where: { id: buyer.user.id },
			data: { deletedAt: new Date() },
		});
		const withdrawn = await complete(market.id, seller.auth, {
			buyerId: buyer.user.id,
		});

		expect(unknown.status).toBe(400);
		expect(withdrawn.status).toBe(400);
		expect(await prisma.transaction.count()).toBe(0);
	});

	test("이 상품의 채팅방 멤버가 아닌 구매자는 400", async () => {
		const { seller, market } = await setup();
		const stranger = await createUser("stranger");

		const res = await complete(market.id, seller.auth, {
			buyerId: stranger.user.id,
		});

		expect(res.status).toBe(400);
		expect(await prisma.transaction.count()).toBe(0);
		expect(await marketStatus(market.id)).toBe("available");
	});

	test("다른 상품의 채팅방이나 상품 없는 일반 채팅방의 멤버도 구매자가 될 수 없다", async () => {
		const { seller, market } = await setup();
		const otherMarket = await prisma.market.create({
			data: { title: "다른 포카", userId: seller.user.id },
		});
		const askedAboutOther = await createUser("other-buyer");
		const justChatting = await createUser("chatter");
		await prisma.chatRoom.create({
			data: {
				marketId: otherMarket.id,
				members: {
					create: [
						{ userId: askedAboutOther.user.id },
						{ userId: seller.user.id },
					],
				},
			},
		});
		await prisma.chatRoom.create({
			data: {
				members: {
					create: [
						{ userId: justChatting.user.id },
						{ userId: seller.user.id },
					],
				},
			},
		});

		const other = await complete(market.id, seller.auth, {
			buyerId: askedAboutOther.user.id,
		});
		const general = await complete(market.id, seller.auth, {
			buyerId: justChatting.user.id,
		});

		expect(other.status).toBe(400);
		expect(general.status).toBe(400);
		expect(await prisma.transaction.count()).toBe(0);
	});

	test("이미 완료된 거래가 있으면 409와 기존 거래 id를 돌려준다", async () => {
		const { seller, buyer, market } = await setup();
		const second = await createUser("second-buyer");
		await prisma.chatRoom.create({
			data: {
				marketId: market.id,
				members: {
					create: [{ userId: second.user.id }, { userId: seller.user.id }],
				},
			},
		});
		const first = await complete(market.id, seller.auth, {
			buyerId: buyer.user.id,
		});

		const again = await complete(market.id, seller.auth, {
			buyerId: buyer.user.id,
		});
		const otherBuyer = await complete(market.id, seller.auth, {
			buyerId: second.user.id,
		});

		expect(first.status).toBe(201);
		expect(again.status).toBe(409);
		expect(again.body.transactionId).toBe(first.body.id as string);
		expect(otherBuyer.status).toBe(409);
		expect(otherBuyer.body.transactionId).toBe(first.body.id as string);
		expect(await prisma.transaction.count()).toBe(1);
		expect(await prisma.activity.count()).toBe(2);
	});

	test("이미 완료된 상품이라도 판매자가 아니면 403, 채팅방 멤버가 아니면 400이 먼저다", async () => {
		const { seller, buyer, market } = await setup();
		const stranger = await createUser("stranger");
		await complete(market.id, seller.auth, { buyerId: buyer.user.id });

		const notSeller = await complete(market.id, buyer.auth, {
			buyerId: buyer.user.id,
		});
		const notMember = await complete(market.id, seller.auth, {
			buyerId: stranger.user.id,
		});

		expect(notSeller.status).toBe(403);
		expect(notMember.status).toBe(400);
	});

	test("판매완료로만 바꿔 둔 상품도 구매자를 지정해 거래를 남길 수 있다", async () => {
		const { seller, buyer, market } = await setup();
		await prisma.market.update({
			where: { id: market.id },
			data: { status: "sold" },
		});

		const res = await complete(market.id, seller.auth, {
			buyerId: buyer.user.id,
		});

		expect(res.status).toBe(201);
		expect(await marketStatus(market.id)).toBe("sold");
	});

	test("같은 상품을 동시에 두 번 완료해도 거래는 한 번만 남는다", async () => {
		const { seller, buyer, market } = await setup();

		const results = await Promise.all([
			complete(market.id, seller.auth, { buyerId: buyer.user.id }),
			complete(market.id, seller.auth, { buyerId: buyer.user.id }),
		]);

		expect(results.map((res) => res.status).sort()).toEqual([201, 409]);
		expect(
			await prisma.transaction.count({ where: { marketId: market.id } }),
		).toBe(1);
		expect(await prisma.activity.count()).toBe(2);
	});

	test("활동 기록에서 실패하면 거래도 상품 상태도 앞선 활동 기록도 남지 않는다", async () => {
		spyOn(console, "error").mockImplementation(() => {});
		const { seller, buyer, market } = await setup();
		const create = activityService.create.bind(activityService);
		let calls = 0;
		spyOn(activityService, "create").mockImplementation(async (dto, db) => {
			calls += 1;
			if (calls === 2) throw new Error("activity write failed");
			return create(dto, db);
		});

		const res = await complete(market.id, seller.auth, {
			buyerId: buyer.user.id,
		});

		expect(res.status).toBe(500);
		expect(calls).toBe(2);
		expect(await prisma.transaction.count()).toBe(0);
		expect(await prisma.activity.count()).toBe(0);
		expect(await marketStatus(market.id)).toBe("available");
	});

	test("로그인하지 않으면 401", async () => {
		const { buyer, market } = await setup();

		const res = await complete(market.id, undefined, {
			buyerId: buyer.user.id,
		});

		expect(res.status).toBe(401);
		expect(await prisma.transaction.count()).toBe(0);
	});
});

describe.skipIf(!hasTestDb)("GET /chat/rooms/:id의 market.transaction", () => {
	beforeEach(resetDb);

	test("거래가 완료되기 전에는 null, 완료된 뒤에는 거래 정보를 돌려준다", async () => {
		const { seller, buyer, market, room } = await setup();

		const before = await callApi("GET", `/chat/rooms/${room.id}`, {
			user: buyer.auth,
		});
		const done = await complete(market.id, seller.auth, {
			buyerId: buyer.user.id,
		});
		const asBuyer = await callApi("GET", `/chat/rooms/${room.id}`, {
			user: buyer.auth,
		});
		const asSeller = await callApi("GET", `/chat/rooms/${room.id}`, {
			user: seller.auth,
		});

		expect(before.status).toBe(200);
		expect((before.body.market as { transaction: unknown }).transaction).toBe(
			null,
		);
		for (const res of [asBuyer, asSeller]) {
			expect(res.status).toBe(200);
			expect(res.body.market).toMatchObject({
				id: market.id,
				status: "sold",
				transaction: {
					id: done.body.id,
					buyerId: buyer.user.id,
					sellerId: seller.user.id,
					price: 15000,
					completedAt: done.body.completedAt,
				},
			});
		}
	});

	test("같은 상품의 다른 채팅방에서도 완료된 거래가 보인다", async () => {
		const { seller, buyer, market } = await setup();
		const watcher = await createUser("watcher");
		const watcherRoom = await prisma.chatRoom.create({
			data: {
				marketId: market.id,
				members: {
					create: [{ userId: watcher.user.id }, { userId: seller.user.id }],
				},
			},
		});
		const done = await complete(market.id, seller.auth, {
			buyerId: buyer.user.id,
		});

		const res = await callApi("GET", `/chat/rooms/${watcherRoom.id}`, {
			user: watcher.auth,
		});

		expect(res.status).toBe(200);
		expect(res.body.market).toMatchObject({
			transaction: { id: done.body.id, buyerId: buyer.user.id },
		});
	});
});
