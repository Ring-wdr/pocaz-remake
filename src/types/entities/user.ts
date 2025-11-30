/**
 * User Entity Types
 *
 * Prisma User 모델을 기반으로 한 사용자 관련 타입 정의
 */

import type { ActivityModel, UserModel } from "@/generated/prisma/models";

/** 현재 로그인 사용자 정보 */
export interface CurrentUser {
	id: UserModel["id"];
	email: UserModel["email"];
	nickname: UserModel["nickname"];
	profileImage: UserModel["profileImage"];
}

/** 사용자 프로필 정보 */
export interface UserProfile extends CurrentUser {
	score: UserModel["score"];
	createdAt: UserModel["createdAt"];
}

/** Activity 타입 (Prisma 스키마의 type 필드와 동기화) */
export type ActivityType = "post" | "like" | "comment" | "trade" | "market";

/** Activity 대상 타입 */
export type ActivityTargetType = "post" | "market" | "transaction";

/** 활동 내역 아이템 */
export interface ActivityItem {
	id: ActivityModel["id"];
	type: ActivityType;
	description: ActivityModel["description"];
	targetId: ActivityModel["targetId"];
	targetType: ActivityTargetType;
	createdAt: ActivityModel["createdAt"];
}
