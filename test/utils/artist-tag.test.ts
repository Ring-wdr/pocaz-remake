import { describe, expect, test } from "bun:test";
import {
	formatArtistTag,
	getArtistTagHref,
} from "@/components/market/artist-tag";

const group = { id: "group-1", name: "르세라핌" };
const artist = { id: "artist-1", name: "김채원" };

describe("상품의 그룹·멤버 태그 문구", () => {
	test("그룹과 멤버가 있으면 가운뎃점으로 잇는다", () => {
		expect(formatArtistTag({ group, artist })).toBe("르세라핌 · 김채원");
	});

	test("멤버가 없으면 그룹만, 그룹이 없으면 멤버만 보여 준다", () => {
		expect(formatArtistTag({ group, artist: null })).toBe("르세라핌");
		expect(formatArtistTag({ group: null, artist })).toBe("김채원");
	});

	test("둘 다 없으면 null이라 칩을 그리지 않는다", () => {
		expect(formatArtistTag({ group: null, artist: null })).toBeNull();
	});
});

describe("태그 칩의 목록 링크", () => {
	test("그룹과 멤버로 거른 마켓 목록으로 간다", () => {
		expect(getArtistTagHref({ group, artist })).toBe(
			"/market?groupId=group-1&artistId=artist-1",
		);
	});

	test("멤버가 없으면 그룹만, 그룹이 없으면 멤버만 거른다", () => {
		expect(getArtistTagHref({ group, artist: null })).toBe(
			"/market?groupId=group-1",
		);
		expect(getArtistTagHref({ group: null, artist })).toBe(
			"/market?artistId=artist-1",
		);
	});

	test("태그가 없으면 링크도 없다", () => {
		expect(getArtistTagHref({ group: null, artist: null })).toBeNull();
	});
});
