import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { TestUser } from "./api";

export const hasTestDb = Boolean(process.env.TEST_DATABASE_URL);

/**
 * public 스키마의 모든 테이블을 비운다. 이름에 "test"가 들어간 DB에서만 동작한다.
 */
export async function resetDb() {
	const url = process.env.TEST_DATABASE_URL;
	if (!url || !new URL(url).pathname.toLowerCase().includes("test")) {
		throw new Error(
			"resetDb는 이름에 'test'가 들어간 TEST_DATABASE_URL에서만 실행할 수 있습니다.",
		);
	}
	const tables = await prisma.$queryRaw<{ tablename: string }[]>`
		SELECT tablename FROM pg_tables
		WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
	`;
	if (tables.length === 0) return;
	const list = tables.map(({ tablename }) => `"${tablename}"`).join(", ");
	await prisma.$executeRawUnsafe(`TRUNCATE ${list} CASCADE`);
}

/**
 * Prisma User와, 같은 사용자로 API를 호출할 때 쓸 인증 정보를 함께 만든다.
 */
export async function createUser(nickname = "tester") {
	const auth: TestUser = {
		id: randomUUID(),
		email: `${randomUUID()}@example.com`,
	};
	const user = await prisma.user.create({
		data: { supabaseId: auth.id, email: auth.email, nickname },
	});
	return { user, auth };
}
