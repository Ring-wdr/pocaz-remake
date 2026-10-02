import { describe, expect, test } from "bun:test";
import {
	formatMarketTraits,
	getMarketConditionLabel,
	isMarketCondition,
	marketConditionOptions,
} from "@/components/market/market-condition";

describe("상품 상태 라벨", () => {
	test("선택지는 새 상품부터 사용감 있음까지 정해진 순서다", () => {
		expect(marketConditionOptions).toEqual([
			{ id: "new", name: "새 상품" },
			{ id: "like-new", name: "거의 새것" },
			{ id: "good", name: "사용감 적음" },
			{ id: "used", name: "사용감 있음" },
		]);
	});

	test("알려진 값만 상태로 인정하고, 없거나 모르는 값은 라벨이 없다", () => {
		expect(isMarketCondition("like-new")).toBe(true);
		expect(isMarketCondition("mint")).toBe(false);
		expect(isMarketCondition("toString")).toBe(false);
		expect(getMarketConditionLabel("used")).toBe("사용감 있음");
		expect(getMarketConditionLabel("mint")).toBeNull();
		expect(getMarketConditionLabel(null)).toBeNull();
		expect(getMarketConditionLabel(undefined)).toBeNull();
	});
});

describe("목록 카드의 상태·협상 문구", () => {
	test("둘 다 있으면 가운뎃점으로 잇는다", () => {
		expect(
			formatMarketTraits({ condition: "like-new", isNegotiable: true }),
		).toBe("거의 새것 · 협상 가능");
	});

	test("하나만 있으면 그것만 보여 준다", () => {
		expect(formatMarketTraits({ condition: "new", isNegotiable: false })).toBe(
			"새 상품",
		);
		expect(formatMarketTraits({ condition: null, isNegotiable: true })).toBe(
			"협상 가능",
		);
	});

	test("둘 다 없으면 null이라 줄을 그리지 않는다", () => {
		expect(
			formatMarketTraits({ condition: null, isNegotiable: false }),
		).toBeNull();
		expect(
			formatMarketTraits({ condition: "mint", isNegotiable: false }),
		).toBeNull();
	});
});
