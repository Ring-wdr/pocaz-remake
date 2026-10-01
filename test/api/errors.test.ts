import {
	afterEach,
	beforeEach,
	describe,
	expect,
	mock,
	spyOn,
	test,
} from "bun:test";
import { prisma } from "@/lib/prisma";
import { commentService, postService } from "@/lib/services/post";
import { callApi } from "../helpers/api";
import { createUser, hasTestDb, resetDb } from "../helpers/db";

// Prisma 오류 메시지에는 서버 파일 경로·모델·제약 이름이 들어간다
const INTERNAL_MESSAGE =
	"Invalid `prisma.comment.create()` invocation in /var/task/.next/server/app/api/route.js";

describe("예상하지 못한 오류는 내부 메시지를 숨긴다", () => {
	afterEach(() => mock.restore());

	test("처리하지 않은 오류는 500과 일반 메시지(JSON)", async () => {
		const logged = spyOn(console, "error").mockImplementation(() => {});
		spyOn(postService, "findById").mockRejectedValue(
			new Error(INTERNAL_MESSAGE),
		);

		const res = await callApi("GET", "/posts/any-id");

		expect(res.status).toBe(500);
		expect(res.body).toEqual({ error: "Internal Server Error" });
		expect(logged).toHaveBeenCalled();
	});
});

describe.skipIf(!hasTestDb)("댓글 작성 오류", () => {
	beforeEach(resetDb);
	afterEach(() => mock.restore());

	test("DB 오류 메시지를 응답 본문으로 내보내지 않는다", async () => {
		spyOn(console, "error").mockImplementation(() => {});
		const { user, auth } = await createUser("작성자");
		const post = await prisma.post.create({
			data: { content: "글", userId: user.id },
		});
		spyOn(commentService, "create").mockRejectedValue(
			new Error(INTERNAL_MESSAGE),
		);

		const res = await callApi("POST", `/posts/${post.id}/comments`, {
			user: auth,
			body: { content: "댓글" },
		});

		expect(res.status).toBe(500);
		expect(JSON.stringify(res.body)).not.toContain("prisma");
	});

	test("없는 부모 댓글에 답글을 달면 400과 이유를 돌려준다", async () => {
		const { user, auth } = await createUser("작성자");
		const post = await prisma.post.create({
			data: { content: "글", userId: user.id },
		});

		const res = await callApi("POST", `/posts/${post.id}/comments`, {
			user: auth,
			body: { content: "답글", parentId: "missing" },
		});

		expect(res.status).toBe(400);
		expect(res.body).toEqual({ error: "Invalid parent comment" });
	});
});
