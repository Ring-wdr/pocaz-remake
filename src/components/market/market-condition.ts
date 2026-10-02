import type { MarketCondition } from "@/types/entities";

/** 상품 상태를 화면에 보여 줄 한국어 이름. 등록 폼과 필터 선택지의 순서이기도 하다 */
export const marketConditionLabels: Record<MarketCondition, string> = {
	new: "새 상품",
	"like-new": "거의 새것",
	good: "사용감 적음",
	used: "사용감 있음",
};

/** 선택지 순서대로 늘어놓은 상품 상태 목록 */
export const marketConditionOptions = (
	Object.entries(marketConditionLabels) as [MarketCondition, string][]
).map(([id, name]) => ({ id, name }));

/** 협상 가능한 상품에 붙이는 문구 */
export const negotiableLabel = "협상 가능";

/** API가 내려 주는 condition 문자열이 알려진 상품 상태인지 확인한다 */
export function isMarketCondition(value: string): value is MarketCondition {
	return Object.hasOwn(marketConditionLabels, value);
}

/** 상품 상태의 한국어 라벨. 값이 없거나 모르는 값이면 null */
export function getMarketConditionLabel(
	condition: string | null | undefined,
): string | null {
	return condition && isMarketCondition(condition)
		? marketConditionLabels[condition]
		: null;
}

/** 목록 카드에서 가격 옆에 보여 줄 한 줄 요약 ("거의 새것 · 협상 가능"). 둘 다 없으면 null */
export function formatMarketTraits({
	condition,
	isNegotiable,
}: {
	condition: string | null | undefined;
	isNegotiable: boolean;
}): string | null {
	const traits = [
		getMarketConditionLabel(condition),
		isNegotiable ? negotiableLabel : null,
	].filter((trait) => trait !== null);
	return traits.length > 0 ? traits.join(" · ") : null;
}
