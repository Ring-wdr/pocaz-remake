import { beforeEach, describe, expect, test } from "bun:test";
import { callApi } from "../helpers/api";
import { createUser, hasTestDb, resetDb } from "../helpers/db";

describe.skipIf(!hasTestDb)("GET /users/me", () => {
	beforeEach(resetDb);

	test("로그인한 사용자의 Prisma 프로필을 돌려준다", async () => {
		const { user, auth } = await createUser("포카수집가");

		const res = await callApi("GET", "/users/me", { user: auth });

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({ id: user.id, nickname: "포카수집가" });
	});
});
