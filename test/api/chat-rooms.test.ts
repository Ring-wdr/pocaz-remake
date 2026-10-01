import { beforeEach, describe, expect, test } from "bun:test";
import { prisma } from "@/lib/prisma";
import { callApi } from "../helpers/api";
import { createUser, hasTestDb, resetDb } from "../helpers/db";

async function marketRoom(marketId: string, memberIds: string[], text: string) {
	return prisma.chatRoom.create({
		data: {
			marketId,
			members: { create: memberIds.map((userId) => ({ userId })) },
			messages: { create: { content: text, userId: memberIds[0] } },
		},
	});
}

describe.skipIf(!hasTestDb)("GET /chat/rooms/market/:marketId", () => {
	beforeEach(resetDb);

	async function setup() {
		const seller = await createUser("seller");
		const buyer1 = await createUser("buyer1");
		const buyer2 = await createUser("buyer2");
		const stranger = await createUser("stranger");
		const market = await prisma.market.create({
			data: { title: "포카", userId: seller.user.id },
		});
		const room1 = await marketRoom(
			market.id,
			[buyer1.user.id, seller.user.id],
			"계좌 알려주세요",
		);
		const room2 = await marketRoom(
			market.id,
			[buyer2.user.id, seller.user.id],
			"주소는 서울시 ...",
		);
		return { seller, buyer1, stranger, market, room1, room2 };
	}

	test("판매자는 자기 상품의 거래 채팅방을 모두 본다", async () => {
		const { seller, market, room1, room2 } = await setup();

		const res = await callApi("GET", `/chat/rooms/market/${market.id}`, {
			user: seller.auth,
		});

		expect(res.status).toBe(200);
		const ids = (res.body.rooms as { id: string }[]).map((r) => r.id).sort();
		expect(ids).toEqual([room1.id, room2.id].sort());
	});

	test("구매자는 자기가 참여한 방만 본다", async () => {
		const { buyer1, market, room1 } = await setup();

		const res = await callApi("GET", `/chat/rooms/market/${market.id}`, {
			user: buyer1.auth,
		});

		expect((res.body.rooms as { id: string }[]).map((r) => r.id)).toEqual([
			room1.id,
		]);
	});

	test("관계없는 사용자는 다른 사람의 대화를 볼 수 없다", async () => {
		const { stranger, market } = await setup();

		const res = await callApi("GET", `/chat/rooms/market/${market.id}`, {
			user: stranger.auth,
		});

		expect(res.status).toBe(200);
		expect(res.body.rooms).toEqual([]);
	});
});
