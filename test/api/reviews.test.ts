import { beforeEach, describe, expect, test } from "bun:test";
import { prisma } from "@/lib/prisma";
import { callApi, type TestUser } from "../helpers/api";
import { createUser, hasTestDb, resetDb } from "../helpers/db";

const TITLE = "르세라핌 김채원 포카";
const NO_SUCH_ID = "00000000-0000-0000-0000-000000000000";

type TestAccount = Awaited<ReturnType<typeof createUser>>;

/**
 * 판매자와 구매자, 상품, 완료된 거래를 DB에 바로 만든다.
 * 이미 있는 판매자·구매자를 넘기면 그 사람들 사이의 새 거래를 만든다.
 */
async function setupTrade(
	options: { seller?: TestAccount; buyer?: TestAccount; status?: string } = {},
) {
	const seller = options.seller ?? (await createUser("seller"));
	const buyer = options.buyer ?? (await createUser("buyer"));
	const market = await prisma.market.create({
		data: {
			title: TITLE,
			price: 15000,
			status: "sold",
			userId: seller.user.id,
		},
	});
	const transaction = await prisma.transaction.create({
		data: {
			type: "purchase",
			status: options.status ?? "completed",
			price: 15000,
			buyerId: buyer.user.id,
			sellerId: seller.user.id,
			marketId: market.id,
		},
	});
	return { seller, buyer, market, transaction };
}

function postReview(
	transactionId: string,
	user: TestUser | undefined,
	body: { rating: unknown; content?: unknown },
) {
	return callApi("POST", `/transactions/${transactionId}/reviews`, {
		user,
		body,
	});
}

describe.skipIf(!hasTestDb)("POST /transactions/:id/reviews", () => {
	beforeEach(resetDb);

	test("구매자가 판매자에게 후기를 남기면 201", async () => {
		const { seller, buyer, transaction } = await setupTrade();

		const res = await postReview(transaction.id, buyer.auth, {
			rating: 5,
			content: "친절하고 빠르게 거래해 주셨어요",
		});

		expect(res.status).toBe(201);
		expect(res.body).toMatchObject({
			transactionId: transaction.id,
			reviewerId: buyer.user.id,
			revieweeId: seller.user.id,
			rating: 5,
			content: "친절하고 빠르게 거래해 주셨어요",
		});
		expect(Number.isNaN(Date.parse(res.body.createdAt as string))).toBe(false);
		const row = await prisma.review.findUniqueOrThrow({
			where: { id: res.body.id as string },
		});
		expect(row).toMatchObject({
			transactionId: transaction.id,
			reviewerId: buyer.user.id,
			revieweeId: seller.user.id,
			rating: 5,
		});
	});

	test("판매자도 구매자에게 후기를 남길 수 있고, 받는 사람은 항상 거래 상대다", async () => {
		const { seller, buyer, transaction } = await setupTrade();

		const res = await postReview(transaction.id, seller.auth, { rating: 4 });

		expect(res.status).toBe(201);
		expect(res.body).toMatchObject({
			reviewerId: seller.user.id,
			revieweeId: buyer.user.id,
			rating: 4,
		});
	});

	test("한 거래에서 구매자와 판매자가 각각 한 번씩 남길 수 있다", async () => {
		const { seller, buyer, transaction } = await setupTrade();

		const byBuyer = await postReview(transaction.id, buyer.auth, { rating: 5 });
		const bySeller = await postReview(transaction.id, seller.auth, {
			rating: 3,
		});

		expect(byBuyer.status).toBe(201);
		expect(bySeller.status).toBe(201);
		expect(
			await prisma.review.count({ where: { transactionId: transaction.id } }),
		).toBe(2);
	});

	test("내용은 생략할 수 있고, 앞뒤 공백은 지우고, 공백뿐이면 남기지 않는다", async () => {
		const first = await setupTrade();
		const second = await setupTrade();
		const third = await setupTrade();

		const omitted = await postReview(first.transaction.id, first.buyer.auth, {
			rating: 5,
		});
		const padded = await postReview(second.transaction.id, second.buyer.auth, {
			rating: 5,
			content: "  좋았어요  ",
		});
		const blank = await postReview(third.transaction.id, third.buyer.auth, {
			rating: 5,
			content: "   ",
		});

		expect(omitted.status).toBe(201);
		expect(omitted.body.content).toBeNull();
		expect(padded.body.content).toBe("좋았어요");
		expect(blank.status).toBe(201);
		expect(blank.body.content).toBeNull();
	});

	test("내용은 300자까지 받고 301자부터는 422", async () => {
		const first = await setupTrade();
		const second = await setupTrade();

		const exact = await postReview(first.transaction.id, first.buyer.auth, {
			rating: 5,
			content: "가".repeat(300),
		});
		const tooLong = await postReview(second.transaction.id, second.buyer.auth, {
			rating: 5,
			content: "가".repeat(301),
		});

		expect(exact.status).toBe(201);
		expect(tooLong.status).toBe(422);
		expect(await prisma.review.count()).toBe(1);
	});

	test.each([
		["0", 0],
		["6", 6],
		["음수", -1],
		["소수", 4.5],
		["문자", "별"],
		["null", null],
	])("별점이 %s이면 422이고 아무것도 남지 않는다", async (_label, rating) => {
		const { buyer, transaction } = await setupTrade();

		const res = await postReview(transaction.id, buyer.auth, { rating });

		expect(res.status).toBe(422);
		expect(await prisma.review.count()).toBe(0);
	});

	test("별점이 없으면 422", async () => {
		const { buyer, transaction } = await setupTrade();

		const res = await callApi(
			"POST",
			`/transactions/${transaction.id}/reviews`,
			{ user: buyer.auth, body: { content: "별점 없이" } },
		);

		expect(res.status).toBe(422);
		expect(await prisma.review.count()).toBe(0);
	});

	test("거래 당사자가 아니면 403", async () => {
		const { transaction } = await setupTrade();
		const stranger = await createUser("stranger");

		const res = await postReview(transaction.id, stranger.auth, { rating: 1 });

		expect(res.status).toBe(403);
		expect(await prisma.review.count()).toBe(0);
	});

	test("같은 상품으로 대화만 한 사용자도 거래 당사자가 아니라서 403", async () => {
		const { seller, market, transaction } = await setupTrade();
		const asker = await createUser("asker");
		await prisma.chatRoom.create({
			data: {
				marketId: market.id,
				members: {
					create: [{ userId: asker.user.id }, { userId: seller.user.id }],
				},
			},
		});

		const res = await postReview(transaction.id, asker.auth, { rating: 5 });

		expect(res.status).toBe(403);
	});

	test("같은 거래에 두 번 남기면 409이고 처음 후기가 그대로 남는다", async () => {
		const { buyer, transaction } = await setupTrade();
		const first = await postReview(transaction.id, buyer.auth, {
			rating: 5,
			content: "처음",
		});

		const again = await postReview(transaction.id, buyer.auth, {
			rating: 1,
			content: "두 번째",
		});

		expect(first.status).toBe(201);
		expect(again.status).toBe(409);
		const rows = await prisma.review.findMany();
		expect(rows).toHaveLength(1);
		expect(rows[0]).toMatchObject({ rating: 5, content: "처음" });
	});

	test("같은 후기를 동시에 두 번 보내도 한 번만 남는다", async () => {
		const { buyer, transaction } = await setupTrade();

		const results = await Promise.all([
			postReview(transaction.id, buyer.auth, { rating: 5 }),
			postReview(transaction.id, buyer.auth, { rating: 5 }),
		]);

		expect(results.map((res) => res.status).sort()).toEqual([201, 409]);
		expect(await prisma.review.count()).toBe(1);
	});

	test("없는 거래면 404", async () => {
		const { buyer } = await setupTrade();

		const res = await postReview(NO_SUCH_ID, buyer.auth, { rating: 5 });

		expect(res.status).toBe(404);
	});

	test("완료되지 않은 거래에는 남길 수 없다(400)", async () => {
		const pending = await setupTrade({ status: "pending" });
		const cancelled = await setupTrade({ status: "cancelled" });

		const onPending = await postReview(
			pending.transaction.id,
			pending.buyer.auth,
			{ rating: 5 },
		);
		const onCancelled = await postReview(
			cancelled.transaction.id,
			cancelled.seller.auth,
			{ rating: 5 },
		);

		expect(onPending.status).toBe(400);
		expect(onCancelled.status).toBe(400);
		expect(await prisma.review.count()).toBe(0);
	});

	test("당사자가 아닌 사용자에게는 완료되지 않은 거래도 403으로만 보인다", async () => {
		const { transaction } = await setupTrade({ status: "pending" });
		const stranger = await createUser("stranger");

		const res = await postReview(transaction.id, stranger.auth, { rating: 5 });

		expect(res.status).toBe(403);
	});

	test("로그인하지 않으면 401", async () => {
		const { transaction } = await setupTrade();

		const res = await postReview(transaction.id, undefined, { rating: 5 });

		expect(res.status).toBe(401);
		expect(await prisma.review.count()).toBe(0);
	});

	test("DB도 1~5 밖의 별점을 거부한다", async () => {
		const { seller, buyer, transaction } = await setupTrade();

		// PrismaPromise는 expect().rejects가 Promise로 받아 주지 않아서 async 함수로 감싼다
		const create = async (rating: number) => {
			await prisma.review.create({
				data: {
					transactionId: transaction.id,
					reviewerId: buyer.user.id,
					revieweeId: seller.user.id,
					rating,
				},
			});
		};

		await expect(create(0)).rejects.toThrow();
		await expect(create(6)).rejects.toThrow();
		expect(await prisma.review.count()).toBe(0);
	});
});

describe.skipIf(!hasTestDb)("GET /users/:id/reviews", () => {
	beforeEach(resetDb);

	/** 같은 판매자에게 서로 다른 구매자가 남긴 후기 여러 건을 만들고, 오래된 것부터 id 순서대로 돌려준다 */
	async function setupReviews(ratings: number[]) {
		const seller = await createUser("seller");
		const ids: string[] = [];
		for (const [index, rating] of ratings.entries()) {
			const trade = await setupTrade({
				seller,
				buyer: await createUser(`buyer-${index}`),
			});
			const review = await prisma.review.create({
				data: {
					transactionId: trade.transaction.id,
					reviewerId: trade.buyer.user.id,
					revieweeId: seller.user.id,
					rating,
					content: `후기 ${index}`,
					// index가 클수록 최근에 남긴 후기
					createdAt: new Date(Date.UTC(2026, 9, 1, 0, index)),
				},
			});
			ids.push(review.id);
		}
		return { seller, ids };
	}

	test("로그인하지 않아도 받은 후기를 볼 수 있다", async () => {
		const { seller, buyer, market, transaction } = await setupTrade();
		await postReview(transaction.id, buyer.auth, {
			rating: 4,
			content: "믿고 거래했어요",
		});

		const res = await callApi("GET", `/users/${seller.user.id}/reviews`);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			items: [
				{
					rating: 4,
					content: "믿고 거래했어요",
					reviewer: {
						id: buyer.user.id,
						nickname: "buyer",
						profileImage: null,
					},
					market: { id: market.id, title: TITLE },
				},
			],
			nextCursor: null,
			hasMore: false,
		});
		const [item] = res.body.items as { id: string; createdAt: string }[];
		expect(typeof item.id).toBe("string");
		expect(Number.isNaN(Date.parse(item.createdAt))).toBe(false);
	});

	test("내가 쓴 후기가 아니라 받은 후기만 나온다", async () => {
		const { seller, buyer, transaction } = await setupTrade();
		await postReview(transaction.id, buyer.auth, { rating: 5 });
		await postReview(transaction.id, seller.auth, { rating: 2 });

		const sellerReviews = await callApi(
			"GET",
			`/users/${seller.user.id}/reviews`,
		);
		const buyerReviews = await callApi(
			"GET",
			`/users/${buyer.user.id}/reviews`,
		);

		expect(sellerReviews.body.items).toMatchObject([
			{ rating: 5, reviewer: { id: buyer.user.id } },
		]);
		expect(buyerReviews.body.items).toMatchObject([
			{ rating: 2, reviewer: { id: seller.user.id } },
		]);
	});

	test("최신순으로 나오고, 커서로 다음 페이지를 이어 받는다", async () => {
		const { seller, ids } = await setupReviews([1, 2, 3, 4, 5]);
		const [oldest, second, third, fourth, newest] = ids;

		const page1 = await callApi(
			"GET",
			`/users/${seller.user.id}/reviews?limit=2`,
		);
		const page2 = await callApi(
			"GET",
			`/users/${seller.user.id}/reviews?limit=2&cursor=${page1.body.nextCursor}`,
		);
		const page3 = await callApi(
			"GET",
			`/users/${seller.user.id}/reviews?limit=2&cursor=${page2.body.nextCursor}`,
		);

		const idsOf = (res: { body: Record<string, unknown> }) =>
			(res.body.items as { id: string }[]).map((item) => item.id);
		expect(idsOf(page1)).toEqual([newest, fourth]);
		expect(page1.body.hasMore).toBe(true);
		expect(page1.body.nextCursor).toBe(fourth);
		expect(idsOf(page2)).toEqual([third, second]);
		expect(page2.body.hasMore).toBe(true);
		expect(idsOf(page3)).toEqual([oldest]);
		expect(page3.body.hasMore).toBe(false);
		expect(page3.body.nextCursor).toBeNull();
	});

	test("페이지 크기가 후기 수와 같으면 다음 페이지는 없다", async () => {
		const { seller } = await setupReviews([5, 4]);

		const res = await callApi(
			"GET",
			`/users/${seller.user.id}/reviews?limit=2`,
		);

		expect(res.body.items).toHaveLength(2);
		expect(res.body.hasMore).toBe(false);
		expect(res.body.nextCursor).toBeNull();
	});

	test("limit이 1~50을 벗어나면 422", async () => {
		const { user } = await createUser("seller");

		const zero = await callApi("GET", `/users/${user.id}/reviews?limit=0`);
		const tooMany = await callApi("GET", `/users/${user.id}/reviews?limit=51`);

		expect(zero.status).toBe(422);
		expect(tooMany.status).toBe(422);
	});

	test("받은 후기가 없으면 빈 목록", async () => {
		const { user } = await createUser("newbie");

		const res = await callApi("GET", `/users/${user.id}/reviews`);

		expect(res.status).toBe(200);
		expect(res.body).toEqual({ items: [], nextCursor: null, hasMore: false });
	});

	test("없는 사용자와 탈퇴한 사용자는 404", async () => {
		const { seller, buyer, transaction } = await setupTrade();
		await postReview(transaction.id, buyer.auth, { rating: 5 });
		await prisma.user.update({
			where: { id: seller.user.id },
			data: { deletedAt: new Date() },
		});

		const unknown = await callApi("GET", `/users/${NO_SUCH_ID}/reviews`);
		const withdrawn = await callApi("GET", `/users/${seller.user.id}/reviews`);

		expect(unknown.status).toBe(404);
		expect(withdrawn.status).toBe(404);
	});

	test("탈퇴한 사용자가 쓴 후기에는 탈퇴한 사용자로 표시된다", async () => {
		const { seller, buyer, transaction } = await setupTrade();
		await postReview(transaction.id, buyer.auth, { rating: 5 });
		await callApi("DELETE", "/users/me", { user: buyer.auth });

		const res = await callApi("GET", `/users/${seller.user.id}/reviews`);

		expect(res.body.items).toMatchObject([
			{
				rating: 5,
				reviewer: { nickname: "탈퇴한 사용자", profileImage: null },
			},
		]);
	});
});

describe.skipIf(!hasTestDb)("GET /users/:id의 후기·거래 요약", () => {
	beforeEach(resetDb);

	test("후기를 받을 때마다 reviewCount와 averageRating이 갱신된다", async () => {
		const seller = await createUser("seller");
		const viewer = await createUser("viewer");
		const profile = () =>
			callApi("GET", `/users/${seller.user.id}`, { user: viewer.auth });

		const before = await profile();
		const first = await setupTrade({ seller });
		await postReview(first.transaction.id, first.buyer.auth, { rating: 5 });
		const afterOne = await profile();
		const second = await setupTrade({ seller });
		await postReview(second.transaction.id, second.buyer.auth, { rating: 4 });
		const afterTwo = await profile();

		expect(before.status).toBe(200);
		expect(before.body).toMatchObject({ reviewCount: 0, averageRating: null });
		expect(afterOne.body).toMatchObject({ reviewCount: 1, averageRating: 5 });
		expect(afterTwo.body).toMatchObject({ reviewCount: 2, averageRating: 4.5 });
	});

	test("평균은 소수 첫째 자리까지 반올림한다", async () => {
		const seller = await createUser("seller");
		const viewer = await createUser("viewer");
		for (const rating of [5, 5, 4]) {
			const trade = await setupTrade({ seller });
			await postReview(trade.transaction.id, trade.buyer.auth, { rating });
		}

		const res = await callApi("GET", `/users/${seller.user.id}`, {
			user: viewer.auth,
		});

		// (5 + 5 + 4) / 3 = 4.666...
		expect(res.body).toMatchObject({ reviewCount: 3, averageRating: 4.7 });
	});

	test("내가 쓴 후기는 내 평점에 들어가지 않는다", async () => {
		const { seller, buyer, transaction } = await setupTrade();
		await postReview(transaction.id, buyer.auth, { rating: 1 });

		const res = await callApi("GET", `/users/${buyer.user.id}`, {
			user: seller.auth,
		});

		expect(res.body).toMatchObject({ reviewCount: 0, averageRating: null });
	});

	test("가입일과 완료된 거래 수(구매 + 판매)를 함께 돌려준다", async () => {
		const me = await createUser("me");
		const viewer = await createUser("viewer");
		await setupTrade({ seller: me });
		await setupTrade({ buyer: me });
		await setupTrade({ seller: me, status: "pending" });

		const res = await callApi("GET", `/users/${me.user.id}`, {
			user: viewer.auth,
		});

		expect(res.status).toBe(200);
		expect(res.body.tradeCount).toBe(2);
		expect(res.body.createdAt).toBe(me.user.createdAt.toISOString());
	});
});

describe.skipIf(!hasTestDb)("거래 내역과 채팅방의 후기 여부", () => {
	beforeEach(resetDb);

	test("/users/me/trades의 reviewed는 내가 후기를 썼는지만 나타낸다", async () => {
		const { seller, buyer, transaction } = await setupTrade();
		const trades = async (user: TestUser) =>
			(await callApi("GET", "/users/me/trades", { user })).body.items;

		const before = [await trades(buyer.auth), await trades(seller.auth)];
		await postReview(transaction.id, buyer.auth, { rating: 5 });
		const afterBuyer = [await trades(buyer.auth), await trades(seller.auth)];
		await postReview(transaction.id, seller.auth, { rating: 4 });
		const afterBoth = [await trades(buyer.auth), await trades(seller.auth)];

		expect(before).toMatchObject([
			[{ reviewed: false }],
			[{ reviewed: false }],
		]);
		expect(afterBuyer).toMatchObject([
			[{ reviewed: true }],
			[{ reviewed: false }],
		]);
		expect(afterBoth).toMatchObject([
			[{ reviewed: true }],
			[{ reviewed: true }],
		]);
	});

	test("/users/me/trades의 partnerId는 거래 상대의 id다", async () => {
		const { seller, buyer } = await setupTrade();

		const asBuyer = await callApi("GET", "/users/me/trades", {
			user: buyer.auth,
		});
		const asSeller = await callApi("GET", "/users/me/trades", {
			user: seller.auth,
		});

		expect(asBuyer.body.items).toMatchObject([
			{ type: "buy", partner: "seller", partnerId: seller.user.id },
		]);
		expect(asSeller.body.items).toMatchObject([
			{ type: "sell", partner: "buyer", partnerId: buyer.user.id },
		]);
	});

	test("거래마다 따로 계산한다(한 거래에만 후기를 쓴 경우)", async () => {
		const buyer = await createUser("buyer");
		const first = await setupTrade({ buyer });
		await setupTrade({ buyer });
		await postReview(first.transaction.id, buyer.auth, { rating: 5 });

		const res = await callApi("GET", "/users/me/trades", { user: buyer.auth });

		const items = res.body.items as { id: string; reviewed: boolean }[];
		expect(items).toHaveLength(2);
		expect(
			items.filter((item) => item.reviewed).map((item) => item.id),
		).toEqual([first.transaction.id]);
	});

	test("/users/me/purchases에도 reviewed와 판매자 partnerId가 담긴다", async () => {
		const { seller, buyer, transaction } = await setupTrade();

		const before = await callApi("GET", "/users/me/purchases", {
			user: buyer.auth,
		});
		await postReview(transaction.id, buyer.auth, { rating: 5 });
		const after = await callApi("GET", "/users/me/purchases", {
			user: buyer.auth,
		});

		expect(before.body.items).toMatchObject([
			{ seller: "seller", partnerId: seller.user.id, reviewed: false },
		]);
		expect(after.body.items).toMatchObject([
			{ seller: "seller", partnerId: seller.user.id, reviewed: true },
		]);
	});

	test("채팅방 상세의 market.transaction.myReviewed는 보는 사람 기준이다", async () => {
		const { seller, buyer, market, transaction } = await setupTrade();
		const room = await prisma.chatRoom.create({
			data: {
				marketId: market.id,
				members: {
					create: [{ userId: buyer.user.id }, { userId: seller.user.id }],
				},
			},
		});
		const myReviewed = async (user: TestUser) => {
			const res = await callApi("GET", `/chat/rooms/${room.id}`, { user });
			expect(res.status).toBe(200);
			return (res.body.market as { transaction: { myReviewed: boolean } })
				.transaction.myReviewed;
		};

		const before = [
			await myReviewed(buyer.auth),
			await myReviewed(seller.auth),
		];
		await postReview(transaction.id, buyer.auth, { rating: 5 });
		const afterBuyer = [
			await myReviewed(buyer.auth),
			await myReviewed(seller.auth),
		];
		await postReview(transaction.id, seller.auth, { rating: 5 });
		const afterBoth = [
			await myReviewed(buyer.auth),
			await myReviewed(seller.auth),
		];

		expect(before).toEqual([false, false]);
		expect(afterBuyer).toEqual([true, false]);
		expect(afterBoth).toEqual([true, true]);
	});

	test("거래 완료부터 후기까지 이어서 해도 같은 거래 id로 연결된다", async () => {
		const seller = await createUser("seller");
		const buyer = await createUser("buyer");
		const market = await prisma.market.create({
			data: { title: TITLE, price: 15000, userId: seller.user.id },
		});
		const room = await prisma.chatRoom.create({
			data: {
				marketId: market.id,
				members: {
					create: [{ userId: buyer.user.id }, { userId: seller.user.id }],
				},
			},
		});

		const done = await callApi("POST", `/markets/${market.id}/complete`, {
			user: seller.auth,
			body: { buyerId: buyer.user.id },
		});
		const detail = await callApi("GET", `/chat/rooms/${room.id}`, {
			user: buyer.auth,
		});
		const transaction = (
			detail.body.market as { transaction: { id: string; myReviewed: boolean } }
		).transaction;
		const review = await postReview(transaction.id, buyer.auth, {
			rating: 5,
			content: "빠른 거래였어요",
		});
		const afterDetail = await callApi("GET", `/chat/rooms/${room.id}`, {
			user: buyer.auth,
		});
		const sellerReviews = await callApi(
			"GET",
			`/users/${seller.user.id}/reviews`,
		);

		expect(done.status).toBe(201);
		expect(transaction).toMatchObject({ id: done.body.id, myReviewed: false });
		expect(review.status).toBe(201);
		expect(
			(afterDetail.body.market as { transaction: { myReviewed: boolean } })
				.transaction.myReviewed,
		).toBe(true);
		expect(sellerReviews.body.items).toMatchObject([
			{
				rating: 5,
				content: "빠른 거래였어요",
				market: { id: market.id, title: TITLE },
			},
		]);
	});
});
