import { beforeEach, describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";
import { createUser, hasTestDb, resetDb } from "../helpers/db";

const MIGRATIONS_DIR = join(import.meta.dir, "../../prisma/migrations");
const START_MARKER = "-- backfill:start";
const END_MARKER = "-- backfill:end";

/**
 * add_market_condition 마이그레이션에서 backfill:start ~ backfill:end 사이의 SQL을
 * 세미콜론 기준 문장으로 나눠 순서대로 꺼낸다 (주석 줄은 뺀다).
 */
function readBackfillStatements() {
	const folder = readdirSync(MIGRATIONS_DIR).find((name) =>
		name.endsWith("_add_market_condition"),
	);
	if (!folder) throw new Error("add_market_condition 마이그레이션이 없습니다.");
	const sql = readFileSync(
		join(MIGRATIONS_DIR, folder, "migration.sql"),
		"utf8",
	);

	const start = sql.indexOf(START_MARKER);
	const end = sql.indexOf(END_MARKER);
	if (start === -1 || end === -1 || end < start) {
		throw new Error("마이그레이션에 backfill 표시가 없습니다.");
	}

	return sql
		.slice(start + START_MARKER.length, end)
		.split("\n")
		.filter((line) => !line.trim().startsWith("--"))
		.join("\n")
		.split(";")
		.map((statement) => statement.trim())
		.filter((statement) => statement.length > 0);
}

async function runBackfill() {
	for (const statement of readBackfillStatements()) {
		await prisma.$executeRawUnsafe(statement);
	}
}

/** 옛 등록 폼이 설명 끝에 붙이던 꼬리표까지 포함한 설명 */
const withLegacyTag = (body: string, label: string, negotiable: string) =>
	`${body}\n\n---\n상태: ${label} · 가격 협상: ${negotiable}`;

async function fetchMarket(id: string) {
	return prisma.market.findUniqueOrThrow({ where: { id } });
}

describe.skipIf(!hasTestDb)("add_market_condition 백필", () => {
	let userId: string;

	const createMarket = (data: {
		title?: string;
		description: string | null;
		price?: number | null;
	}) =>
		prisma.market.create({
			data: {
				title: data.title ?? "포카",
				description: data.description,
				price: data.price === undefined ? 10000 : data.price,
				userId,
			},
		});

	beforeEach(async () => {
		await resetDb();
		userId = (await createUser("판매자")).user.id;
	});

	test("마이그레이션에 실행할 문장이 있다", () => {
		const statements = readBackfillStatements();

		expect(statements.length).toBeGreaterThan(0);
		for (const statement of statements) {
			expect(statement).toMatch(/^UPDATE "Market"/);
		}
	});

	test("꼬리표의 상태 라벨을 condition 값으로 옮기고 설명에서 지운다", async () => {
		const labels = [
			["새 상품", "new"],
			["거의 새것", "like-new"],
			["사용감 적음", "good"],
			["사용감 있음", "used"],
		] as const;
		const rows = [];
		for (const [label, condition] of labels) {
			const market = await createMarket({
				description: withLegacyTag(`${label} 포카예요`, label, "불가"),
			});
			rows.push({ id: market.id, label, condition });
		}

		await runBackfill();

		for (const { id, label, condition } of rows) {
			expect(await fetchMarket(id)).toMatchObject({
				condition,
				description: `${label} 포카예요`,
			});
		}
	});

	test("가격 협상 가능은 isNegotiable true, 불가는 false", async () => {
		const yes = await createMarket({
			description: withLegacyTag("협상 환영", "새 상품", "가능"),
		});
		const no = await createMarket({
			description: withLegacyTag("정가 판매", "새 상품", "불가"),
		});

		await runBackfill();

		expect((await fetchMarket(yes.id)).isNegotiable).toBe(true);
		expect((await fetchMarket(no.id)).isNegotiable).toBe(false);
	});

	test("여러 줄 설명과 본문 속 구분선은 두고 끝의 꼬리표만 지운다", async () => {
		const body = "첫 줄\n\n---\n둘째 단락\n\n상태: 좋아요\n마지막 줄";
		const market = await createMarket({
			description: withLegacyTag(body, "거의 새것", "가능"),
		});

		await runBackfill();

		expect(await fetchMarket(market.id)).toMatchObject({
			description: body,
			condition: "like-new",
			isNegotiable: true,
		});
	});

	test("가격이 없는 상품은 꼬리표가 불가여도, 꼬리표가 없어도 협상 가능으로 본다", async () => {
		const tagged = await createMarket({
			description: withLegacyTag("가격 문의", "사용감 적음", "불가"),
			price: null,
		});
		const plain = await createMarket({
			description: "꼬리표 없음",
			price: null,
		});
		const priced = await createMarket({
			description: "꼬리표 없음",
			price: 5000,
		});

		await runBackfill();

		expect(await fetchMarket(tagged.id)).toMatchObject({
			isNegotiable: true,
			condition: "good",
			description: "가격 문의",
		});
		expect(await fetchMarket(plain.id)).toMatchObject({
			isNegotiable: true,
			condition: null,
			description: "꼬리표 없음",
		});
		expect(await fetchMarket(priced.id)).toMatchObject({
			isNegotiable: false,
			condition: null,
			description: "꼬리표 없음",
		});
	});

	test("상태 미입력 꼬리표는 condition을 비워 두고 꼬리표만 지운다", async () => {
		const market = await createMarket({
			description: withLegacyTag("상태를 안 적음", "상태 미입력", "가능"),
		});

		await runBackfill();

		expect(await fetchMarket(market.id)).toMatchObject({
			condition: null,
			isNegotiable: true,
			description: "상태를 안 적음",
		});
	});

	test("끝에 있지 않거나 형식이 다른 꼬리표는 건드리지 않는다", async () => {
		const middle = `앞\n\n---\n상태: 새 상품 · 가격 협상: 가능\n\n뒤`;
		const unknownLabel = withLegacyTag("본문", "최상급", "가능");
		const noNegotiable = "본문\n\n---\n상태: 새 상품";
		const rows = [middle, unknownLabel, noNegotiable];
		const ids: string[] = [];
		for (const description of rows) {
			ids.push((await createMarket({ description })).id);
		}

		await runBackfill();

		for (const [index, id] of ids.entries()) {
			expect(await fetchMarket(id)).toMatchObject({
				description: rows[index],
				condition: null,
				isNegotiable: false,
			});
		}
	});

	test("이미 필드가 채워진 상품과 설명이 없는 상품은 그대로다", async () => {
		const structured = await prisma.market.create({
			data: {
				title: "새 방식",
				description: "꼬리표 없는 설명",
				price: 3000,
				condition: "good",
				isNegotiable: true,
				userId,
			},
		});
		const noDescription = await createMarket({ description: null });

		await runBackfill();

		expect(await fetchMarket(structured.id)).toMatchObject({
			description: "꼬리표 없는 설명",
			condition: "good",
			isNegotiable: true,
		});
		expect(await fetchMarket(noDescription.id)).toMatchObject({
			description: null,
			condition: null,
			isNegotiable: false,
		});
	});

	test("수정 시각은 바꾸지 않고, 두 번 실행해도 결과가 같다", async () => {
		const market = await createMarket({
			description: withLegacyTag("본문", "사용감 있음", "가능"),
		});
		const before = await fetchMarket(market.id);

		await runBackfill();
		const once = await fetchMarket(market.id);
		await runBackfill();
		const twice = await fetchMarket(market.id);

		expect(once.updatedAt).toEqual(before.updatedAt);
		expect(once).toMatchObject({
			description: "본문",
			condition: "used",
			isNegotiable: true,
		});
		expect(twice).toEqual(once);
	});
});
