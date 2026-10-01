import { beforeEach, describe, expect, test } from "bun:test";
import { prisma } from "@/lib/prisma";
import { callApi } from "../helpers/api";
import { createUser, hasTestDb, resetDb } from "../helpers/db";

describe("목록 API의 limit", () => {
	test("숫자가 아니면 500이 아니라 422", async () => {
		const res = await callApi("GET", "/markets?limit=abc");
		expect(res.status).toBe(422);
	});

	test("상한(50)을 넘으면 422", async () => {
		expect((await callApi("GET", "/markets?limit=1000000")).status).toBe(422);
		expect((await callApi("GET", "/posts?limit=0")).status).toBe(422);
	});
});

describe.skipIf(!hasTestDb)("목록 API의 limit (DB)", () => {
	beforeEach(resetDb);

	test("요청한 개수만큼만 돌려준다", async () => {
		const { user } = await createUser("seller");
		for (const title of ["a", "b", "c"]) {
			await prisma.market.create({ data: { title, userId: user.id } });
		}

		const res = await callApi("GET", "/markets?limit=2");

		expect(res.status).toBe(200);
		expect(res.body.items).toHaveLength(2);
		expect(res.body.hasMore).toBe(true);
	});
});
