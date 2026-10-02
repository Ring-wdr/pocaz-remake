import { beforeEach, describe, expect, test } from "bun:test";
import { prisma } from "@/lib/prisma";
import { catalog, seedCatalog } from "../../prisma/seed-catalog";
import { hasTestDb, resetDb } from "../helpers/db";

// docs/short-term-ux-plan.md "시드 카탈로그" 명단의 규모: 소속사 13곳, 그룹 20개, 멤버 128명.
// 명단을 고치면 이 숫자도 같이 고친다.
const LISTED = { agencies: 13, groups: 20, artists: 128 };

async function countRows() {
	const [agencies, groups, artists] = await Promise.all([
		prisma.agency.count(),
		prisma.artistGroup.count(),
		prisma.artist.count(),
	]);
	return { agencies, groups, artists };
}

async function membersOf(groupName: string) {
	const artists = await prisma.artist.findMany({
		where: { group: { name: groupName } },
		select: { name: true },
	});
	return artists.map((artist) => artist.name).sort();
}

test("명단의 규모가 문서와 같다", () => {
	expect(catalog).toHaveLength(LISTED.groups);
	expect(new Set(catalog.map((entry) => entry.agency)).size).toBe(
		LISTED.agencies,
	);
	expect(catalog.flatMap((entry) => entry.members)).toHaveLength(
		LISTED.artists,
	);
	// 같은 그룹이 두 줄로 나뉘어 있지 않다
	expect(new Set(catalog.map((entry) => entry.group)).size).toBe(
		catalog.length,
	);
});

describe.skipIf(!hasTestDb)("seedCatalog", () => {
	beforeEach(resetDb);

	test("두 번 실행해도 소속사·그룹·아티스트 행 수가 같고 명단과 일치한다", async () => {
		const first = await seedCatalog();
		const afterFirst = await countRows();
		const second = await seedCatalog();
		const afterSecond = await countRows();

		expect(first).toEqual(LISTED);
		expect(afterFirst).toEqual(LISTED);
		// 두 번째는 새로 만든 것이 없다
		expect(second).toEqual({ agencies: 0, groups: 0, artists: 0 });
		expect(afterSecond).toEqual(afterFirst);
	});

	test("그룹은 소속사에, 멤버는 그룹에 이어진다", async () => {
		await seedCatalog();

		const lesserafim = await prisma.artistGroup.findFirstOrThrow({
			where: { name: "르세라핌" },
			include: { agency: true },
		});
		expect(lesserafim.agency?.name).toBe("쏘스뮤직");
		expect(await membersOf("르세라핌")).toEqual(
			["사쿠라", "김채원", "허윤진", "카즈하", "홍은채"].sort(),
		);

		// 한 소속사 아래 여러 그룹
		const sm = await prisma.agency.findFirstOrThrow({
			where: { name: "SM 엔터테인먼트" },
			include: { groups: true },
		});
		expect(sm.groups.map((group) => group.name).sort()).toEqual(
			["에스파", "라이즈", "레드벨벳"].sort(),
		);
		const hybe = await prisma.agency.findFirstOrThrow({
			where: { name: "하이브(빅히트 뮤직)" },
			include: { groups: true },
		});
		expect(hybe.groups.map((group) => group.name).sort()).toEqual(
			["방탄소년단", "투모로우바이투게더"].sort(),
		);
		expect(await prisma.artist.count({ where: { groupId: null } })).toBe(0);
	});

	test("다른 그룹의 같은 이름 멤버는 따로 만든다", async () => {
		await seedCatalog();

		const sunwoo = await prisma.artist.findMany({
			where: { name: "선우" },
			include: { group: true },
		});

		expect(sunwoo.map((artist) => artist.group?.name).sort()).toEqual(
			["더보이즈", "엔하이픈"].sort(),
		);
	});

	test("이미 있는 행은 지우지 않고 빠진 멤버만 채운다", async () => {
		await seedCatalog();
		await prisma.artist.deleteMany({ where: { name: "김채원" } });
		const lesserafim = await prisma.artistGroup.findFirstOrThrow({
			where: { name: "르세라핌" },
		});
		await prisma.artist.create({
			data: { name: "관리자가 추가한 멤버", groupId: lesserafim.id },
		});
		await prisma.artistGroup.create({ data: { name: "관리자가 만든 그룹" } });

		const again = await seedCatalog();

		expect(again).toEqual({ agencies: 0, groups: 0, artists: 1 });
		expect(await membersOf("르세라핌")).toEqual(
			[
				"사쿠라",
				"김채원",
				"허윤진",
				"카즈하",
				"홍은채",
				"관리자가 추가한 멤버",
			].sort(),
		);
		expect(await prisma.artistGroup.count()).toBe(LISTED.groups + 1);
		expect(await prisma.artist.count()).toBe(LISTED.artists + 1);
	});

	test("이름이 같은 그룹이 이미 있으면 새로 만들지 않고 그 그룹을 쓰며 소속사를 맞춘다", async () => {
		const existing = await prisma.artistGroup.create({
			data: { name: "뉴진스" },
		});

		const result = await seedCatalog();

		expect(result.groups).toBe(LISTED.groups - 1);
		const groups = await prisma.artistGroup.findMany({
			where: { name: "뉴진스" },
			include: { agency: true },
		});
		expect(groups).toHaveLength(1);
		expect(groups[0].id).toBe(existing.id);
		expect(groups[0].agency?.name).toBe("어도어");
		expect(await membersOf("뉴진스")).toHaveLength(5);
	});
});
