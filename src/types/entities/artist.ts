/**
 * Artist Entity Types
 *
 * Prisma ArtistGroup·Artist 모델을 기반으로, 상품에 태그하거나 목록·폼에서 고르는 그룹·멤버의 최소 정보
 */

import type { ArtistModel } from "@/generated/prisma/models";

/** 그룹이나 멤버 하나. 이름은 한국어 활동명이다 */
export type ArtistTag = Pick<ArtistModel, "id" | "name">;

/** 멤버 목록을 함께 든 그룹. 상품 등록·수정 폼의 선택지로 쓴다 */
export interface ArtistCatalogGroup extends ArtistTag {
	artists: ArtistTag[];
}
