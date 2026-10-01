import { beforeEach, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { callApi, type TestUser } from "../helpers/api";
import { createUser, hasTestDb, resetDb } from "../helpers/db";

describe.skipIf(!hasTestDb)("GET /users/me", () => {
	beforeEach(resetDb);

	test("로그인한 사용자의 Prisma 프로필을 돌려준다", async () => {
		const { user, auth } = await createUser("포카수집가");

		const res = await callApi("GET", "/users/me", { user: auth });

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({ id: user.id, nickname: "포카수집가" });
	});

	test("첫 요청이 동시에 여러 개 와도 계정은 하나만 만든다", async () => {
		const auth: TestUser = { id: randomUUID(), email: "new@example.com" };

		const results = await Promise.all(
			Array.from({ length: 5 }, () =>
				callApi("GET", "/users/me", { user: auth }),
			),
		);

		expect(results.map((res) => res.status)).toEqual([200, 200, 200, 200, 200]);
		expect(new Set(results.map((res) => res.body.id)).size).toBe(1);
		expect(await prisma.user.count({ where: { supabaseId: auth.id } })).toBe(1);
	});

	test("소셜 계정 이름이 이미 쓰이는 닉네임이면 다른 닉네임으로 만든다", async () => {
		await createUser("김포카");
		const auth: TestUser = {
			id: randomUUID(),
			user_metadata: { full_name: "김포카" },
		};

		const res = await callApi("GET", "/users/me", { user: auth });

		expect(res.status).toBe(200);
		expect(res.body.nickname).not.toBe("김포카");
	});
});

describe.skipIf(!hasTestDb)("회원 탈퇴", () => {
	beforeEach(resetDb);

	test("탈퇴한 계정은 다시 로그인해도 복구하지 않고 새 계정으로 시작한다", async () => {
		const { user, auth } = await createUser("포카수집가");
		await prisma.post.create({ data: { content: "옛 글", userId: user.id } });

		expect((await callApi("DELETE", "/users/me", { user: auth })).status).toBe(
			200,
		);
		const me = await callApi("GET", "/users/me", { user: auth });
		const posts = await callApi("GET", "/users/me/posts", { user: auth });

		expect(me.status).toBe(200);
		expect(me.body.id).not.toBe(user.id);
		expect(me.body.nickname).not.toBe("포카수집가");
		expect(posts.body.items).toHaveLength(0);
	});

	test("탈퇴하면 계정의 개인정보를 지우고 공개 프로필을 내린다", async () => {
		const { user, auth } = await createUser("포카수집가");
		const viewer = await createUser("구경꾼");

		await callApi("DELETE", "/users/me", { user: auth });
		const row = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

		expect(row.deletedAt).not.toBeNull();
		expect(row.supabaseId).not.toBe(auth.id);
		expect(row.email).toBeNull();
		expect(row.nickname).toBe("탈퇴한 사용자");
		expect(
			(await callApi("GET", `/users/${user.id}`, { user: viewer.auth })).status,
		).toBe(404);
	});

	test("예전 방식으로 탈퇴한 계정(Supabase ID 유지)도 복구하지 않는다", async () => {
		const { user, auth } = await createUser("포카수집가");
		await prisma.user.update({
			where: { id: user.id },
			data: { deletedAt: new Date() },
		});

		const res = await callApi("GET", "/users/me", { user: auth });
		const old = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

		expect(res.status).toBe(200);
		expect(res.body.id).not.toBe(user.id);
		expect(old.deletedAt).not.toBeNull();
		expect(old.email).toBeNull();
	});

	test("탈퇴한 사용자와는 채팅방을 만들 수 없다", async () => {
		const { auth } = await createUser("나");
		const other = await createUser("상대");
		await callApi("DELETE", "/users/me", { user: other.auth });

		const res = await callApi("POST", "/chat/rooms/direct", {
			user: auth,
			body: { targetUserId: other.user.id },
		});

		expect(res.status).toBe(404);
	});
});

describe.skipIf(!hasTestDb)("닉네임 중복", () => {
	beforeEach(resetDb);

	test("다른 사람이 쓰는 닉네임으로는 바꿀 수 없다(앞뒤 공백 무시)", async () => {
		await createUser("포카왕");
		const { auth } = await createUser("나나");

		const res = await callApi("PUT", "/users/me", {
			user: auth,
			body: { nickname: " 포카왕 " },
		});

		expect(res.status).toBe(409);
	});

	test("같은 닉네임으로 동시에 바꾸면 한 명만 성공한다", async () => {
		const a = await createUser("가가");
		const b = await createUser("나나");

		const results = await Promise.all(
			[a, b].map(({ auth }) =>
				callApi("PUT", "/users/me", {
					user: auth,
					body: { nickname: "포카왕" },
				}),
			),
		);

		expect(results.map((res) => res.status).sort()).toEqual([200, 409]);
		expect(
			await prisma.user.count({
				where: { nickname: "포카왕", deletedAt: null },
			}),
		).toBe(1);
	});

	test("닉네임을 그대로 두고 프로필 사진만 바꿀 수 있다", async () => {
		// 중복 검사 도입 전에 생긴 같은 닉네임이 있어도 막지 않는다
		await createUser("포카왕");
		const { auth } = await createUser("포카왕");

		const res = await callApi("PUT", "/users/me", {
			user: auth,
			body: { nickname: "포카왕", profileImage: null },
		});

		expect(res.status).toBe(200);
	});

	test("공백을 빼고 2자 미만이면 400", async () => {
		const { auth } = await createUser("나나");

		const res = await callApi("PUT", "/users/me", {
			user: auth,
			body: { nickname: " 가 " },
		});

		expect(res.status).toBe(400);
	});

	test("탈퇴한 사용자 표시 이름은 쓸 수 없다", async () => {
		const { auth } = await createUser("나나");

		const check = await callApi(
			"GET",
			`/users/me/check-nickname?nickname=${encodeURIComponent("탈퇴한 사용자")}`,
			{ user: auth },
		);
		const update = await callApi("PUT", "/users/me", {
			user: auth,
			body: { nickname: "탈퇴한 사용자" },
		});

		expect(check.body).toEqual({ available: false });
		expect(update.status).toBe(409);
	});
});
