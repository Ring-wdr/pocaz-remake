import type { MarketStatus } from "@/types/entities";

/** 상품 상태를 화면에 보여 줄 한국어 이름. 판매 상태 선택지의 순서이기도 하다 */
export const marketStatusLabels: Record<MarketStatus, string> = {
	available: "판매중",
	reserved: "예약중",
	sold: "판매완료",
};

/** API가 문자열로 내려 주는 status가 알려진 상품 상태인지 확인한다 */
export function isMarketStatus(value: string): value is MarketStatus {
	return Object.hasOwn(marketStatusLabels, value);
}

/** 상품 status의 한국어 라벨. 모르는 값은 감추지 않고 그대로 돌려준다 */
export function getMarketStatusLabel(status: string): string {
	return isMarketStatus(status) ? marketStatusLabels[status] : status;
}
