import { beforeEach, describe, expect, test } from "bun:test";
import { prisma } from "@/lib/prisma";
import { callApi } from "../helpers/api";
import { createUser, hasTestDb, resetDb } from "../helpers/db";

async function postWithImages(userId: string, urls: string[]) {
	return prisma.post.create({
		data: {
			content: "원래 본문",
			userId,
			images: { create: urls.map((imageUrl) => ({ imageUrl })) },
		},
		include: { images: true },
	});
}

async function imageUrlsOf(postId: string) {
	const images = await prisma.postImage.findMany({ where: { postId } });
	return images.map((image) => image.imageUrl).sort();
}

describe.skipIf(!hasTestDb)("PUT /posts/:id 게시글 수정", () => {
	beforeEach(resetDb);

	test("본문·이미지 삭제·이미지 추가를 한 번에 반영한다", async () => {
		const { user, auth } = await createUser("작성자");
		const post = await postWithImages(user.id, [
			"https://storage.test/posts/keep.png",
			"https://storage.test/posts/remove.png",
		]);
		const removeId = post.images.find((image) =>
			image.imageUrl.endsWith("remove.png"),
		)?.id;

		const res = await callApi("PUT", `/posts/${post.id}`, {
			user: auth,
			body: {
				content: "고친 본문",
				removeImageIds: [removeId],
				addImageUrls: ["https://storage.test/posts/new.png"],
			},
		});

		expect(res.status).toBe(200);
		expect(res.body.content).toBe("고친 본문");
		expect(await imageUrlsOf(post.id)).toEqual([
			"https://storage.test/posts/keep.png",
			"https://storage.test/posts/new.png",
		]);
	});

	test("다른 게시글의 이미지 ID는 지우지 않는다", async () => {
		const owner = await createUser("작성자");
		const other = await createUser("다른사람");
		const myPost = await postWithImages(owner.user.id, []);
		const otherPost = await postWithImages(other.user.id, [
			"https://storage.test/posts/other.png",
		]);

		const res = await callApi("PUT", `/posts/${myPost.id}`, {
			user: owner.auth,
			body: { content: "본문", removeImageIds: [otherPost.images[0].id] },
		});

		expect(res.status).toBe(200);
		expect(await imageUrlsOf(otherPost.id)).toEqual([
			"https://storage.test/posts/other.png",
		]);
	});

	test("남의 게시글은 수정할 수 없고 이미지도 그대로다", async () => {
		const owner = await createUser("작성자");
		const other = await createUser("다른사람");
		const post = await postWithImages(owner.user.id, [
			"https://storage.test/posts/a.png",
		]);

		const res = await callApi("PUT", `/posts/${post.id}`, {
			user: other.auth,
			body: { content: "가로채기", removeImageIds: [post.images[0].id] },
		});

		expect(res.status).toBe(403);
		expect(await imageUrlsOf(post.id)).toEqual([
			"https://storage.test/posts/a.png",
		]);
	});
});
