import { describe, expect, test } from "bun:test";
import { normalizeMarketSearchParams } from "@/components/market/v2/data/search-params";

describe("마켓 주소창 쿼리의 그룹·멤버", () => {
	test("groupId와 artistId를 읽는다 (상품 상세의 태그 칩이 이 주소로 온다)", () => {
		const filters = normalizeMarketSearchParams({
			groupId: "group-1",
			artistId: "artist-1",
		});

		expect(filters).toMatchObject({
			groupId: "group-1",
			artistId: "artist-1",
		});
	});

	test("없거나 빈 값이면 null이고, 같은 키가 여러 번 있으면 첫 값을 쓴다", () => {
		expect(normalizeMarketSearchParams({})).toMatchObject({
			groupId: null,
			artistId: null,
		});
		expect(
			normalizeMarketSearchParams({ groupId: "", artistId: "" }),
		).toMatchObject({ groupId: null, artistId: null });
		expect(
			normalizeMarketSearchParams({ groupId: ["group-1", "group-2"] }),
		).toMatchObject({ groupId: "group-1" });
	});

	test("그룹·멤버는 다른 필터와 함께 읽힌다", () => {
		const filters = normalizeMarketSearchParams({
			groupId: "group-1",
			status: "sold",
			condition: "good",
			negotiable: "true",
			keyword: "포카",
		});

		expect(filters).toMatchObject({
			groupId: "group-1",
			artistId: null,
			status: "sold",
			condition: "good",
			negotiable: true,
			keyword: "포카",
		});
	});
});
