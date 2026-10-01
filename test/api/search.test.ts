import { beforeEach, describe, expect, test } from "bun:test";
import { prisma } from "@/lib/prisma";
import { callApi } from "../helpers/api";
import { createUser, hasTestDb, resetDb } from "../helpers/db";

const keyword = encodeURIComponent("포카");

describe.skipIf(!hasTestDb)("검색은 선택한 필터를 함께 적용한다", () => {
	beforeEach(resetDb);

	test("마켓 검색 + 판매 상태", async () => {
		const { user } = await createUser("판매자");
		await prisma.market.create({
			data: { title: "포카 판매중", status: "available", userId: user.id },
		});
		await prisma.market.create({
			data: { title: "포카 판매완료", status: "sold", userId: user.id },
		});

		const res = await callApi(
			"GET",
			`/markets/search?keyword=${keyword}&status=sold`,
		);

		expect(res.status).toBe(200);
		const items = res.body.items as { title: string }[];
		expect(items.map((item) => item.title)).toEqual(["포카 판매완료"]);
	});

	test("게시글 검색 + 카테고리", async () => {
		const { user } = await createUser("작성자");
		await prisma.post.create({
			data: { content: "포카 자랑", category: "boast", userId: user.id },
		});
		await prisma.post.create({
			data: { content: "포카 정보", category: "info", userId: user.id },
		});

		const res = await callApi(
			"GET",
			`/posts/search?keyword=${keyword}&category=info`,
		);

		expect(res.status).toBe(200);
		const items = res.body.items as { content: string }[];
		expect(items.map((item) => item.content)).toEqual(["포카 정보"]);
	});
});
