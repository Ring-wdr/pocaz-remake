import { beforeEach, describe, expect, test } from "bun:test";
import { prisma } from "@/lib/prisma";
import { callApi } from "../helpers/api";
import { createUser, hasTestDb, resetDb } from "../helpers/db";

async function memberIds(roomId: string) {
	const members = await prisma.chatRoomMember.findMany({ where: { roomId } });
	return members.map((m) => m.userId).sort();
}

describe.skipIf(!hasTestDb)("채팅방 멤버 구성", () => {
	beforeEach(resetDb);

	test("거래 채팅방의 판매자는 클라이언트 값이 아니라 상품에서 정한다", async () => {
		const seller = await createUser("seller");
		const buyer = await createUser("buyer");
		const someoneElse = await createUser("someone");
		const market = await prisma.market.create({
			data: { title: "포카", userId: seller.user.id },
		});

		const res = await callApi("POST", "/chat/rooms/market", {
			user: buyer.auth,
			body: { marketId: market.id, sellerId: someoneElse.user.id },
		});

		expect(res.status).toBe(200);
		expect(await memberIds(res.body.id as string)).toEqual(
			[buyer.user.id, seller.user.id].sort(),
		);
	});

	test("없는 상품이면 404, 판매자 본인이면 400", async () => {
		const seller = await createUser("seller");
		const market = await prisma.market.create({
			data: { title: "포카", userId: seller.user.id },
		});

		const missing = await callApi("POST", "/chat/rooms/market", {
			user: seller.auth,
			body: { marketId: "00000000-0000-0000-0000-000000000000" },
		});
		const self = await callApi("POST", "/chat/rooms/market", {
			user: seller.auth,
			body: { marketId: market.id },
		});

		expect(missing.status).toBe(404);
		expect(self.status).toBe(400);
	});

	test("거래 채팅방에는 멤버를 추가할 수 없다", async () => {
		const seller = await createUser("seller");
		const buyer = await createUser("buyer");
		const stranger = await createUser("stranger");
		const market = await prisma.market.create({
			data: { title: "포카", userId: seller.user.id },
		});
		const room = await prisma.chatRoom.create({
			data: {
				marketId: market.id,
				members: {
					create: [{ userId: buyer.user.id }, { userId: seller.user.id }],
				},
			},
		});

		const res = await callApi("POST", `/chat/rooms/${room.id}/members`, {
			user: buyer.auth,
			body: { userId: stranger.user.id },
		});

		expect(res.status).toBe(403);
		expect(await memberIds(room.id)).not.toContain(stranger.user.id);
	});

	test("이름 없는 1:1 방에도 멤버를 추가할 수 없다", async () => {
		const a = await createUser("a");
		const b = await createUser("b");
		const c = await createUser("c");
		const room = await prisma.chatRoom.create({
			data: {
				members: { create: [{ userId: a.user.id }, { userId: b.user.id }] },
			},
		});

		const res = await callApi("POST", `/chat/rooms/${room.id}/members`, {
			user: a.auth,
			body: { userId: c.user.id },
		});

		expect(res.status).toBe(403);
	});

	test("존재하지 않는 사용자는 500이 아니라 4xx", async () => {
		const a = await createUser("a");
		const b = await createUser("b");
		const ghost = "00000000-0000-0000-0000-000000000000";

		const create = await callApi("POST", "/chat/rooms", {
			user: a.auth,
			body: { name: "모임", memberIds: [ghost] },
		});
		const direct = await callApi("POST", "/chat/rooms/direct", {
			user: a.auth,
			body: { targetUserId: ghost },
		});
		const group = await prisma.chatRoom.create({
			data: {
				name: "모임",
				members: { create: [{ userId: a.user.id }, { userId: b.user.id }] },
			},
		});
		const add = await callApi("POST", `/chat/rooms/${group.id}/members`, {
			user: a.auth,
			body: { userId: ghost },
		});

		expect(create.status).toBe(400);
		expect(direct.status).toBe(404);
		expect(add.status).toBe(404);
	});
});
