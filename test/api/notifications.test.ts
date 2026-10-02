import {
	afterEach,
	beforeEach,
	describe,
	expect,
	mock,
	spyOn,
	test,
} from "bun:test";
import { randomUUID } from "node:crypto";
import pg from "pg";
import { prisma } from "@/lib/prisma";
import { callApi, type TestUser } from "../helpers/api";
import { createUser, hasTestDb, resetDb } from "../helpers/db";

const TITLE = "르세라핌 김채원 포카";
const NO_SUCH_ID = "00000000-0000-0000-0000-000000000000";

type TestAccount = Awaited<ReturnType<typeof createUser>>;

// ==============================================
// 도우미
// ==============================================

/** 사용자가 받은 알림을 만든 순서대로 읽는다 */
function notificationsOf(account: TestAccount) {
	return prisma.notification.findMany({
		where: { userId: account.user.id },
		orderBy: [{ createdAt: "asc" }, { id: "asc" }],
	});
}

function countOf(account: TestAccount) {
	return prisma.notification.count({ where: { userId: account.user.id } });
}

/** 알림 설정을 DB에 바로 쓴다 */
function setSettings(
	account: TestAccount,
	notificationSettings: Record<string, unknown>,
) {
	return prisma.user.update({
		where: { id: account.user.id },
		data: { notificationSettings: notificationSettings as never },
	});
}

function createPost(author: TestAccount, content = "새 글입니다") {
	return prisma.post.create({ data: { content, userId: author.user.id } });
}

function comment(
	postId: string,
	user: TestAccount,
	content: string,
	parentId?: string,
) {
	return callApi("POST", `/posts/${postId}/comments`, {
		user: user.auth,
		body: { content, parentId },
	});
}

function like(postId: string, user: TestAccount) {
	return callApi("POST", `/likes/posts/${postId}`, { user: user.auth });
}

function createMarket(seller: TestAccount, status = "available") {
	return prisma.market.create({
		data: { title: TITLE, price: 15000, status, userId: seller.user.id },
	});
}

function wish(account: TestAccount, marketId: string) {
	return prisma.marketLike.create({
		data: { userId: account.user.id, marketId },
	});
}

function changeStatus(
	marketId: string,
	seller: TestAccount,
	body: { status?: string; title?: string },
) {
	return callApi("PUT", `/markets/${marketId}`, { user: seller.auth, body });
}

/** 구매자가 판매자와 그 상품으로 대화 중인 채팅방을 만든다 */
async function createTradeRoom(seller: TestAccount, buyer: TestAccount) {
	const market = await createMarket(seller);
	await prisma.chatRoom.create({
		data: {
			marketId: market.id,
			members: {
				create: [{ userId: buyer.user.id }, { userId: seller.user.id }],
			},
		},
	});
	return market;
}

function complete(marketId: string, seller: TestAccount, buyer: TestAccount) {
	return callApi("POST", `/markets/${marketId}/complete`, {
		user: seller.auth,
		body: { buyerId: buyer.user.id },
	});
}

/** 완료된 거래를 DB에 바로 만든다 */
async function createTrade(seller: TestAccount, buyer: TestAccount) {
	const market = await createMarket(seller, "sold");
	return prisma.transaction.create({
		data: {
			type: "purchase",
			status: "completed",
			price: 15000,
			buyerId: buyer.user.id,
			sellerId: seller.user.id,
			marketId: market.id,
		},
	});
}

function review(
	transactionId: string,
	user: TestAccount,
	body: { rating: number; content?: string },
) {
	return callApi("POST", `/transactions/${transactionId}/reviews`, {
		user: user.auth,
		body,
	});
}

function createRoom(members: TestAccount[]) {
	return prisma.chatRoom.create({
		data: {
			members: { create: members.map(({ user }) => ({ userId: user.id })) },
		},
	});
}

function say(roomId: string, user: TestAccount, content: string) {
	return callApi("POST", `/chat/rooms/${roomId}/messages`, {
		user: user.auth,
		body: { content },
	});
}

/**
 * 알림 n건을 직접 만든다. 제목은 "알림 1"~"알림 n"이고, 숫자가 클수록 1초씩 더 최근이다.
 */
async function seedNotifications(account: TestAccount, count: number) {
	const base = new Date("2026-01-01T00:00:00.000Z").getTime();
	await prisma.notification.createMany({
		data: Array.from({ length: count }, (_, index) => ({
			userId: account.user.id,
			type: "comment",
			title: `알림 ${index + 1}`,
			createdAt: new Date(base + index * 1000),
		})),
	});
	return notificationsOf(account);
}

interface NotificationRow {
	id: string;
	title: string;
}

function listNotifications(account: TestAccount, query = "") {
	return callApi("GET", `/notifications${query}`, { user: account.auth });
}

/**
 * Notification 테이블에 쓰는 문장 하나(기본은 INSERT)만 실패하게 만든다. Prisma 어댑터는 pg Client의 query를 거친다.
 */
function failNotificationWrites(
	statement: "INSERT INTO" | "UPDATE" = "INSERT INTO",
) {
	const original = pg.Client.prototype.query as (...args: unknown[]) => unknown;
	return spyOn(pg.Client.prototype, "query").mockImplementation(function (
		this: pg.Client,
		...args: unknown[]
	) {
		const first = args[0];
		const text =
			typeof first === "string" ? first : (first as { text?: string }).text;
		if (!text?.includes(`${statement} "public"."Notification"`)) {
			return original.apply(this, args);
		}

		const error = new Error("db down");
		const callback = args[args.length - 1];
		if (typeof callback === "function") {
			// pool.query는 결과를 콜백으로 받는다
			setImmediate(() => callback(error));
			return undefined;
		}
		return Promise.reject(error);
	} as unknown as typeof pg.Client.prototype.query);
}

// ==============================================
// 생성 지점
// ==============================================

describe.skipIf(!hasTestDb)("댓글·답글 알림", () => {
	beforeEach(resetDb);

	test("댓글을 달면 글쓴이에게 comment 알림이 생긴다", async () => {
		const author = await createUser("글쓴이");
		const commenter = await createUser("댓글러");
		const post = await createPost(author);

		const res = await comment(post.id, commenter, "사진이 너무 예뻐요");

		expect(res.status).toBe(201);
		expect(await notificationsOf(author)).toMatchObject([
			{
				type: "comment",
				title: "댓글러님이 댓글을 남겼어요",
				body: "사진이 너무 예뻐요",
				href: `/community/posts/${post.id}`,
				actorId: commenter.user.id,
				readAt: null,
			},
		]);
		expect(await countOf(commenter)).toBe(0);
	});

	test("본문에는 댓글 앞 50자만 담는다(이모지를 반으로 자르지 않는다)", async () => {
		const author = await createUser("글쓴이");
		const commenter = await createUser("댓글러");
		const post = await createPost(author);

		await comment(post.id, commenter, "가".repeat(80));
		await comment(post.id, commenter, "😀".repeat(60));

		const bodies = (await notificationsOf(author)).map((row) => row.body);
		expect(bodies).toContain("가".repeat(50));
		expect(bodies).toContain("😀".repeat(50));
	});

	test("답글은 부모 댓글 작성자에게 알리고, 글쓴이에게는 알리지 않는다", async () => {
		const author = await createUser("글쓴이");
		const commenter = await createUser("댓글러");
		const replier = await createUser("답글러");
		const post = await createPost(author);
		const parent = await comment(post.id, commenter, "첫 댓글");

		const res = await comment(
			post.id,
			replier,
			"저도 궁금해요",
			parent.body.id as string,
		);

		expect(res.status).toBe(201);
		expect(await notificationsOf(commenter)).toMatchObject([
			{
				type: "comment",
				title: "답글러님이 답글을 남겼어요",
				body: "저도 궁금해요",
				href: `/community/posts/${post.id}`,
				actorId: replier.user.id,
			},
		]);
		// 글쓴이가 받은 알림은 첫 댓글 하나뿐이다
		expect(await notificationsOf(author)).toMatchObject([
			{ title: "댓글러님이 댓글을 남겼어요" },
		]);
		expect(await countOf(replier)).toBe(0);
	});

	test("본인 글에 단 댓글과 본인 댓글에 단 답글은 알리지 않는다", async () => {
		const author = await createUser("글쓴이");
		const post = await createPost(author);

		const parent = await comment(post.id, author, "내 글에 내가 댓글");
		await comment(
			post.id,
			author,
			"내 댓글에 내가 답글",
			parent.body.id as string,
		);

		expect(parent.status).toBe(201);
		expect(await countOf(author)).toBe(0);
	});

	test("지워진 댓글의 작성자에게는 답글을 알리지 않는다", async () => {
		const author = await createUser("글쓴이");
		const commenter = await createUser("댓글러");
		const replier = await createUser("답글러");
		const post = await createPost(author);
		const parent = await prisma.comment.create({
			data: {
				content: "지운 댓글",
				postId: post.id,
				userId: commenter.user.id,
				deletedAt: new Date(),
			},
		});

		const res = await comment(post.id, replier, "답글", parent.id);

		expect(res.status).toBe(201);
		expect(await countOf(commenter)).toBe(0);
	});

	test("댓글을 달지 못하면(없는 글, 잘못된 부모 댓글) 알림도 없다", async () => {
		const author = await createUser("글쓴이");
		const commenter = await createUser("댓글러");
		const post = await createPost(author);

		const noPost = await comment(NO_SUCH_ID, commenter, "댓글");
		const badParent = await comment(post.id, commenter, "답글", NO_SUCH_ID);

		expect(noPost.status).toBe(404);
		expect(badParent.status).toBe(400);
		expect(await prisma.notification.count()).toBe(0);
	});
});

describe.skipIf(!hasTestDb)("좋아요 알림", () => {
	beforeEach(resetDb);

	test("좋아요가 켜지면 글쓴이에게 like 알림이 생기고, 취소해도 알림은 늘지 않는다", async () => {
		const author = await createUser("글쓴이");
		const fan = await createUser("팬");
		const post = await createPost(author, "오늘 뽑은 포카 자랑");

		const on = await like(post.id, fan);
		const off = await like(post.id, fan);

		expect(on.body).toEqual({ liked: true, count: 1 });
		expect(off.body).toEqual({ liked: false, count: 0 });
		expect(await notificationsOf(author)).toMatchObject([
			{
				type: "like",
				title: "팬님이 내 글을 좋아해요",
				body: "오늘 뽑은 포카 자랑",
				href: `/community/posts/${post.id}`,
				actorId: fan.user.id,
				readAt: null,
			},
		]);
	});

	test("같은 글에 같은 사람이 다시 눌러도 안 읽은 알림이 있으면 새로 만들지 않는다", async () => {
		const author = await createUser("글쓴이");
		const fan = await createUser("팬");
		const post = await createPost(author);

		await like(post.id, fan);
		await like(post.id, fan);
		await like(post.id, fan);

		expect(await countOf(author)).toBe(1);
	});

	test("알림을 읽은 뒤에 다시 누르면 새 알림이 생긴다", async () => {
		const author = await createUser("글쓴이");
		const fan = await createUser("팬");
		const post = await createPost(author);

		await like(post.id, fan);
		await prisma.notification.updateMany({ data: { readAt: new Date() } });
		await like(post.id, fan);
		await like(post.id, fan);

		expect(await countOf(author)).toBe(2);
	});

	test("다른 사람이나 다른 글의 좋아요는 따로 알린다", async () => {
		const author = await createUser("글쓴이");
		const fan = await createUser("팬");
		const other = await createUser("다른팬");
		const first = await createPost(author, "첫 글");
		const second = await createPost(author, "둘째 글");

		await like(first.id, fan);
		await like(first.id, other);
		await like(second.id, fan);

		const rows = await notificationsOf(author);
		expect(rows).toHaveLength(3);
		expect(rows.map((row) => `${row.actorId}:${row.href}`).sort()).toEqual(
			[
				`${fan.user.id}:/community/posts/${first.id}`,
				`${other.user.id}:/community/posts/${first.id}`,
				`${fan.user.id}:/community/posts/${second.id}`,
			].sort(),
		);
	});

	test("본인 글에 누른 좋아요는 알리지 않는다", async () => {
		const author = await createUser("글쓴이");
		const post = await createPost(author);

		const res = await like(post.id, author);

		expect(res.body).toEqual({ liked: true, count: 1 });
		expect(await countOf(author)).toBe(0);
	});
});

describe.skipIf(!hasTestDb)("관심 상품 상태 변경 알림", () => {
	beforeEach(resetDb);

	test("상태가 바뀌면 찜한 사용자에게만 market 알림이 생긴다", async () => {
		const seller = await createUser("판매자");
		const fan1 = await createUser("찜1");
		const fan2 = await createUser("찜2");
		const stranger = await createUser("남");
		const market = await createMarket(seller);
		await wish(fan1, market.id);
		await wish(fan2, market.id);
		// 주인이 자기 상품을 찜해 두어도 알리지 않는다
		await wish(seller, market.id);

		const res = await changeStatus(market.id, seller, { status: "reserved" });

		expect(res.status).toBe(200);
		for (const fan of [fan1, fan2]) {
			expect(await notificationsOf(fan)).toMatchObject([
				{
					type: "market",
					title: "찜한 상품이 예약중으로 바뀌었어요",
					body: TITLE,
					href: `/market/${market.id}`,
					actorId: seller.user.id,
					readAt: null,
				},
			]);
		}
		expect(await countOf(stranger)).toBe(0);
		expect(await countOf(seller)).toBe(0);
	});

	test("판매완료와 판매중으로 바뀔 때도 알린다", async () => {
		const seller = await createUser("판매자");
		const fan = await createUser("찜");
		const market = await createMarket(seller);
		await wish(fan, market.id);

		await changeStatus(market.id, seller, { status: "sold" });
		await changeStatus(market.id, seller, { status: "available" });

		const titles = (await notificationsOf(fan)).map((row) => row.title);
		expect(titles.sort()).toEqual(
			[
				"찜한 상품이 판매완료로 바뀌었어요",
				"찜한 상품이 판매중으로 바뀌었어요",
			].sort(),
		);
	});

	test("상태가 그대로이거나 다른 정보만 고치면 알리지 않는다", async () => {
		const seller = await createUser("판매자");
		const fan = await createUser("찜");
		const market = await createMarket(seller);
		await wish(fan, market.id);

		const same = await changeStatus(market.id, seller, {
			status: "available",
		});
		const titleOnly = await changeStatus(market.id, seller, {
			title: "제목만 수정",
		});
		await changeStatus(market.id, seller, { status: "reserved" });
		const again = await changeStatus(market.id, seller, {
			status: "reserved",
		});

		expect([same.status, titleOnly.status, again.status]).toEqual([
			200, 200, 200,
		]);
		// 예약중으로 바뀐 한 번만 알렸다
		expect(await countOf(fan)).toBe(1);
	});

	test("찜한 사람이 없어도 상태 변경은 성공한다", async () => {
		const seller = await createUser("판매자");
		const market = await createMarket(seller);

		const res = await changeStatus(market.id, seller, { status: "sold" });

		expect(res.status).toBe(200);
		expect(await prisma.notification.count()).toBe(0);
	});

	test("주인이 아니어서 수정하지 못하면 알림도 없다", async () => {
		const seller = await createUser("판매자");
		const fan = await createUser("찜");
		const market = await createMarket(seller);
		await wish(fan, market.id);

		const res = await changeStatus(market.id, fan, { status: "sold" });

		expect(res.status).toBe(403);
		expect(await prisma.notification.count()).toBe(0);
	});
});

describe.skipIf(!hasTestDb)("거래 완료 알림", () => {
	beforeEach(resetDb);

	test("구매자에게 trade 알림이 생기고 판매자에게는 생기지 않는다", async () => {
		const seller = await createUser("판매자");
		const buyer = await createUser("구매자");
		const market = await createTradeRoom(seller, buyer);

		const res = await complete(market.id, seller, buyer);

		expect(res.status).toBe(201);
		expect(await notificationsOf(buyer)).toMatchObject([
			{
				type: "trade",
				title: "거래가 완료됐어요",
				body: TITLE,
				href: "/mypage/purchases",
				actorId: seller.user.id,
				readAt: null,
			},
		]);
		expect(await countOf(seller)).toBe(0);
	});

	test("찜한 다른 사용자에게는 판매완료 알림을, 구매자에게는 거래 알림만 보낸다", async () => {
		const seller = await createUser("판매자");
		const buyer = await createUser("구매자");
		const fan = await createUser("찜");
		const market = await createTradeRoom(seller, buyer);
		await wish(fan, market.id);
		await wish(buyer, market.id);

		await complete(market.id, seller, buyer);

		expect(await notificationsOf(fan)).toMatchObject([
			{
				type: "market",
				title: "찜한 상품이 판매완료로 바뀌었어요",
				body: TITLE,
				href: `/market/${market.id}`,
			},
		]);
		expect(await notificationsOf(buyer)).toMatchObject([{ type: "trade" }]);
	});

	test("이미 판매완료로 바꿔 둔 상품을 거래 완료해도 찜한 사용자에게 두 번 알리지 않는다", async () => {
		const seller = await createUser("판매자");
		const buyer = await createUser("구매자");
		const fan = await createUser("찜");
		const market = await createTradeRoom(seller, buyer);
		await wish(fan, market.id);

		await changeStatus(market.id, seller, { status: "sold" });
		const res = await complete(market.id, seller, buyer);

		expect(res.status).toBe(201);
		expect(await countOf(fan)).toBe(1);
		expect(await notificationsOf(buyer)).toMatchObject([{ type: "trade" }]);
	});

	test("거래를 완료하지 못하면 알림도 없다", async () => {
		const seller = await createUser("판매자");
		const buyer = await createUser("구매자");
		const stranger = await createUser("남");
		const market = await createTradeRoom(seller, buyer);
		await wish(stranger, market.id);

		const notSeller = await complete(market.id, buyer, buyer);
		const notMember = await complete(market.id, seller, stranger);

		expect(notSeller.status).toBe(403);
		expect(notMember.status).toBe(400);
		expect(await prisma.notification.count()).toBe(0);
	});
});

describe.skipIf(!hasTestDb)("후기 알림", () => {
	beforeEach(resetDb);

	test("구매자가 후기를 남기면 판매자에게 review 알림이 생긴다", async () => {
		const seller = await createUser("판매자");
		const buyer = await createUser("구매자");
		const trade = await createTrade(seller, buyer);

		const res = await review(trade.id, buyer, {
			rating: 5,
			content: "친절하고 빠르게 거래해 주셨어요",
		});

		expect(res.status).toBe(201);
		expect(await notificationsOf(seller)).toMatchObject([
			{
				type: "review",
				title: "구매자님이 후기를 남겼어요",
				body: "별점 5점 · 친절하고 빠르게 거래해 주셨어요",
				href: `/users/${seller.user.id}`,
				actorId: buyer.user.id,
				readAt: null,
			},
		]);
		expect(await countOf(buyer)).toBe(0);
	});

	test("판매자가 남기면 구매자에게 알리고, 내용이 없으면 별점만 본문에 담는다", async () => {
		const seller = await createUser("판매자");
		const buyer = await createUser("구매자");
		const trade = await createTrade(seller, buyer);

		await review(trade.id, seller, { rating: 4 });

		expect(await notificationsOf(buyer)).toMatchObject([
			{
				type: "review",
				title: "판매자님이 후기를 남겼어요",
				body: "별점 4점",
				href: `/users/${buyer.user.id}`,
			},
		]);
	});

	test("후기를 남기지 못하면(중복, 당사자 아님) 알림이 늘지 않는다", async () => {
		const seller = await createUser("판매자");
		const buyer = await createUser("구매자");
		const stranger = await createUser("남");
		const trade = await createTrade(seller, buyer);
		await review(trade.id, buyer, { rating: 5 });

		const duplicate = await review(trade.id, buyer, { rating: 1 });
		const outsider = await review(trade.id, stranger, { rating: 1 });

		expect(duplicate.status).toBe(409);
		expect(outsider.status).toBe(403);
		expect(await prisma.notification.count()).toBe(1);
	});
});

describe.skipIf(!hasTestDb)("채팅 알림", () => {
	beforeEach(resetDb);

	test("다른 멤버에게 chat 알림이 생기고 보낸 사람에게는 생기지 않는다", async () => {
		const sender = await createUser("보낸이");
		const receiver = await createUser("받는이");
		const room = await createRoom([sender, receiver]);

		const res = await say(room.id, sender, "포카 아직 있나요?");

		expect(res.status).toBe(200);
		expect(await notificationsOf(receiver)).toMatchObject([
			{
				type: "chat",
				title: "보낸이님의 새 메시지",
				body: "포카 아직 있나요?",
				href: `/chat/${room.id}`,
				actorId: sender.user.id,
				readAt: null,
			},
		]);
		expect(await countOf(sender)).toBe(0);
	});

	test("이미지 메시지는 [사진]으로, 긴 메시지는 앞 50자만 보여 준다", async () => {
		const sender = await createUser("보낸이");
		const receiver = await createUser("받는이");
		const photoRoom = await createRoom([sender, receiver]);
		const longRoom = await createRoom([sender, receiver]);

		await say(photoRoom.id, sender, "image:https://example.com/photo.png");
		await say(longRoom.id, sender, "가".repeat(80));

		const byHref = new Map(
			(await notificationsOf(receiver)).map((row) => [row.href, row.body]),
		);
		expect(byHref.get(`/chat/${photoRoom.id}`)).toBe("[사진]");
		expect(byHref.get(`/chat/${longRoom.id}`)).toBe("가".repeat(50));
	});

	test("같은 방의 안 읽은 채팅 알림이 있으면 새로 만들지 않고 내용과 시각만 갱신한다", async () => {
		const sender = await createUser("보낸이");
		const receiver = await createUser("받는이");
		const room = await createRoom([sender, receiver]);
		await say(room.id, sender, "첫 메시지");
		const [first] = await notificationsOf(receiver);
		const longAgo = new Date("2026-01-01T00:00:00.000Z");
		await prisma.notification.update({
			where: { id: first.id },
			data: { createdAt: longAgo },
		});

		await say(room.id, sender, "두 번째 메시지");
		await say(room.id, sender, "세 번째 메시지");

		const rows = await notificationsOf(receiver);
		expect(rows).toHaveLength(1);
		expect(rows[0]).toMatchObject({
			id: first.id,
			type: "chat",
			body: "세 번째 메시지",
			readAt: null,
		});
		expect(rows[0].createdAt.getTime()).toBeGreaterThan(longAgo.getTime());
	});

	test("알림을 읽은 뒤에 온 메시지는 새 알림이 된다", async () => {
		const sender = await createUser("보낸이");
		const receiver = await createUser("받는이");
		const room = await createRoom([sender, receiver]);
		await say(room.id, sender, "첫 메시지");
		await prisma.notification.updateMany({ data: { readAt: new Date() } });

		await say(room.id, sender, "두 번째 메시지");

		const rows = await notificationsOf(receiver);
		expect(rows).toHaveLength(2);
		expect(rows.filter((row) => row.readAt === null)).toMatchObject([
			{ body: "두 번째 메시지" },
		]);
	});

	test("방마다 따로 알린다", async () => {
		const sender = await createUser("보낸이");
		const receiver = await createUser("받는이");
		const first = await createRoom([sender, receiver]);
		const second = await createRoom([sender, receiver]);

		await say(first.id, sender, "첫째 방");
		await say(second.id, sender, "둘째 방");

		expect(
			(await notificationsOf(receiver)).map((row) => row.href).sort(),
		).toEqual([`/chat/${first.id}`, `/chat/${second.id}`].sort());
	});

	test("그룹 방은 보낸 사람을 뺀 모든 멤버에게 알리고, 보낸 사람이 바뀌면 제목도 따라간다", async () => {
		const a = await createUser("가");
		const b = await createUser("나");
		const c = await createUser("다");
		const room = await createRoom([a, b, c]);

		await say(room.id, b, "나가 보냄");

		expect(await countOf(a)).toBe(1);
		expect(await countOf(c)).toBe(1);
		expect(await countOf(b)).toBe(0);

		await say(room.id, c, "다가 보냄");

		// 가는 안 읽은 알림 하나가 최신 메시지로 바뀌고, 나는 처음 받는다
		expect(await notificationsOf(a)).toMatchObject([
			{
				title: "다님의 새 메시지",
				body: "다가 보냄",
				actorId: c.user.id,
			},
		]);
		expect(await notificationsOf(b)).toMatchObject([
			{ title: "다님의 새 메시지", body: "다가 보냄" },
		]);
		// 다는 자기가 보낸 메시지로는 받지 않고, 앞서 받은 알림만 그대로 있다
		expect(await notificationsOf(c)).toMatchObject([
			{ title: "나님의 새 메시지", body: "나가 보냄" },
		]);
	});

	test("멤버가 아니면 403이고 알림도 없다", async () => {
		const sender = await createUser("보낸이");
		const receiver = await createUser("받는이");
		const outsider = await createUser("남");
		const room = await createRoom([sender, receiver]);

		const res = await say(room.id, outsider, "끼어들기");

		expect(res.status).toBe(403);
		expect(await prisma.notification.count()).toBe(0);
	});
});

describe.skipIf(!hasTestDb)("채팅방 읽음 처리와 채팅 알림", () => {
	beforeEach(resetDb);
	afterEach(() => mock.restore());

	function readRoom(account: TestAccount, roomId: string) {
		return callApi("POST", `/chat/rooms/${roomId}/read`, {
			user: account.auth,
		});
	}

	async function unreadCount(account: TestAccount) {
		const res = await callApi("GET", "/notifications/unread-count", {
			user: account.auth,
		});
		return res.body.count;
	}

	test("방을 읽음 처리하면 그 방의 안 읽은 채팅 알림도 읽음이 되고, 다른 방과 다른 사람의 알림은 그대로다", async () => {
		const me = await createUser("나");
		const partner = await createUser("상대");
		const first = await createRoom([me, partner]);
		const second = await createRoom([me, partner]);
		await say(first.id, partner, "첫째 방");
		await say(second.id, partner, "둘째 방");
		// 내가 보낸 메시지로 상대도 안 읽은 알림을 하나 받는다
		await say(first.id, me, "내가 보낸 답");
		expect(await unreadCount(me)).toBe(2);

		const res = await readRoom(me, first.id);

		expect(res.status).toBe(200);
		const readAtByHref = new Map(
			(await notificationsOf(me)).map((row) => [row.href, row.readAt]),
		);
		expect(readAtByHref.get(`/chat/${first.id}`)).toBeInstanceOf(Date);
		expect(readAtByHref.get(`/chat/${second.id}`)).toBeNull();
		expect(
			(await notificationsOf(partner)).map((row) => [row.href, row.readAt]),
		).toEqual([[`/chat/${first.id}`, null]]);
		expect(await unreadCount(me)).toBe(1);
		expect(await unreadCount(partner)).toBe(1);
	});

	test("읽음 처리한 뒤에 온 메시지는 새 안 읽은 알림이 되고, 이미 읽은 알림의 읽은 시각은 그대로다", async () => {
		const me = await createUser("나");
		const partner = await createUser("상대");
		const room = await createRoom([me, partner]);
		await say(room.id, partner, "첫 메시지");
		await readRoom(me, room.id);
		const [read] = await notificationsOf(me);
		expect(read.readAt).not.toBeNull();

		await say(room.id, partner, "읽은 뒤의 메시지");
		expect(await unreadCount(me)).toBe(1);
		await readRoom(me, room.id);

		const rows = await notificationsOf(me);
		expect(rows).toHaveLength(2);
		expect(rows[0].id).toBe(read.id);
		expect(rows[0].readAt).toEqual(read.readAt);
		expect(rows[1].readAt).not.toBeNull();
		expect(await unreadCount(me)).toBe(0);
	});

	test("멤버가 아니면 403이고 알림은 그대로다", async () => {
		const sender = await createUser("보낸이");
		const receiver = await createUser("받는이");
		const stranger = await createUser("낯선 사람");
		const room = await createRoom([sender, receiver]);
		await say(room.id, sender, "안녕");
		// 방을 나간 옛 멤버처럼 이 방 경로의 안 읽은 알림이 남아 있어도, 멤버가 아니면 건드리지 않는다
		await prisma.notification.create({
			data: {
				userId: stranger.user.id,
				type: "chat",
				title: "옛 알림",
				href: `/chat/${room.id}`,
			},
		});

		const res = await readRoom(stranger, room.id);

		expect(res.status).toBe(403);
		expect((await notificationsOf(stranger)).map((row) => row.readAt)).toEqual([
			null,
		]);
		expect((await notificationsOf(receiver)).map((row) => row.readAt)).toEqual([
			null,
		]);
	});

	test("알림을 읽음 처리하지 못해도 방 읽음 처리는 성공하고 오류는 로그에만 남긴다", async () => {
		const logged = spyOn(console, "error").mockImplementation(() => {});
		const me = await createUser("나");
		const partner = await createUser("상대");
		const room = await createRoom([me, partner]);
		await say(room.id, partner, "안녕");
		failNotificationWrites("UPDATE");

		const res = await readRoom(me, room.id);

		expect(res.status).toBe(200);
		expect(res.body.lastReadAt).toEqual(expect.any(String));
		const member = await prisma.chatRoomMember.findUniqueOrThrow({
			where: { roomId_userId: { roomId: room.id, userId: me.user.id } },
		});
		expect(member.lastReadAt).not.toBeNull();
		expect((await notificationsOf(me)).map((row) => row.readAt)).toEqual([
			null,
		]);
		expect(logged.mock.calls.map(([message]) => String(message))).toContain(
			"[notification] markReadByHref failed",
		);
	});
});

// ==============================================
// 설정, 본인 행동, 실패
// ==============================================

describe.skipIf(!hasTestDb)(
	"알림 설정이 꺼져 있으면 알림을 만들지 않는다",
	() => {
		beforeEach(resetDb);

		test("댓글 설정", async () => {
			const author = await createUser("글쓴이");
			const commenter = await createUser("댓글러");
			await setSettings(author, { comment: false });
			const post = await createPost(author);

			await comment(post.id, commenter, "댓글");

			expect(await countOf(author)).toBe(0);
		});

		test("좋아요 설정", async () => {
			const author = await createUser("글쓴이");
			const fan = await createUser("팬");
			await setSettings(author, { like: false });
			const post = await createPost(author);

			await like(post.id, fan);

			expect(await countOf(author)).toBe(0);
		});

		test("채팅 설정", async () => {
			const sender = await createUser("보낸이");
			const receiver = await createUser("받는이");
			await setSettings(receiver, { chat: false });
			const room = await createRoom([sender, receiver]);

			const res = await say(room.id, sender, "안녕하세요");

			expect(res.status).toBe(200);
			expect(await countOf(receiver)).toBe(0);
		});

		test("관심 상품 설정은 끈 사용자만 건너뛴다", async () => {
			const seller = await createUser("판매자");
			const muted = await createUser("끈사람");
			const fan = await createUser("켠사람");
			await setSettings(muted, { market: false });
			const market = await createMarket(seller);
			await wish(muted, market.id);
			await wish(fan, market.id);

			await changeStatus(market.id, seller, { status: "reserved" });

			expect(await countOf(muted)).toBe(0);
			expect(await countOf(fan)).toBe(1);
		});

		test("거래 설정은 거래 완료와 후기 알림을 모두 막는다", async () => {
			const seller = await createUser("판매자");
			const buyer = await createUser("구매자");
			await setSettings(seller, { trade: false });
			await setSettings(buyer, { trade: false });
			const market = await createTradeRoom(seller, buyer);
			const done = await createTrade(seller, buyer);

			await complete(market.id, seller, buyer);
			await review(done.id, buyer, { rating: 5 });

			expect(await prisma.notification.count()).toBe(0);
		});

		test("한 종류를 꺼도 다른 종류는 그대로 받는다", async () => {
			const author = await createUser("글쓴이");
			const fan = await createUser("팬");
			await setSettings(author, { comment: false });
			const post = await createPost(author);

			await comment(post.id, fan, "댓글");
			await like(post.id, fan);

			expect(await notificationsOf(author)).toMatchObject([{ type: "like" }]);
		});

		test("설정을 다시 켜면 그 뒤의 알림부터 만든다", async () => {
			const author = await createUser("글쓴이");
			const commenter = await createUser("댓글러");
			const post = await createPost(author);

			await callApi("PUT", "/users/me/notification-settings", {
				user: author.auth,
				body: { comment: false },
			});
			await comment(post.id, commenter, "꺼진 동안의 댓글");
			await callApi("PUT", "/users/me/notification-settings", {
				user: author.auth,
				body: { comment: true },
			});
			await comment(post.id, commenter, "켠 뒤의 댓글");

			expect(await notificationsOf(author)).toMatchObject([
				{ body: "켠 뒤의 댓글" },
			]);
		});
	},
);

describe.skipIf(!hasTestDb)("알림을 만들지 않는 경우", () => {
	beforeEach(resetDb);
	afterEach(() => mock.restore());

	test("탈퇴한 사용자에게는 알림을 만들지 않는다", async () => {
		const author = await createUser("글쓴이");
		const commenter = await createUser("댓글러");
		const post = await createPost(author);
		await prisma.user.update({
			where: { id: author.user.id },
			data: { deletedAt: new Date() },
		});

		const res = await comment(post.id, commenter, "댓글");

		expect(res.status).toBe(201);
		expect(await prisma.notification.count()).toBe(0);
	});

	test("알림을 저장하지 못해도 본 요청은 성공하고 오류는 로그에만 남긴다", async () => {
		const logged = spyOn(console, "error").mockImplementation(() => {});
		const author = await createUser("글쓴이");
		const commenter = await createUser("댓글러");
		const post = await createPost(author);
		const room = await createRoom([author, commenter]);
		const market = await createTradeRoom(author, commenter);
		await wish(commenter, market.id);
		failNotificationWrites();

		const commented = await comment(post.id, commenter, "댓글");
		const liked = await like(post.id, commenter);
		const messaged = await say(room.id, commenter, "메시지");
		const reserved = await changeStatus(market.id, author, {
			status: "reserved",
		});
		const completed = await complete(market.id, author, commenter);

		expect([
			commented.status,
			liked.status,
			messaged.status,
			reserved.status,
			completed.status,
		]).toEqual([201, 200, 200, 200, 201]);
		expect(await prisma.comment.count()).toBe(1);
		expect(await prisma.chatMessage.count()).toBe(1);
		expect(await prisma.transaction.count()).toBe(1);
		expect(await prisma.notification.count()).toBe(0);
		// 알림 종류마다 실패를 서버 로그에 남긴다
		const messages = logged.mock.calls.map(([message]) => String(message));
		for (const label of [
			"createForComment",
			"createForLike",
			"createForChatMessage",
			"createForMarketStatus",
			"createForTrade",
		]) {
			expect(messages).toContain(`[notification] ${label} failed`);
		}
	});
});

// ==============================================
// 알림함 API
// ==============================================

describe.skipIf(!hasTestDb)("GET /notifications", () => {
	beforeEach(resetDb);

	test("최신순으로 돌려주고 항목은 정해진 필드만 담는다", async () => {
		const me = await createUser("나");
		await prisma.notification.createMany({
			data: [
				{
					id: "old",
					userId: me.user.id,
					type: "comment",
					title: "오래된 알림",
					createdAt: new Date("2026-01-01T00:00:00.000Z"),
				},
				{
					id: "new",
					userId: me.user.id,
					type: "market",
					title: "새 알림",
					body: "상품명",
					href: "/market/abc",
					actorId: NO_SUCH_ID,
					readAt: new Date("2026-01-03T00:00:00.000Z"),
					createdAt: new Date("2026-01-02T00:00:00.000Z"),
				},
			],
		});

		const res = await listNotifications(me);

		expect(res.status).toBe(200);
		expect(res.body).toEqual({
			items: [
				{
					id: "new",
					type: "market",
					title: "새 알림",
					body: "상품명",
					href: "/market/abc",
					readAt: "2026-01-03T00:00:00.000Z",
					createdAt: "2026-01-02T00:00:00.000Z",
				},
				{
					id: "old",
					type: "comment",
					title: "오래된 알림",
					body: null,
					href: null,
					readAt: null,
					createdAt: "2026-01-01T00:00:00.000Z",
				},
			],
			nextCursor: null,
			hasMore: false,
		});
	});

	test("nextCursor로 이어서 읽으면 빠짐없이 겹치지 않게 최신순으로 나뉜다", async () => {
		const me = await createUser("나");
		await seedNotifications(me, 5);

		const first = await listNotifications(me, "?limit=2");
		const second = await listNotifications(
			me,
			`?limit=2&cursor=${first.body.nextCursor}`,
		);
		const third = await listNotifications(
			me,
			`?limit=2&cursor=${second.body.nextCursor}`,
		);

		const titles = (page: typeof first) =>
			(page.body.items as NotificationRow[]).map((item) => item.title);
		expect(titles(first)).toEqual(["알림 5", "알림 4"]);
		expect(first.body.hasMore).toBe(true);
		expect(titles(second)).toEqual(["알림 3", "알림 2"]);
		expect(second.body.hasMore).toBe(true);
		expect(titles(third)).toEqual(["알림 1"]);
		expect(third.body).toMatchObject({ hasMore: false, nextCursor: null });
	});

	test("같은 시각의 알림도 순서가 고정되어 페이지 경계에서 빠지거나 겹치지 않는다", async () => {
		const me = await createUser("나");
		const sameTime = new Date("2026-01-01T00:00:00.000Z");
		await prisma.notification.createMany({
			data: ["a", "b", "c", "d", "e"].map((id) => ({
				id: `tie-${id}`,
				userId: me.user.id,
				type: "comment",
				title: `같은 시각 ${id}`,
				createdAt: sameTime,
			})),
		});

		const ids: string[] = [];
		let cursor: string | null = null;
		do {
			const page = await listNotifications(
				me,
				`?limit=2${cursor ? `&cursor=${cursor}` : ""}`,
			);
			ids.push(...(page.body.items as NotificationRow[]).map((i) => i.id));
			cursor = page.body.nextCursor as string | null;
		} while (cursor);

		// createdAt이 같으면 id 내림차순
		expect(ids).toEqual(["tie-e", "tie-d", "tie-c", "tie-b", "tie-a"]);
	});

	test("limit을 생략하면 20건씩 돌려준다", async () => {
		const me = await createUser("나");
		await seedNotifications(me, 21);

		const res = await listNotifications(me);

		expect(res.body.items).toHaveLength(20);
		expect(res.body.hasMore).toBe(true);
	});

	test("limit이 1~50을 벗어나면 422", async () => {
		const me = await createUser("나");

		const zero = await listNotifications(me, "?limit=0");
		const tooMany = await listNotifications(me, "?limit=51");

		expect(zero.status).toBe(422);
		expect(tooMany.status).toBe(422);
	});

	test("남의 알림은 목록에 나오지 않는다", async () => {
		const me = await createUser("나");
		const other = await createUser("남");
		await seedNotifications(me, 1);
		await seedNotifications(other, 3);

		const res = await listNotifications(me);

		expect(res.body.items).toHaveLength(1);
	});
});

describe.skipIf(!hasTestDb)("GET /notifications/unread-count", () => {
	beforeEach(resetDb);

	test("내가 안 읽은 알림만 센다", async () => {
		const me = await createUser("나");
		const other = await createUser("남");
		const rows = await seedNotifications(me, 3);
		await seedNotifications(other, 4);
		await prisma.notification.update({
			where: { id: rows[0].id },
			data: { readAt: new Date() },
		});

		const res = await callApi("GET", "/notifications/unread-count", {
			user: me.auth,
		});

		expect(res.status).toBe(200);
		expect(res.body).toEqual({ count: 2 });
	});

	test("알림이 없으면 0", async () => {
		const me = await createUser("나");

		const res = await callApi("GET", "/notifications/unread-count", {
			user: me.auth,
		});

		expect(res.body).toEqual({ count: 0 });
	});
});

describe.skipIf(!hasTestDb)("PATCH /notifications/:id/read", () => {
	beforeEach(resetDb);

	function read(user: TestAccount, id: string) {
		return callApi("PATCH", `/notifications/${id}/read`, { user: user.auth });
	}

	test("읽음 처리하고 읽은 시각을 돌려준다", async () => {
		const me = await createUser("나");
		const [target, untouched] = await seedNotifications(me, 2);

		const res = await read(me, target.id);

		expect(res.status).toBe(200);
		expect(res.body.id).toBe(target.id);
		const row = await prisma.notification.findUniqueOrThrow({
			where: { id: target.id },
		});
		expect(res.body.readAt).toBe(row.readAt?.toISOString() ?? null);
		expect(row.readAt).not.toBeNull();
		const other = await prisma.notification.findUniqueOrThrow({
			where: { id: untouched.id },
		});
		expect(other.readAt).toBeNull();

		const count = await callApi("GET", "/notifications/unread-count", {
			user: me.auth,
		});
		expect(count.body).toEqual({ count: 1 });
	});

	test("이미 읽은 알림은 처음 읽은 시각을 그대로 둔다", async () => {
		const me = await createUser("나");
		const [target] = await seedNotifications(me, 1);
		await prisma.notification.update({
			where: { id: target.id },
			data: { readAt: new Date("2026-01-01T00:00:00.000Z") },
		});

		const res = await read(me, target.id);

		expect(res.status).toBe(200);
		expect(res.body.readAt).toBe("2026-01-01T00:00:00.000Z");
	});

	test("남의 알림이나 없는 알림은 404이고 남의 알림은 바뀌지 않는다", async () => {
		const me = await createUser("나");
		const other = await createUser("남");
		const [theirs] = await seedNotifications(other, 1);

		const foreign = await read(me, theirs.id);
		const missing = await read(me, NO_SUCH_ID);

		expect(foreign.status).toBe(404);
		expect(missing.status).toBe(404);
		expect(foreign.body).toEqual({ error: "Notification not found" });
		const row = await prisma.notification.findUniqueOrThrow({
			where: { id: theirs.id },
		});
		expect(row.readAt).toBeNull();
	});
});

describe.skipIf(!hasTestDb)("POST /notifications/read-all", () => {
	beforeEach(resetDb);

	test("내 안 읽은 알림을 모두 읽음 처리하고 바뀐 수를 돌려준다", async () => {
		const me = await createUser("나");
		const other = await createUser("남");
		const rows = await seedNotifications(me, 4);
		await seedNotifications(other, 2);
		const alreadyRead = new Date("2026-01-01T00:00:00.000Z");
		await prisma.notification.update({
			where: { id: rows[0].id },
			data: { readAt: alreadyRead },
		});

		const res = await callApi("POST", "/notifications/read-all", {
			user: me.auth,
		});
		const again = await callApi("POST", "/notifications/read-all", {
			user: me.auth,
		});

		expect(res.status).toBe(200);
		expect(res.body).toEqual({ updated: 3 });
		expect(again.body).toEqual({ updated: 0 });
		expect(
			await prisma.notification.count({
				where: { userId: me.user.id, readAt: null },
			}),
		).toBe(0);
		// 이미 읽은 알림의 읽은 시각은 그대로고, 남의 알림은 그대로 안 읽음이다
		const kept = await prisma.notification.findUniqueOrThrow({
			where: { id: rows[0].id },
		});
		expect(kept.readAt?.toISOString()).toBe(alreadyRead.toISOString());
		expect(
			await prisma.notification.count({
				where: { userId: other.user.id, readAt: null },
			}),
		).toBe(2);
	});
});

describe.skipIf(!hasTestDb)("알림함 API 인증", () => {
	beforeEach(resetDb);

	test("로그인하지 않으면 401", async () => {
		const requests = [
			callApi("GET", "/notifications"),
			callApi("GET", "/notifications/unread-count"),
			callApi("PATCH", `/notifications/${NO_SUCH_ID}/read`),
			callApi("POST", "/notifications/read-all"),
			callApi("GET", "/users/me/notification-settings"),
			callApi("PUT", "/users/me/notification-settings", { body: {} }),
		];

		for (const res of await Promise.all(requests)) {
			expect(res.status).toBe(401);
			expect(res.body).toEqual({ error: "Unauthorized" });
		}
	});

	test("아직 DB에 사용자가 없는 로그인 계정은 빈 알림함을 본다", async () => {
		const newcomer: TestUser = { id: randomUUID() };

		const list = await callApi("GET", "/notifications", { user: newcomer });
		const count = await callApi("GET", "/notifications/unread-count", {
			user: newcomer,
		});
		const readAll = await callApi("POST", "/notifications/read-all", {
			user: newcomer,
		});

		expect(list.body).toEqual({ items: [], nextCursor: null, hasMore: false });
		expect(count.body).toEqual({ count: 0 });
		expect(readAll.status).toBe(401);
	});
});

// ==============================================
// 알림 설정 API
// ==============================================

describe.skipIf(!hasTestDb)("알림 설정", () => {
	beforeEach(resetDb);

	const ALL_ON = {
		chat: true,
		like: true,
		comment: true,
		market: true,
		trade: true,
	};

	function getSettings(user: TestAccount) {
		return callApi("GET", "/users/me/notification-settings", {
			user: user.auth,
		});
	}

	function putSettings(user: TestAccount, body: Record<string, unknown>) {
		return callApi("PUT", "/users/me/notification-settings", {
			user: user.auth,
			body,
		});
	}

	test("설정한 적이 없으면 모두 켜져 있다", async () => {
		const me = await createUser("나");

		const res = await getSettings(me);

		expect(res.status).toBe(200);
		expect(res.body).toEqual(ALL_ON);
	});

	test("보낸 항목만 바꾸고 바뀐 전체 설정을 돌려준다", async () => {
		const me = await createUser("나");

		const first = await putSettings(me, { chat: false });
		const second = await putSettings(me, { like: false, chat: true });
		const third = await putSettings(me, { comment: false });

		expect(first.status).toBe(200);
		expect(first.body).toEqual({ ...ALL_ON, chat: false });
		expect(second.body).toEqual({ ...ALL_ON, like: false });
		expect(third.body).toEqual({ ...ALL_ON, like: false, comment: false });
		expect((await getSettings(me)).body).toEqual(third.body);
	});

	test("빈 본문은 아무것도 바꾸지 않는다", async () => {
		const me = await createUser("나");
		await putSettings(me, { market: false });

		const res = await putSettings(me, {});

		expect(res.status).toBe(200);
		expect(res.body).toEqual({ ...ALL_ON, market: false });
	});

	test("바꾼 항목만 DB에 저장하고, 다른 사용자의 설정은 건드리지 않는다", async () => {
		const me = await createUser("나");
		const other = await createUser("남");

		await putSettings(me, { trade: false });

		const mine = await prisma.user.findUniqueOrThrow({
			where: { id: me.user.id },
		});
		const theirs = await prisma.user.findUniqueOrThrow({
			where: { id: other.user.id },
		});
		expect(mine.notificationSettings).toEqual({ trade: false });
		expect(theirs.notificationSettings).toBeNull();
		expect((await getSettings(other)).body).toEqual(ALL_ON);
	});

	test("불리언이 아닌 값은 422이고 아무것도 바뀌지 않는다", async () => {
		const me = await createUser("나");

		const res = await putSettings(me, { chat: "off" });

		expect(res.status).toBe(422);
		expect((await getSettings(me)).body).toEqual(ALL_ON);
	});

	test("서로 다른 항목을 동시에 바꿔도 모두 저장된다", async () => {
		const me = await createUser("나");

		const results = await Promise.all([
			putSettings(me, { chat: false }),
			putSettings(me, { like: false }),
			putSettings(me, { trade: false }),
		]);

		expect(results.map((res) => res.status)).toEqual([200, 200, 200]);
		expect((await getSettings(me)).body).toEqual({
			...ALL_ON,
			chat: false,
			like: false,
			trade: false,
		});
	});

	test("저장된 값에 모르는 키나 불리언이 아닌 값이 있어도 무시한다", async () => {
		const me = await createUser("나");
		await setSettings(me, { chat: "no", like: false, marketing: false });

		const res = await getSettings(me);

		expect(res.body).toEqual({ ...ALL_ON, like: false });
	});
});
