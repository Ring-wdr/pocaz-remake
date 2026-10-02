import { beforeEach, describe, expect, spyOn, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";
import { prisma } from "@/lib/prisma";
import { callApi } from "../helpers/api";
import { createUser, hasTestDb, resetDb } from "../helpers/db";

type TestUser = Awaited<ReturnType<typeof createUser>>;

interface RoomRow {
	id: string;
	unreadCount: number;
}

/** 두 사람의 1:1 방. members는 [나, 상대] 순서다 */
async function createRoom(
	members: TestUser[],
	data: { createdAt?: Date; marketId?: string } = {},
) {
	return prisma.chatRoom.create({
		data: {
			...data,
			members: { create: members.map(({ user }) => ({ userId: user.id })) },
		},
	});
}

/**
 * 방에 메시지를 남긴다. 읽음 시각과의 선후를 고정하려고 createdAt을 직접 줄 수 있다.
 */
function say(
	roomId: string,
	from: TestUser,
	content: string,
	createdAt?: Date,
) {
	return prisma.chatMessage.create({
		data: { roomId, userId: from.user.id, content, createdAt },
	});
}

/** 목록 응답을 { 방 id: 안 읽은 수 }로 줄인다 */
async function unreadByRoom(user: TestUser) {
	const res = await callApi("GET", "/chat/rooms", { user: user.auth });
	expect(res.status).toBe(200);
	return Object.fromEntries(
		(res.body.rooms as RoomRow[]).map((room) => [room.id, room.unreadCount]),
	);
}

async function totalUnread(user: TestUser) {
	const res = await callApi("GET", "/chat/unread-count", { user: user.auth });
	expect(res.status).toBe(200);
	return res.body.count;
}

async function readRoom(user: TestUser, roomId: string) {
	return callApi("POST", `/chat/rooms/${roomId}/read`, { user: user.auth });
}

function lastReadAtOf(roomId: string, user: TestUser) {
	return prisma.chatRoomMember
		.findUniqueOrThrow({
			where: { roomId_userId: { roomId, userId: user.user.id } },
		})
		.then((member) => member.lastReadAt);
}

/**
 * fn이 실행되는 동안 DB 드라이버에 나간 쿼리 수. sql을 주면 그 문자열이 들어간 쿼리만 센다.
 * Prisma 어댑터는 pg Client의 query를 거치므로 여기서 가로채면 모든 쿼리가 보인다.
 */
async function countDbQueries(fn: () => Promise<unknown>, sql?: string) {
	const spy = spyOn(pg.Client.prototype, "query");
	try {
		await fn();
		return spy.mock.calls.filter(([query]) => {
			const text =
				typeof query === "string" ? query : (query as { text?: string }).text;
			return sql === undefined || (text ?? "").includes(sql);
		}).length;
	} finally {
		spy.mockRestore();
	}
}

/** 안 읽음 집계 쿼리에만 들어 있는 문자열 */
const UNREAD_AGGREGATE_SQL = 'crm."lastReadAt" IS NULL';

describe.skipIf(!hasTestDb)("채팅 안 읽음 수", () => {
	let me: TestUser;
	let partner: TestUser;

	beforeEach(async () => {
		await resetDb();
		me = await createUser("나");
		partner = await createUser("상대");
	});

	test("상대가 보낸 메시지만 센다. 내가 보낸 메시지는 세지 않는다", async () => {
		const room = await createRoom([me, partner]);
		await say(room.id, partner, "안녕하세요");
		await say(room.id, me, "네 안녕하세요");
		await say(room.id, partner, "포카 아직 있나요?");
		await say(room.id, partner, "답장 기다릴게요");

		expect(await unreadByRoom(me)).toEqual({ [room.id]: 3 });
		// 상대 입장에서는 내가 보낸 한 건만 안 읽은 메시지다
		expect(await unreadByRoom(partner)).toEqual({ [room.id]: 1 });
		expect(await totalUnread(me)).toBe(3);
		expect(await totalUnread(partner)).toBe(1);
	});

	test("읽은 적이 없으면(lastReadAt이 null) 상대가 보낸 메시지 전체를 센다", async () => {
		const room = await createRoom([me, partner]);
		const longAgo = new Date("2020-01-01T00:00:00.000Z");
		await say(room.id, partner, "오래된 메시지", longAgo);
		await say(room.id, partner, "최근 메시지");

		expect(await lastReadAtOf(room.id, me)).toBeNull();
		expect(await unreadByRoom(me)).toEqual({ [room.id]: 2 });
	});

	test("메시지가 없는 방은 0이다", async () => {
		const room = await createRoom([me, partner]);

		expect(await unreadByRoom(me)).toEqual({ [room.id]: 0 });
		expect(await totalUnread(me)).toBe(0);
	});

	test("읽음 처리하면 0이 되고, 응답에 기록한 읽음 시각이 담긴다", async () => {
		const room = await createRoom([me, partner]);
		await say(room.id, partner, "첫 메시지");
		await say(room.id, partner, "둘째 메시지");
		expect(await totalUnread(me)).toBe(2);

		const before = Date.now();
		const res = await readRoom(me, room.id);
		const after = Date.now();

		expect(res.status).toBe(200);
		const readAt = new Date(res.body.lastReadAt as string);
		expect(readAt.getTime()).toBeGreaterThanOrEqual(before);
		expect(readAt.getTime()).toBeLessThanOrEqual(after);
		expect((await lastReadAtOf(room.id, me))?.toISOString()).toBe(
			res.body.lastReadAt as string,
		);
		expect(await unreadByRoom(me)).toEqual({ [room.id]: 0 });
		expect(await totalUnread(me)).toBe(0);
	});

	test("읽음 처리한 뒤에 온 메시지부터 센다", async () => {
		const room = await createRoom([me, partner]);
		await say(room.id, partner, "읽을 메시지");
		const read = await readRoom(me, room.id);

		// 읽은 시각을 기준으로 메시지 시각을 정해 선후가 시계에 흔들리지 않게 한다
		const readAt = new Date(read.body.lastReadAt as string).getTime();
		await say(
			room.id,
			partner,
			"읽은 뒤에 온 메시지",
			new Date(readAt + 1_000),
		);
		await say(room.id, partner, "또 온 메시지", new Date(readAt + 2_000));
		await say(room.id, me, "내가 보낸 메시지", new Date(readAt + 3_000));

		expect(await unreadByRoom(me)).toEqual({ [room.id]: 2 });
		expect(await totalUnread(me)).toBe(2);
	});

	test("읽음 시각과 같은 시각의 메시지는 읽은 것으로 보고, 그 뒤 메시지부터 센다", async () => {
		const room = await createRoom([me, partner]);
		const readAt = new Date("2026-10-02T09:00:00.000Z");
		await prisma.chatRoomMember.update({
			where: { roomId_userId: { roomId: room.id, userId: me.user.id } },
			data: { lastReadAt: readAt },
		});
		await say(room.id, partner, "읽기 전", new Date(readAt.getTime() - 1));
		await say(room.id, partner, "읽은 순간", readAt);
		expect(await totalUnread(me)).toBe(0);

		await say(room.id, partner, "읽은 직후", new Date(readAt.getTime() + 1));
		expect(await totalUnread(me)).toBe(1);
	});

	test("읽음 처리는 처리한 사람의 읽음 시각만 바꾼다", async () => {
		const room = await createRoom([me, partner]);
		await say(room.id, partner, "상대가 보냄");
		await say(room.id, me, "내가 보냄");

		await readRoom(me, room.id);

		expect(await lastReadAtOf(room.id, me)).not.toBeNull();
		expect(await lastReadAtOf(room.id, partner)).toBeNull();
		expect(await totalUnread(me)).toBe(0);
		expect(await totalUnread(partner)).toBe(1);
	});

	test("여러 번 읽음 처리해도 멤버는 그대로이고 읽음 시각은 거꾸로 가지 않는다", async () => {
		const room = await createRoom([me, partner]);
		await say(room.id, partner, "안녕");

		const first = await readRoom(me, room.id);
		const second = await readRoom(me, room.id);

		expect(first.status).toBe(200);
		expect(second.status).toBe(200);
		expect(
			new Date(second.body.lastReadAt as string).getTime(),
		).toBeGreaterThanOrEqual(
			new Date(first.body.lastReadAt as string).getTime(),
		);
		expect(
			await prisma.chatRoomMember.count({ where: { roomId: room.id } }),
		).toBe(2);
	});
});

describe.skipIf(!hasTestDb)("POST /chat/rooms/:id/read 권한", () => {
	beforeEach(resetDb);

	test("멤버가 아니면 403이고 누구의 읽음 시각도 바뀌지 않는다", async () => {
		const me = await createUser("나");
		const partner = await createUser("상대");
		const stranger = await createUser("낯선 사람");
		const room = await createRoom([me, partner]);
		await say(room.id, partner, "비밀 이야기");

		const res = await readRoom(stranger, room.id);

		expect(res.status).toBe(403);
		expect(res.body).toEqual({ error: "Not a member of this chat room" });
		expect(await lastReadAtOf(room.id, me)).toBeNull();
		expect(await lastReadAtOf(room.id, partner)).toBeNull();
		expect(
			await prisma.chatRoomMember.count({ where: { roomId: room.id } }),
		).toBe(2);
	});

	test("없는 방도 멤버가 아니므로 403이다", async () => {
		const me = await createUser("나");

		const res = await readRoom(me, "00000000-0000-0000-0000-000000000000");

		expect(res.status).toBe(403);
	});

	test("방을 나간 사용자는 읽음 처리할 수 없다", async () => {
		const me = await createUser("나");
		const partner = await createUser("상대");
		const room = await createRoom([me, partner]);
		const left = await callApi("DELETE", `/chat/rooms/${room.id}/leave`, {
			user: me.auth,
		});
		expect(left.status).toBe(200);

		const res = await readRoom(me, room.id);

		expect(res.status).toBe(403);
	});

	test("로그인하지 않으면 401이다", async () => {
		const me = await createUser("나");
		const partner = await createUser("상대");
		const room = await createRoom([me, partner]);

		const read = await callApi("POST", `/chat/rooms/${room.id}/read`);
		const count = await callApi("GET", "/chat/unread-count");

		expect(read.status).toBe(401);
		expect(count.status).toBe(401);
		expect(await lastReadAtOf(room.id, me)).toBeNull();
	});

	test("가입 정보(Prisma 사용자)가 아직 없는 로그인 사용자의 안 읽음 수는 0이다", async () => {
		const res = await callApi("GET", "/chat/unread-count", {
			user: { id: randomUUID(), email: "new@example.com" },
		});

		expect(res.status).toBe(200);
		expect(res.body).toEqual({ count: 0 });
	});
});

describe.skipIf(!hasTestDb)("GET /chat/unread-count", () => {
	let me: TestUser;
	let partner: TestUser;
	let other: TestUser;

	beforeEach(async () => {
		await resetDb();
		me = await createUser("나");
		partner = await createUser("상대");
		other = await createUser("다른 상대");
	});

	test("참여한 모든 방의 안 읽은 메시지를 더하고, 참여하지 않은 방은 세지 않는다", async () => {
		const roomA = await createRoom([me, partner]);
		const roomB = await createRoom([me, other]);
		const strangers = await createRoom([partner, other]);
		await say(roomA.id, partner, "A-1");
		await say(roomA.id, partner, "A-2");
		await say(roomB.id, other, "B-1");
		await say(roomB.id, other, "B-2");
		await say(roomB.id, other, "B-3");
		await say(roomB.id, me, "내가 보낸 B");
		for (const text of ["남의 방 1", "남의 방 2", "남의 방 3"]) {
			await say(strangers.id, partner, text);
		}

		expect(await totalUnread(me)).toBe(5);
		expect(await unreadByRoom(me)).toEqual({ [roomA.id]: 2, [roomB.id]: 3 });

		await readRoom(me, roomA.id);

		expect(await totalUnread(me)).toBe(3);
	});

	test("방을 나가면 그 방의 메시지는 합계에서 빠진다", async () => {
		const roomA = await createRoom([me, partner]);
		const roomB = await createRoom([me, other]);
		await say(roomA.id, partner, "A");
		await say(roomB.id, other, "B-1");
		await say(roomB.id, other, "B-2");
		expect(await totalUnread(me)).toBe(3);

		await callApi("DELETE", `/chat/rooms/${roomB.id}/leave`, { user: me.auth });

		expect(await totalUnread(me)).toBe(1);
	});

	test("그룹 채팅방에서는 나를 뺀 모든 멤버의 메시지를 센다", async () => {
		const room = await createRoom([me, partner, other]);
		await say(room.id, partner, "상대");
		await say(room.id, other, "다른 상대");
		await say(room.id, me, "나");

		expect(await totalUnread(me)).toBe(2);
		expect(await totalUnread(partner)).toBe(2);
	});
});

describe.skipIf(!hasTestDb)("채팅방 목록의 unreadCount", () => {
	let me: TestUser;
	let partner: TestUser;

	beforeEach(async () => {
		await resetDb();
		me = await createUser("나");
		partner = await createUser("상대");
	});

	test("방마다 따로 센다. 페이지를 넘겨도 각 방의 값이 맞다", async () => {
		const oldest = await createRoom([me, partner], {
			createdAt: new Date("2026-10-01T00:00:00.000Z"),
		});
		const middle = await createRoom([me, partner], {
			createdAt: new Date("2026-10-01T01:00:00.000Z"),
		});
		const newest = await createRoom([me, partner], {
			createdAt: new Date("2026-10-01T02:00:00.000Z"),
		});
		for (const [room, count] of [
			[oldest, 1],
			[middle, 2],
			[newest, 3],
		] as const) {
			for (let i = 0; i < count; i++) {
				await say(room.id, partner, `${i}`);
			}
		}

		const first = await callApi("GET", "/chat/rooms?limit=2", {
			user: me.auth,
		});
		expect(
			(first.body.rooms as RoomRow[]).map(({ id, unreadCount }) => [
				id,
				unreadCount,
			]),
		).toEqual([
			[newest.id, 3],
			[middle.id, 2],
		]);
		expect(first.body.hasMore).toBe(true);

		const second = await callApi(
			"GET",
			`/chat/rooms?limit=2&cursor=${first.body.nextCursor}`,
			{ user: me.auth },
		);
		expect(
			(second.body.rooms as RoomRow[]).map(({ id, unreadCount }) => [
				id,
				unreadCount,
			]),
		).toEqual([[oldest.id, 1]]);
	});

	test("검색·필터를 걸어도 보이는 방의 값이 맞다", async () => {
		const seller = await createUser("판매자");
		const market = await prisma.market.create({
			data: { title: "포카", userId: seller.user.id },
		});
		const trade = await createRoom([me, seller], { marketId: market.id });
		const general = await createRoom([me, partner]);
		await say(trade.id, seller, "거래 문의 답변");
		await say(general.id, partner, "안부 인사");
		await say(general.id, partner, "또 안부 인사");

		const trading = await callApi("GET", "/chat/rooms?filter=trading", {
			user: me.auth,
		});
		const generalOnly = await callApi("GET", "/chat/rooms?filter=general", {
			user: me.auth,
		});

		expect(trading.body.rooms as RoomRow[]).toMatchObject([
			{ id: trade.id, unreadCount: 1 },
		]);
		expect(generalOnly.body.rooms as RoomRow[]).toMatchObject([
			{ id: general.id, unreadCount: 2 },
		]);
	});

	test("방 수와 상관없이 쿼리 수가 늘지 않고, 안 읽음 집계는 한 번만 한다", async () => {
		const list = () => callApi("GET", "/chat/rooms", { user: me.auth });
		const oneRoom = await createRoom([me, partner]);
		await say(oneRoom.id, partner, "하나");
		const queriesForOne = await countDbQueries(list);

		for (let i = 0; i < 4; i++) {
			const room = await createRoom([me, partner]);
			await say(room.id, partner, `방 ${i}`);
		}
		const queriesForFive = await countDbQueries(list);
		const aggregatesForFive = await countDbQueries(list, UNREAD_AGGREGATE_SQL);

		expect(queriesForOne).toBeGreaterThan(0);
		expect(queriesForFive).toBe(queriesForOne);
		expect(aggregatesForFive).toBe(1);
	});

	test("방이 없으면 안 읽음 집계 쿼리를 보내지 않는다", async () => {
		const aggregates = await countDbQueries(
			() => callApi("GET", "/chat/rooms", { user: me.auth }),
			UNREAD_AGGREGATE_SQL,
		);

		expect(aggregates).toBe(0);
	});
});

describe.skipIf(!hasTestDb)(
	"GET /chat/rooms/market/:marketId의 unreadCount",
	() => {
		beforeEach(resetDb);

		test("판매자는 거래 채팅방마다 따로 센 값을 보고, 구매자는 자기 방의 값만 본다", async () => {
			const seller = await createUser("판매자");
			const buyer1 = await createUser("구매자1");
			const buyer2 = await createUser("구매자2");
			const market = await prisma.market.create({
				data: { title: "포카", userId: seller.user.id },
			});
			const room1 = await createRoom([buyer1, seller], { marketId: market.id });
			const room2 = await createRoom([buyer2, seller], { marketId: market.id });
			await say(room1.id, buyer1, "구매자1의 첫 메시지");
			await say(room2.id, buyer2, "구매자2의 첫 메시지");
			await say(room2.id, buyer2, "구매자2의 둘째 메시지");
			await say(room2.id, seller, "판매자 답장");

			const asSeller = await callApi("GET", `/chat/rooms/market/${market.id}`, {
				user: seller.auth,
			});
			const asBuyer = await callApi("GET", `/chat/rooms/market/${market.id}`, {
				user: buyer2.auth,
			});

			const sellerCounts = Object.fromEntries(
				(asSeller.body.rooms as RoomRow[]).map((r) => [r.id, r.unreadCount]),
			);
			expect(sellerCounts).toEqual({ [room1.id]: 1, [room2.id]: 2 });
			expect(asBuyer.body.rooms as RoomRow[]).toMatchObject([
				{ id: room2.id, unreadCount: 1 },
			]);

			await readRoom(seller, room2.id);
			const afterRead = await callApi(
				"GET",
				`/chat/rooms/market/${market.id}`,
				{
					user: seller.auth,
				},
			);
			expect(
				Object.fromEntries(
					(afterRead.body.rooms as RoomRow[]).map((r) => [r.id, r.unreadCount]),
				),
			).toEqual({ [room1.id]: 1, [room2.id]: 0 });
		});

		test("방이 여럿이어도 안 읽음 집계는 쿼리 한 번이고, 방이 없으면 보내지 않는다", async () => {
			const seller = await createUser("판매자");
			const stranger = await createUser("낯선 사람");
			const market = await prisma.market.create({
				data: { title: "포카", userId: seller.user.id },
			});
			for (let i = 0; i < 3; i++) {
				const buyer = await createUser(`구매자${i}`);
				const room = await createRoom([buyer, seller], { marketId: market.id });
				await say(room.id, buyer, "문의드려요");
			}
			const get = (user: TestUser) => () =>
				callApi("GET", `/chat/rooms/market/${market.id}`, { user: user.auth });

			const sellerAggregates = await countDbQueries(
				get(seller),
				UNREAD_AGGREGATE_SQL,
			);
			const strangerAggregates = await countDbQueries(
				get(stranger),
				UNREAD_AGGREGATE_SQL,
			);
			const res = await get(stranger)();

			expect(sellerAggregates).toBe(1);
			expect(strangerAggregates).toBe(0);
			expect(res.status).toBe(200);
			expect(res.body.rooms).toEqual([]);
		});
	},
);

describe.skipIf(!hasTestDb)("GET /chat/rooms/:id의 lastReadAt", () => {
	beforeEach(resetDb);

	test("읽은 적이 없으면 null이고, 읽음 처리하면 내 읽음 시각이 담긴다", async () => {
		const me = await createUser("나");
		const partner = await createUser("상대");
		const room = await createRoom([me, partner]);

		const before = await callApi("GET", `/chat/rooms/${room.id}`, {
			user: me.auth,
		});
		const read = await readRoom(me, room.id);
		const after = await callApi("GET", `/chat/rooms/${room.id}`, {
			user: me.auth,
		});

		expect(before.status).toBe(200);
		expect(before.body.lastReadAt).toBeNull();
		expect(after.body.lastReadAt).toBe(read.body.lastReadAt as string);
	});

	test("상세를 조회하는 것만으로는 읽음 처리되지 않는다", async () => {
		const me = await createUser("나");
		const partner = await createUser("상대");
		const room = await createRoom([me, partner]);
		await say(room.id, partner, "안녕");

		await callApi("GET", `/chat/rooms/${room.id}`, { user: me.auth });
		await callApi("GET", `/chat/rooms/${room.id}/messages`, { user: me.auth });

		expect(await lastReadAtOf(room.id, me)).toBeNull();
		expect(await totalUnread(me)).toBe(1);
	});

	test("내 값만 내려가고 다른 멤버의 읽음 시각은 응답에 없다", async () => {
		const me = await createUser("나");
		const partner = await createUser("상대");
		const room = await createRoom([me, partner]);
		const partnerRead = await readRoom(partner, room.id);

		const res = await callApi("GET", `/chat/rooms/${room.id}`, {
			user: me.auth,
		});

		expect(res.body.lastReadAt).toBeNull();
		expect(JSON.stringify(res.body)).not.toContain(
			partnerRead.body.lastReadAt as string,
		);
	});
});

const MIGRATIONS_DIR = join(import.meta.dir, "../../prisma/migrations");

/**
 * add_chat_last_read_at 마이그레이션에서 backfill:start ~ backfill:end 사이의 SQL을
 * 세미콜론 기준 문장으로 나눠 순서대로 꺼낸다 (주석 줄은 뺀다).
 */
function readBackfillStatements() {
	const folder = readdirSync(MIGRATIONS_DIR).find((name) =>
		name.endsWith("_add_chat_last_read_at"),
	);
	if (!folder)
		throw new Error("add_chat_last_read_at 마이그레이션이 없습니다.");
	const sql = readFileSync(
		join(MIGRATIONS_DIR, folder, "migration.sql"),
		"utf8",
	);

	const start = sql.indexOf("-- backfill:start");
	const end = sql.indexOf("-- backfill:end");
	if (start === -1 || end === -1 || end < start) {
		throw new Error("마이그레이션에 backfill 표시가 없습니다.");
	}

	return sql
		.slice(start + "-- backfill:start".length, end)
		.split("\n")
		.filter((line) => !line.trim().startsWith("--"))
		.join("\n")
		.split(";")
		.map((statement) => statement.trim())
		.filter((statement) => statement.length > 0);
}

describe.skipIf(!hasTestDb)("add_chat_last_read_at 백필", () => {
	beforeEach(resetDb);

	test("마이그레이션에 실행할 문장이 있다", () => {
		expect(readBackfillStatements().length).toBeGreaterThan(0);
	});

	test("기존 대화는 읽은 것으로 채우고, 이후 메시지부터 안 읽음으로 센다", async () => {
		const me = await createUser("나");
		const partner = await createUser("상대");
		const withMessages = await createRoom([me, partner]);
		const empty = await createRoom([me, partner]);
		await say(
			withMessages.id,
			partner,
			"옛 메시지 1",
			new Date("2026-09-01T00:00:00.000Z"),
		);
		await say(
			withMessages.id,
			partner,
			"옛 메시지 2",
			new Date("2026-09-02T00:00:00.000Z"),
		);
		await say(
			withMessages.id,
			me,
			"내 옛 메시지",
			new Date("2026-09-03T00:00:00.000Z"),
		);
		// 백필 전에는 방의 상대 메시지 전체가 안 읽음이다
		expect(await totalUnread(me)).toBe(2);

		for (const statement of readBackfillStatements()) {
			await prisma.$executeRawUnsafe(statement);
		}

		// 메시지가 있는 방은 마지막 메시지 시각으로, 메시지가 없는 방은 입장 시각으로 채운다
		for (const user of [me, partner]) {
			expect((await lastReadAtOf(withMessages.id, user))?.toISOString()).toBe(
				"2026-09-03T00:00:00.000Z",
			);
		}
		const joinedAt = await prisma.chatRoomMember.findUniqueOrThrow({
			where: { roomId_userId: { roomId: empty.id, userId: me.user.id } },
		});
		expect(joinedAt.lastReadAt?.getTime()).toBe(joinedAt.joinedAt.getTime());
		expect(await totalUnread(me)).toBe(0);
		expect(await totalUnread(partner)).toBe(0);

		await say(
			withMessages.id,
			partner,
			"배포 뒤 첫 메시지",
			new Date("2026-09-04T00:00:00.000Z"),
		);
		expect(await totalUnread(me)).toBe(1);
	});

	test("이미 읽음 시각이 있는 행은 건드리지 않는다", async () => {
		const me = await createUser("나");
		const partner = await createUser("상대");
		const room = await createRoom([me, partner]);
		await say(room.id, partner, "메시지", new Date("2026-09-03T00:00:00.000Z"));
		const readAt = new Date("2026-09-02T00:00:00.000Z");
		await prisma.chatRoomMember.update({
			where: { roomId_userId: { roomId: room.id, userId: me.user.id } },
			data: { lastReadAt: readAt },
		});

		for (const statement of readBackfillStatements()) {
			await prisma.$executeRawUnsafe(statement);
		}

		expect((await lastReadAtOf(room.id, me))?.toISOString()).toBe(
			readAt.toISOString(),
		);
	});
});
