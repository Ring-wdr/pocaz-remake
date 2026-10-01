import { beforeEach, describe, expect, test } from "bun:test";
import { prisma } from "@/lib/prisma";
import { callApi } from "../helpers/api";
import { createUser, hasTestDb, resetDb } from "../helpers/db";

async function postWithImage(userId: string) {
	return prisma.post.create({
		data: {
			content: "본문",
			userId,
			images: { create: { imageUrl: "https://storage.test/posts/a.png" } },
		},
		include: { images: true },
	});
}

async function marketWithImage(userId: string) {
	return prisma.market.create({
		data: {
			title: "포카 판매",
			userId,
			images: { create: { imageUrl: "https://storage.test/markets/a.png" } },
		},
		include: { images: true },
	});
}

describe.skipIf(!hasTestDb)("하위 이미지 삭제는 부모 리소스에 묶인다", () => {
	beforeEach(resetDb);

	test("자기 게시글 경로로 남의 게시글 이미지를 지울 수 없다", async () => {
		const victim = await createUser("victim");
		const attacker = await createUser("attacker");
		const victimPost = await postWithImage(victim.user.id);
		const attackerPost = await postWithImage(attacker.user.id);
		const victimImageId = victimPost.images[0].id;

		const res = await callApi(
			"DELETE",
			`/posts/${attackerPost.id}/images/${victimImageId}`,
			{ user: attacker.auth },
		);

		expect(res.status).toBe(404);
		expect(
			await prisma.postImage.findUnique({ where: { id: victimImageId } }),
		).not.toBeNull();
	});

	test("자기 게시글의 이미지는 지울 수 있다", async () => {
		const owner = await createUser("owner");
		const post = await postWithImage(owner.user.id);

		const res = await callApi(
			"DELETE",
			`/posts/${post.id}/images/${post.images[0].id}`,
			{ user: owner.auth },
		);

		expect(res.status).toBe(200);
		expect(await prisma.postImage.count({ where: { postId: post.id } })).toBe(
			0,
		);
	});

	test("자기 상품 경로로 남의 상품 이미지를 지울 수 없다", async () => {
		const victim = await createUser("victim");
		const attacker = await createUser("attacker");
		const victimMarket = await marketWithImage(victim.user.id);
		const attackerMarket = await marketWithImage(attacker.user.id);
		const victimImageId = victimMarket.images[0].id;

		const res = await callApi(
			"DELETE",
			`/markets/${attackerMarket.id}/images/${victimImageId}`,
			{ user: attacker.auth },
		);

		expect(res.status).toBe(404);
		expect(
			await prisma.marketImage.findUnique({ where: { id: victimImageId } }),
		).not.toBeNull();
	});

	test("남의 상품 경로로는 403", async () => {
		const owner = await createUser("owner");
		const other = await createUser("other");
		const market = await marketWithImage(owner.user.id);

		const res = await callApi(
			"DELETE",
			`/markets/${market.id}/images/${market.images[0].id}`,
			{ user: other.auth },
		);

		expect(res.status).toBe(403);
	});
});
