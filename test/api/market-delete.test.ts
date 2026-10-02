import { beforeEach, describe, expect, test } from "bun:test";
import { prisma } from "@/lib/prisma";
import { callApi } from "../helpers/api";
import { createUser, hasTestDb, resetDb } from "../helpers/db";

const HAS_TRANSACTIONS = { error: "Market has transactions" };

/**
 * 판매자의 상품 하나와, 구매자가 그 상품으로 판매자와 대화 중인 채팅방을 만든다.
 */
async function setup() {
	const seller = await createUser("seller");
	const buyer = await createUser("buyer");
	const market = await prisma.market.create({
		data: {
			title: "르세라핌 김채원 포카",
			price: 15000,
			userId: seller.user.id,
		},
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

describe.skipIf(!hasTestDb)("DELETE /markets/:id", () => {
	beforeEach(resetDb);

	test("거래가 완료된 상품은 409이고 상품과 거래 기록은 그대로 남는다", async () => {
		const { seller, buyer, market } = await setup();
		const completed = await callApi("POST", `/markets/${market.id}/complete`, {
			user: seller.auth,
			body: { buyerId: buyer.user.id },
		});
		expect(completed.status).toBe(201);

		const res = await callApi("DELETE", `/markets/${market.id}`, {
			user: seller.auth,
		});

		expect(res.status).toBe(409);
		expect(res.body).toEqual(HAS_TRANSACTIONS);
		const row = await prisma.market.findUniqueOrThrow({
			where: { id: market.id },
		});
		expect(row.status).toBe("sold");
		expect(
			await prisma.transaction.count({ where: { marketId: market.id } }),
		).toBe(1);
		// 상품이 남아 있으니 채팅방도 그대로다
		expect(
			await prisma.chatRoom.count({ where: { marketId: market.id } }),
		).toBe(1);
	});

	test("완료되지 않은 거래 기록이 있어도 막는다(상품을 참조하는 기록이 있으면 DB가 지우지 못한다)", async () => {
		const { seller, buyer, market } = await setup();
		await prisma.transaction.create({
			data: {
				type: "purchase",
				status: "cancelled",
				price: 15000,
				buyerId: buyer.user.id,
				sellerId: seller.user.id,
				marketId: market.id,
			},
		});

		const res = await callApi("DELETE", `/markets/${market.id}`, {
			user: seller.auth,
		});

		expect(res.status).toBe(409);
		expect(res.body).toEqual(HAS_TRANSACTIONS);
		expect(await prisma.market.count({ where: { id: market.id } })).toBe(1);
	});

	test("거래 기록이 없으면 200으로 지우고 이미지·찜·채팅방도 함께 지운다", async () => {
		const { seller, buyer, market, room } = await setup();
		await prisma.marketImage.create({
			data: { marketId: market.id, imageUrl: "https://example.com/a.png" },
		});
		await prisma.marketLike.create({
			data: { marketId: market.id, userId: buyer.user.id },
		});

		const res = await callApi("DELETE", `/markets/${market.id}`, {
			user: seller.auth,
		});

		expect(res.status).toBe(200);
		expect(res.body).toEqual({ message: "Market deleted successfully" });
		expect(await prisma.market.count({ where: { id: market.id } })).toBe(0);
		expect(
			await prisma.marketImage.count({ where: { marketId: market.id } }),
		).toBe(0);
		expect(
			await prisma.marketLike.count({ where: { marketId: market.id } }),
		).toBe(0);
		expect(await prisma.chatRoom.count({ where: { id: room.id } })).toBe(0);
	});

	test("주인이 아니면 거래 기록이 있어도 403이다(거래 여부를 알려 주지 않는다)", async () => {
		const { seller, buyer, market } = await setup();
		await callApi("POST", `/markets/${market.id}/complete`, {
			user: seller.auth,
			body: { buyerId: buyer.user.id },
		});

		const res = await callApi("DELETE", `/markets/${market.id}`, {
			user: buyer.auth,
		});

		expect(res.status).toBe(403);
		expect(res.body).toEqual({ error: "Forbidden" });
		expect(await prisma.market.count({ where: { id: market.id } })).toBe(1);
	});

	test("로그인하지 않으면 401이고 상품은 그대로다", async () => {
		const { market } = await setup();

		const res = await callApi("DELETE", `/markets/${market.id}`);

		expect(res.status).toBe(401);
		expect(await prisma.market.count({ where: { id: market.id } })).toBe(1);
	});
});
