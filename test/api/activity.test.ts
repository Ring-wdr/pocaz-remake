import { beforeEach, describe, expect, test } from "bun:test";
import { prisma } from "@/lib/prisma";
import { callApi } from "../helpers/api";
import { createUser, hasTestDb, resetDb } from "../helpers/db";

describe.skipIf(!hasTestDb)("GET /users/me/activity", () => {
	beforeEach(resetDb);

	test("커서로 이어 받으면 빠지거나 겹치는 항목이 없다", async () => {
		const { user, auth } = await createUser("나나");
		const base = Date.UTC(2025, 0, 1);
		for (let i = 0; i < 5; i++) {
			await prisma.activity.create({
				data: {
					userId: user.id,
					type: "post",
					description: `활동 ${i}`,
					targetId: `post-${i}`,
					targetType: "post",
					createdAt: new Date(base + i * 60_000),
				},
			});
		}

		const texts: string[] = [];
		let cursor: string | null = null;
		for (let page = 0; page < 5; page++) {
			const query: string = cursor ? `&cursor=${cursor}` : "";
			const res = await callApi("GET", `/users/me/activity?limit=2${query}`, {
				user: auth,
			});
			expect(res.status).toBe(200);
			const body = res.body as {
				items: { text: string }[];
				nextCursor: string | null;
				hasMore: boolean;
			};
			texts.push(...body.items.map((item) => item.text));
			if (!body.hasMore) break;
			cursor = body.nextCursor;
		}

		expect(texts).toEqual(["활동 4", "활동 3", "활동 2", "활동 1", "활동 0"]);
	});
});
