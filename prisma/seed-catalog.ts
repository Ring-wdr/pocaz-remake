import { prisma } from "@/lib/prisma";

/**
 * 시드할 카탈로그 한 줄: 소속사 → 그룹 → 멤버. 이름은 한국어 활동명이다.
 * 명단의 출처는 docs/short-term-ux-plan.md의 "시드 카탈로그"이고, 운영 DB에 넣기 전에 사람이 한 번 확인한다.
 */
export interface CatalogEntry {
	agency: string;
	group: string;
	members: string[];
}

export const catalog: CatalogEntry[] = [
	{
		agency: "하이브(빅히트 뮤직)",
		group: "방탄소년단",
		members: ["RM", "진", "슈가", "제이홉", "지민", "뷔", "정국"],
	},
	{
		agency: "하이브(빅히트 뮤직)",
		group: "투모로우바이투게더",
		members: ["수빈", "연준", "범규", "태현", "휴닝카이"],
	},
	{
		agency: "쏘스뮤직",
		group: "르세라핌",
		members: ["사쿠라", "김채원", "허윤진", "카즈하", "홍은채"],
	},
	{
		agency: "어도어",
		group: "뉴진스",
		members: ["민지", "하니", "다니엘", "해린", "혜인"],
	},
	{
		agency: "빌리프랩",
		group: "엔하이픈",
		members: ["정원", "희승", "제이", "제이크", "성훈", "선우", "니키"],
	},
	{
		agency: "플레디스",
		group: "세븐틴",
		members: [
			"에스쿱스",
			"정한",
			"조슈아",
			"준",
			"호시",
			"원우",
			"우지",
			"디에잇",
			"민규",
			"도겸",
			"승관",
			"버논",
			"디노",
		],
	},
	{
		agency: "KOZ 엔터테인먼트",
		group: "보이넥스트도어",
		members: ["성호", "리우", "명재현", "태산", "이한", "운학"],
	},
	{
		agency: "원헌드레드",
		group: "더보이즈",
		members: [
			"상연",
			"제이콥",
			"영훈",
			"현재",
			"주연",
			"케빈",
			"뉴",
			"큐",
			"주학년",
			"선우",
			"에릭",
		],
	},
	{
		agency: "SM 엔터테인먼트",
		group: "에스파",
		members: ["카리나", "지젤", "윈터", "닝닝"],
	},
	{
		agency: "SM 엔터테인먼트",
		group: "라이즈",
		members: ["쇼타로", "은석", "성찬", "원빈", "소희", "앤톤"],
	},
	{
		agency: "SM 엔터테인먼트",
		group: "레드벨벳",
		members: ["아이린", "슬기", "웬디", "조이", "예리"],
	},
	{
		agency: "JYP 엔터테인먼트",
		group: "스트레이 키즈",
		members: ["방찬", "리노", "창빈", "현진", "한", "필릭스", "승민", "아이엔"],
	},
	{
		agency: "JYP 엔터테인먼트",
		group: "트와이스",
		members: [
			"나연",
			"정연",
			"모모",
			"사나",
			"지효",
			"미나",
			"다현",
			"채영",
			"쯔위",
		],
	},
	{
		agency: "JYP 엔터테인먼트",
		group: "있지",
		members: ["예지", "리아", "류진", "채령", "유나"],
	},
	{
		agency: "JYP 엔터테인먼트",
		group: "엔믹스",
		members: ["해원", "릴리", "설윤", "배이", "지우", "규진"],
	},
	{
		agency: "YG 엔터테인먼트",
		group: "블랙핑크",
		members: ["지수", "제니", "로제", "리사"],
	},
	{
		agency: "YG 엔터테인먼트",
		group: "베이비몬스터",
		members: ["루카", "파리타", "아사", "아현", "라미", "로라", "치키타"],
	},
	{
		agency: "스타쉽 엔터테인먼트",
		group: "아이브",
		members: ["안유진", "가을", "레이", "장원영", "리즈", "이서"],
	},
	{
		agency: "큐브 엔터테인먼트",
		group: "아이들",
		members: ["미연", "민니", "소연", "우기", "슈화"],
	},
	{
		agency: "S2 엔터테인먼트",
		group: "키스오브라이프",
		members: ["쥴리", "나띠", "벨", "하늘"],
	},
];

/**
 * 이번 실행에서 새로 만든 행 수. 이미 있던 행은 세지 않는다
 */
export interface SeedCatalogResult {
	agencies: number;
	groups: number;
	artists: number;
}

/**
 * 소속사 → 그룹 → 멤버를 이름 기준으로 채운다. 이름에 unique 제약이 없어 `findFirst`로 찾고 없을 때만 만든다.
 * 그래서 여러 번 실행해도 결과가 같고, 이미 있는 행은 지우지 않는다.
 * - 같은 이름의 행이 여럿이면 가장 먼저 만든 것을 쓴다.
 * - 멤버는 그룹 안에서만 이름을 비교한다(엔하이픈과 더보이즈에 모두 "선우"가 있다).
 * - 이미 있는 그룹이 다른 소속사에 걸려 있거나 소속사가 없으면 명단의 소속사로 맞춘다.
 * 트랜잭션으로 묶지 않는다. 중간에 멈춰도 다시 실행하면 이어서 채운다.
 */
export async function seedCatalog(db = prisma): Promise<SeedCatalogResult> {
	const created: SeedCatalogResult = { agencies: 0, groups: 0, artists: 0 };

	for (const entry of catalog) {
		let agency = await db.agency.findFirst({
			where: { name: entry.agency },
			orderBy: { createdAt: "asc" },
		});
		if (!agency) {
			agency = await db.agency.create({ data: { name: entry.agency } });
			created.agencies += 1;
		}

		let group = await db.artistGroup.findFirst({
			where: { name: entry.group },
			orderBy: { createdAt: "asc" },
		});
		if (!group) {
			group = await db.artistGroup.create({
				data: { name: entry.group, agencyId: agency.id },
			});
			created.groups += 1;
		} else if (group.agencyId !== agency.id) {
			group = await db.artistGroup.update({
				where: { id: group.id },
				data: { agencyId: agency.id },
			});
		}

		const existing = await db.artist.findMany({
			where: { groupId: group.id },
			select: { name: true },
		});
		const existingNames = new Set(existing.map((artist) => artist.name));
		const missing = entry.members.filter((name) => !existingNames.has(name));
		if (missing.length > 0) {
			await db.artist.createMany({
				data: missing.map((name) => ({ name, groupId: group.id })),
			});
			created.artists += missing.length;
		}
	}

	return created;
}

// `bun run db:seed:catalog`로 직접 실행했을 때만 돈다. 테스트가 불러올 때는 실행하지 않는다.
if (import.meta.main) {
	seedCatalog()
		.then((created) => {
			console.log(
				`카탈로그 시드 완료: 소속사 ${created.agencies}곳, 그룹 ${created.groups}개, 아티스트 ${created.artists}명을 새로 만들었습니다.`,
			);
		})
		.catch((error) => {
			console.error("카탈로그 시드 실패", error);
			process.exitCode = 1;
		})
		.finally(() => prisma.$disconnect());
}
