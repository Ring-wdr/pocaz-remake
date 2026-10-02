import { beforeEach, describe, expect, test } from "bun:test";
import { prisma } from "@/lib/prisma";
import { callApi } from "../helpers/api";
import { createUser, hasTestDb, resetDb } from "../helpers/db";

type Tag = { id: string; name: string };
type Item = {
	id: string;
	title: string;
	group: Tag | null;
	artist: Tag | null;
};

const titlesOf = (res: { body: Record<string, unknown> }) =>
	(res.body.items as Item[]).map((item) => item.title).sort();

/**
 * 시드 없이 테스트 안에서 만드는 작은 카탈로그.
 * 르세라핌(김채원, 사쿠라), 뉴진스(민지), ITZY(예지). 영문 이름은 대소문자 무시 검색 확인용이다.
 */
async function createCatalog() {
	const lesserafim = await prisma.artistGroup.create({
		data: { name: "르세라핌" },
	});
	const newjeans = await prisma.artistGroup.create({
		data: { name: "뉴진스" },
	});
	const itzy = await prisma.artistGroup.create({ data: { name: "ITZY" } });
	const chaewon = await prisma.artist.create({
		data: { name: "김채원", groupId: lesserafim.id },
	});
	const sakura = await prisma.artist.create({
		data: { name: "사쿠라", groupId: lesserafim.id },
	});
	const minji = await prisma.artist.create({
		data: { name: "민지", groupId: newjeans.id },
	});
	const yeji = await prisma.artist.create({
		data: { name: "예지", groupId: itzy.id },
	});
	return { lesserafim, newjeans, itzy, chaewon, sakura, minji, yeji };
}

describe.skipIf(!hasTestDb)("POST /markets 그룹·멤버 태그", () => {
	beforeEach(resetDb);

	test("그룹과 멤버를 태그하면 응답, 상세, 목록, DB에 담긴다", async () => {
		const { auth } = await createUser("판매자");
		const { lesserafim, chaewon } = await createCatalog();

		const created = await callApi("POST", "/markets", {
			user: auth,
			body: {
				title: "김채원 포카",
				price: 15000,
				groupId: lesserafim.id,
				artistId: chaewon.id,
			},
		});

		expect(created.status).toBe(201);
		expect(created.body).toMatchObject({
			group: { id: lesserafim.id, name: "르세라핌" },
			artist: { id: chaewon.id, name: "김채원" },
		});
		const row = await prisma.market.findUniqueOrThrow({
			where: { id: created.body.id as string },
		});
		expect(row).toMatchObject({
			groupId: lesserafim.id,
			artistId: chaewon.id,
		});

		const detail = await callApi("GET", `/markets/${created.body.id}`);
		expect(detail.body).toMatchObject({
			group: { id: lesserafim.id, name: "르세라핌" },
			artist: { id: chaewon.id, name: "김채원" },
		});
		const list = await callApi("GET", "/markets");
		expect((list.body.items as Item[])[0]).toMatchObject({
			group: { id: lesserafim.id, name: "르세라핌" },
			artist: { id: chaewon.id, name: "김채원" },
		});
	});

	test("그룹만 태그할 수 있고, 태그를 생략하면 둘 다 null이다", async () => {
		const { auth } = await createUser("판매자");
		const { newjeans } = await createCatalog();

		const groupOnly = await callApi("POST", "/markets", {
			user: auth,
			body: { title: "뉴진스 포카", groupId: newjeans.id },
		});
		const untagged = await callApi("POST", "/markets", {
			user: auth,
			body: { title: "태그 없는 포카" },
		});

		expect(groupOnly.status).toBe(201);
		expect(groupOnly.body).toMatchObject({
			group: { id: newjeans.id, name: "뉴진스" },
			artist: null,
		});
		expect(untagged.status).toBe(201);
		expect(untagged.body).toMatchObject({ group: null, artist: null });
	});

	test("멤버가 그 그룹 소속이 아니면 400이고 상품은 만들어지지 않는다", async () => {
		const { auth } = await createUser("판매자");
		const { lesserafim, minji } = await createCatalog();

		const res = await callApi("POST", "/markets", {
			user: auth,
			body: {
				title: "짝이 안 맞는 포카",
				groupId: lesserafim.id,
				artistId: minji.id,
			},
		});

		expect(res.status).toBe(400);
		expect(typeof res.body.error).toBe("string");
		expect(await prisma.market.count()).toBe(0);
	});

	test("없는 그룹이나 멤버 id는 400이다", async () => {
		const { auth } = await createUser("판매자");
		const { lesserafim } = await createCatalog();

		const unknownGroup = await callApi("POST", "/markets", {
			user: auth,
			body: { title: "포카", groupId: "no-such-group" },
		});
		const unknownArtist = await callApi("POST", "/markets", {
			user: auth,
			body: { title: "포카", artistId: "no-such-artist" },
		});
		const unknownArtistInGroup = await callApi("POST", "/markets", {
			user: auth,
			body: {
				title: "포카",
				groupId: lesserafim.id,
				artistId: "no-such-artist",
			},
		});

		expect(unknownGroup.status).toBe(400);
		expect(unknownArtist.status).toBe(400);
		expect(unknownArtistInGroup.status).toBe(400);
		expect(await prisma.market.count()).toBe(0);
	});

	test("문자열이 아닌 id는 422다", async () => {
		const { auth } = await createUser("판매자");

		const res = await callApi("POST", "/markets", {
			user: auth,
			body: { title: "포카", groupId: 123 },
		});

		expect(res.status).toBe(422);
		expect(await prisma.market.count()).toBe(0);
	});
});

describe.skipIf(!hasTestDb)("PUT /markets/:id 그룹·멤버 태그", () => {
	beforeEach(resetDb);

	test("태그를 붙이고 다른 그룹·멤버로 바꾼다", async () => {
		const { user, auth } = await createUser("판매자");
		const { lesserafim, newjeans, chaewon, minji } = await createCatalog();
		const market = await prisma.market.create({
			data: { title: "포카", price: 1000, userId: user.id },
		});

		const tagged = await callApi("PUT", `/markets/${market.id}`, {
			user: auth,
			body: { groupId: lesserafim.id, artistId: chaewon.id },
		});
		const changed = await callApi("PUT", `/markets/${market.id}`, {
			user: auth,
			body: { groupId: newjeans.id, artistId: minji.id },
		});

		expect(tagged.status).toBe(200);
		expect(tagged.body).toMatchObject({
			group: { id: lesserafim.id, name: "르세라핌" },
			artist: { id: chaewon.id, name: "김채원" },
		});
		expect(changed.status).toBe(200);
		expect(changed.body).toMatchObject({
			group: { id: newjeans.id, name: "뉴진스" },
			artist: { id: minji.id, name: "민지" },
		});
		const row = await prisma.market.findUniqueOrThrow({
			where: { id: market.id },
		});
		expect(row).toMatchObject({ groupId: newjeans.id, artistId: minji.id });
	});

	test("groupId·artistId에 null을 보내면 태그를 푼다", async () => {
		const { user, auth } = await createUser("판매자");
		const { lesserafim, chaewon } = await createCatalog();
		const market = await prisma.market.create({
			data: {
				title: "포카",
				groupId: lesserafim.id,
				artistId: chaewon.id,
				userId: user.id,
			},
		});

		const res = await callApi("PUT", `/markets/${market.id}`, {
			user: auth,
			body: { groupId: null, artistId: null },
		});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({ group: null, artist: null });
		const row = await prisma.market.findUniqueOrThrow({
			where: { id: market.id },
		});
		expect(row).toMatchObject({ groupId: null, artistId: null });
		const detail = await callApi("GET", `/markets/${market.id}`);
		expect(detail.body).toMatchObject({ group: null, artist: null });
	});

	test("멤버만 null로 보내면 그룹 태그는 남는다", async () => {
		const { user, auth } = await createUser("판매자");
		const { lesserafim, chaewon } = await createCatalog();
		const market = await prisma.market.create({
			data: {
				title: "포카",
				groupId: lesserafim.id,
				artistId: chaewon.id,
				userId: user.id,
			},
		});

		const res = await callApi("PUT", `/markets/${market.id}`, {
			user: auth,
			body: { artistId: null },
		});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			group: { id: lesserafim.id, name: "르세라핌" },
			artist: null,
		});
	});

	test("태그를 보내지 않으면 그대로 둔다", async () => {
		const { user, auth } = await createUser("판매자");
		const { lesserafim, chaewon } = await createCatalog();
		const market = await prisma.market.create({
			data: {
				title: "포카",
				groupId: lesserafim.id,
				artistId: chaewon.id,
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
			group: { id: lesserafim.id, name: "르세라핌" },
			artist: { id: chaewon.id, name: "김채원" },
		});
	});

	test("그룹과 멤버를 함께 보냈는데 짝이 맞지 않으면 400이고 값은 그대로다", async () => {
		const { user, auth } = await createUser("판매자");
		const { lesserafim, chaewon, minji } = await createCatalog();
		const market = await prisma.market.create({
			data: {
				title: "포카",
				groupId: lesserafim.id,
				artistId: chaewon.id,
				userId: user.id,
			},
		});

		const res = await callApi("PUT", `/markets/${market.id}`, {
			user: auth,
			body: { title: "새 제목", groupId: lesserafim.id, artistId: minji.id },
		});

		expect(res.status).toBe(400);
		const row = await prisma.market.findUniqueOrThrow({
			where: { id: market.id },
		});
		expect(row).toMatchObject({
			title: "포카",
			groupId: lesserafim.id,
			artistId: chaewon.id,
		});
	});

	test("하나만 보내도 저장된 나머지 값과 짝이 맞아야 한다", async () => {
		const { user, auth } = await createUser("판매자");
		const { lesserafim, newjeans, chaewon } = await createCatalog();
		const market = await prisma.market.create({
			data: {
				title: "포카",
				groupId: lesserafim.id,
				artistId: chaewon.id,
				userId: user.id,
			},
		});

		// 그룹만 바꾸면 이전 그룹의 멤버가 남아 짝이 깨진다
		const groupOnly = await callApi("PUT", `/markets/${market.id}`, {
			user: auth,
			body: { groupId: newjeans.id },
		});
		const unchanged = await prisma.market.findUniqueOrThrow({
			where: { id: market.id },
		});
		// 멤버도 함께 비우면 바꿀 수 있다
		const withClearedArtist = await callApi("PUT", `/markets/${market.id}`, {
			user: auth,
			body: { groupId: newjeans.id, artistId: null },
		});

		expect(groupOnly.status).toBe(400);
		expect(unchanged).toMatchObject({
			groupId: lesserafim.id,
			artistId: chaewon.id,
		});
		expect(withClearedArtist.status).toBe(200);
		expect(withClearedArtist.body).toMatchObject({
			group: { id: newjeans.id, name: "뉴진스" },
			artist: null,
		});
	});

	test("없는 그룹이나 멤버 id는 400이고 값은 그대로다", async () => {
		const { user, auth } = await createUser("판매자");
		const { lesserafim } = await createCatalog();
		const market = await prisma.market.create({
			data: { title: "포카", groupId: lesserafim.id, userId: user.id },
		});

		const unknownGroup = await callApi("PUT", `/markets/${market.id}`, {
			user: auth,
			body: { groupId: "no-such-group" },
		});
		const unknownArtist = await callApi("PUT", `/markets/${market.id}`, {
			user: auth,
			body: { artistId: "no-such-artist" },
		});

		expect(unknownGroup.status).toBe(400);
		expect(unknownArtist.status).toBe(400);
		const row = await prisma.market.findUniqueOrThrow({
			where: { id: market.id },
		});
		expect(row).toMatchObject({ groupId: lesserafim.id, artistId: null });
	});

	test("주인이 아니면 403이고 태그는 그대로다", async () => {
		const owner = await createUser("판매자");
		const other = await createUser("다른사람");
		const { lesserafim, newjeans } = await createCatalog();
		const market = await prisma.market.create({
			data: { title: "포카", groupId: lesserafim.id, userId: owner.user.id },
		});

		const res = await callApi("PUT", `/markets/${market.id}`, {
			user: other.auth,
			body: { groupId: newjeans.id },
		});

		expect(res.status).toBe(403);
		const row = await prisma.market.findUniqueOrThrow({
			where: { id: market.id },
		});
		expect(row.groupId).toBe(lesserafim.id);
	});
});

describe.skipIf(!hasTestDb)("상품 목록의 그룹·멤버 필터와 검색", () => {
	let catalog: Awaited<ReturnType<typeof createCatalog>>;

	beforeEach(async () => {
		await resetDb();
		const { user } = await createUser("판매자");
		catalog = await createCatalog();
		const rows = [
			{
				title: "포카 1",
				groupId: catalog.lesserafim.id,
				artistId: catalog.chaewon.id,
			},
			{
				title: "포카 2",
				groupId: catalog.lesserafim.id,
				artistId: catalog.sakura.id,
			},
			{ title: "포카 3", groupId: catalog.lesserafim.id },
			{
				title: "포카 4",
				groupId: catalog.newjeans.id,
				artistId: catalog.minji.id,
			},
			{ title: "포카 5", groupId: catalog.itzy.id, artistId: catalog.yeji.id },
			{ title: "태그 없는 포카 (르세라핌 아님)" },
			{
				title: "포카 7",
				groupId: catalog.lesserafim.id,
				artistId: catalog.chaewon.id,
				status: "sold",
			},
		];
		for (const row of rows) {
			await prisma.market.create({
				data: { ...row, price: 1000, userId: user.id },
			});
		}
	});

	test("GET /markets: groupId로 그 그룹으로 태그한 상품만 돌려준다", async () => {
		const res = await callApi(
			"GET",
			`/markets?groupId=${catalog.lesserafim.id}`,
		);

		expect(res.status).toBe(200);
		expect(titlesOf(res)).toEqual(["포카 1", "포카 2", "포카 3", "포카 7"]);
	});

	test("GET /markets: artistId로 그 멤버로 태그한 상품만 돌려준다", async () => {
		const res = await callApi("GET", `/markets?artistId=${catalog.chaewon.id}`);

		expect(titlesOf(res)).toEqual(["포카 1", "포카 7"]);
		const items = res.body.items as Item[];
		expect(items.every((item) => item.artist?.name === "김채원")).toBe(true);
		expect(items.every((item) => item.group?.name === "르세라핌")).toBe(true);
	});

	test("GET /markets: 그룹과 멤버를 함께 쓰면 둘 다 만족하는 상품만, 맞는 것이 없으면 빈 목록", async () => {
		const both = await callApi(
			"GET",
			`/markets?groupId=${catalog.lesserafim.id}&artistId=${catalog.sakura.id}`,
		);
		const mismatch = await callApi(
			"GET",
			`/markets?groupId=${catalog.lesserafim.id}&artistId=${catalog.minji.id}`,
		);
		const unknown = await callApi("GET", "/markets?groupId=no-such-group");

		expect(titlesOf(both)).toEqual(["포카 2"]);
		expect(mismatch.status).toBe(200);
		expect(titlesOf(mismatch)).toEqual([]);
		expect(unknown.status).toBe(200);
		expect(titlesOf(unknown)).toEqual([]);
	});

	test("GET /markets: 태그하지 않은 상품은 group·artist가 null이고 필터를 주지 않으면 모두 나온다", async () => {
		const res = await callApi("GET", "/markets");

		const items = res.body.items as Item[];
		expect(items).toHaveLength(7);
		const untagged = items.find((item) => item.title.startsWith("태그 없는"));
		expect(untagged).toMatchObject({ group: null, artist: null });
		const groupOnly = items.find((item) => item.title === "포카 3");
		expect(groupOnly).toMatchObject({
			group: { id: catalog.lesserafim.id, name: "르세라핌" },
			artist: null,
		});
	});

	test("GET /markets/status/:status: 판매 상태 안에서 그룹·멤버로 거른다", async () => {
		const sold = await callApi(
			"GET",
			`/markets/status/sold?groupId=${catalog.lesserafim.id}`,
		);
		const available = await callApi(
			"GET",
			`/markets/status/available?artistId=${catalog.chaewon.id}`,
		);

		expect(titlesOf(sold)).toEqual(["포카 7"]);
		expect(titlesOf(available)).toEqual(["포카 1"]);
	});

	test("GET /markets/search: 키워드가 멤버 이름과 그룹 이름에도 맞는다", async () => {
		const byArtist = await callApi(
			"GET",
			`/markets/search?keyword=${encodeURIComponent("김채원")}`,
		);
		const byGroup = await callApi(
			"GET",
			`/markets/search?keyword=${encodeURIComponent("르세라핌")}`,
		);

		expect(titlesOf(byArtist)).toEqual(["포카 1", "포카 7"]);
		// 그룹 태그가 붙은 상품과, 제목에 그룹 이름이 들어 있는 상품
		expect(titlesOf(byGroup)).toEqual([
			"태그 없는 포카 (르세라핌 아님)",
			"포카 1",
			"포카 2",
			"포카 3",
			"포카 7",
		]);
	});

	test("GET /markets/search: 영문 이름은 대소문자를 가리지 않는다", async () => {
		const lower = await callApi("GET", "/markets/search?keyword=itzy");
		const upper = await callApi("GET", "/markets/search?keyword=ITZY");

		expect(titlesOf(lower)).toEqual(["포카 5"]);
		expect(titlesOf(upper)).toEqual(["포카 5"]);
	});

	test("GET /markets/search: 키워드와 그룹·멤버 필터, 판매 상태를 함께 쓴다", async () => {
		const keyword = encodeURIComponent("김채원");

		const inGroup = await callApi(
			"GET",
			`/markets/search?keyword=${keyword}&groupId=${catalog.lesserafim.id}`,
		);
		const otherGroup = await callApi(
			"GET",
			`/markets/search?keyword=${keyword}&groupId=${catalog.newjeans.id}`,
		);
		const soldOnly = await callApi(
			"GET",
			`/markets/search?keyword=${keyword}&artistId=${catalog.chaewon.id}&status=sold`,
		);

		expect(titlesOf(inGroup)).toEqual(["포카 1", "포카 7"]);
		expect(titlesOf(otherGroup)).toEqual([]);
		expect(titlesOf(soldOnly)).toEqual(["포카 7"]);
	});

	test("필터를 건 채로 다음 페이지를 이어서 가져온다", async () => {
		const path = `/markets?groupId=${catalog.lesserafim.id}&limit=3`;
		const first = await callApi("GET", path);
		expect(first.body.hasMore).toBe(true);
		const second = await callApi(
			"GET",
			`${path}&cursor=${first.body.nextCursor}`,
		);

		const items = [
			...(first.body.items as Item[]),
			...(second.body.items as Item[]),
		];
		expect(items.map((item) => item.title).sort()).toEqual([
			"포카 1",
			"포카 2",
			"포카 3",
			"포카 7",
		]);
		expect(second.body.hasMore).toBe(false);
	});

	test("사용자별 목록에도 group·artist가 담긴다", async () => {
		const seller = await prisma.user.findFirstOrThrow();

		const res = await callApi("GET", `/markets/user/${seller.id}`);

		const items = res.body.items as Item[];
		const tagged = items.find((item) => item.title === "포카 4");
		expect(tagged).toMatchObject({
			group: { id: catalog.newjeans.id, name: "뉴진스" },
			artist: { id: catalog.minji.id, name: "민지" },
		});
	});
});

describe.skipIf(!hasTestDb)("그룹·아티스트가 지워질 때", () => {
	beforeEach(resetDb);

	test("상품은 남고 지워진 쪽의 태그만 풀린다", async () => {
		const { user } = await createUser("판매자");
		const { lesserafim, chaewon } = await createCatalog();
		const market = await prisma.market.create({
			data: {
				title: "포카",
				groupId: lesserafim.id,
				artistId: chaewon.id,
				userId: user.id,
			},
		});

		await prisma.artist.delete({ where: { id: chaewon.id } });
		const afterArtist = await prisma.market.findUniqueOrThrow({
			where: { id: market.id },
		});
		await prisma.artistGroup.delete({ where: { id: lesserafim.id } });
		const afterGroup = await prisma.market.findUniqueOrThrow({
			where: { id: market.id },
		});

		expect(afterArtist).toMatchObject({
			groupId: lesserafim.id,
			artistId: null,
		});
		expect(afterGroup).toMatchObject({ groupId: null, artistId: null });
		const detail = await callApi("GET", `/markets/${market.id}`);
		expect(detail.status).toBe(200);
		expect(detail.body).toMatchObject({ group: null, artist: null });
	});
});
