/**
 * Market Entity Types
 *
 * Prisma MarketModel을 기반으로 한 마켓 관련 타입 정의
 */

import type { MarketImageModel, MarketModel } from "@/generated/prisma/models";

/** Market 상태 타입 (Prisma 스키마의 status 필드와 동기화) */
export type MarketStatus = "available" | "sold" | "reserved";

/** Market 기본 정보 (목록, 미리보기용) */
export interface MarketSummary {
	id: MarketModel["id"];
	title: MarketModel["title"];
	price: MarketModel["price"];
	thumbnail: MarketImageModel["imageUrl"] | null;
}

/** Market 상세 정보 */
export interface MarketDetail extends MarketSummary {
	description: MarketModel["description"];
	status: MarketStatus;
	createdAt: MarketModel["createdAt"];
	updatedAt: MarketModel["updatedAt"];
	userId: MarketModel["userId"];
	images: Array<Pick<MarketImageModel, "id" | "imageUrl">>;
}

/** Market with User 정보 (판매자 정보 포함) */
export interface MarketWithSeller extends MarketDetail {
	user: {
		id: string;
		nickname: string;
		profileImage: string | null;
	};
}

/** Market API 응답 아이템 (목록/상세 공통) */
export interface MarketItem {
	id: string;
	title: string;
	description: string | null;
	price: number | null;
	status: string;
	createdAt: string;
	user: {
		id: string;
		nickname: string;
		profileImage: string | null;
	};
	images: Array<{ id: string; imageUrl: string }>;
}
