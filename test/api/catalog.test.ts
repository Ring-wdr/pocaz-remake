import { beforeEach, describe, expect, test } from "bun:test";
import { prisma } from "@/lib/prisma";
import { callApi, type TestUser } from "../helpers/api";
import { hasTestDb, resetDb } from "../helpers/db";

const member: TestUser = { id: "member-1", email: "member@example.com" };
const admin: TestUser = {
	id: "admin-1",
	email: "admin@example.com",
	app_metadata: { role: "admin" },
};

// 카탈로그(소속사·그룹·아티스트·포토카드·갈망포카) 쓰기는 관리자만 한다.
const writes: [string, string, unknown][] = [
	["POST", "/agencies", { name: "새 소속사" }],
	["PUT", "/agencies/any-id", { name: "이름 변경" }],
	["DELETE", "/agencies/any-id", undefined],
	["POST", "/groups", { name: "새 그룹" }],
	["DELETE", "/groups/any-id", undefined],
	["POST", "/artists", { name: "새 아티스트" }],
	["DELETE", "/artists/any-id", undefined],
	["POST", "/photocards", { name: "새 포카" }],
	["DELETE", "/photocards/any-id", undefined],
	["POST", "/galmang-poca", { photocardId: "any-id" }],
	["DELETE", "/galmang-poca/any-id", undefined],
];

describe("카탈로그 쓰기 권한", () => {
	for (const [method, path, body] of writes) {
		test(`${method} ${path}: 비로그인 401, 일반 회원 403`, async () => {
			expect((await callApi(method, path, { body })).status).toBe(401);
			expect((await callApi(method, path, { user: member, body })).status).toBe(
				403,
			);
		});
	}

	test("사용자가 바꿀 수 있는 user_metadata의 role은 인정하지 않는다", async () => {
		const res = await callApi("POST", "/agencies", {
			user: { ...member, user_metadata: { role: "admin" } as never },
			body: { name: "x" },
		});
		expect(res.status).toBe(403);
	});
});

describe.skipIf(!hasTestDb)("관리자 카탈로그 쓰기", () => {
	beforeEach(resetDb);

	test("관리자는 소속사를 만들 수 있다", async () => {
		const res = await callApi("POST", "/agencies", {
			user: admin,
			body: { name: "관리자 소속사" },
		});

		expect(res.status).toBe(201);
		expect(await prisma.agency.count()).toBe(1);
	});
});
