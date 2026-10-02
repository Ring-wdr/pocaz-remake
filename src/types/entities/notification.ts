/**
 * Notification Entity Types
 *
 * API 스키마 기반 알림 관련 타입 정의
 * @see src/lib/elysia/routes/notifications.ts
 * @see src/lib/elysia/routes/users.ts (알림 설정)
 */

/** 알림함 항목 (API NotificationItemSchema 기반) */
export interface NotificationItem {
	id: string;
	/** comment | like | chat | market | trade | review. API는 문자열로 내려주므로 모르는 값도 올 수 있다 */
	type: string;
	title: string;
	body: string | null;
	/** 눌렀을 때 이동할 앱 안 경로. 없으면 이동하지 않는다 */
	href: string | null;
	/** 읽은 시각. null이면 안 읽은 알림 */
	readAt: string | null;
	createdAt: string;
}

/** 페이지네이션된 알림 응답 (API PaginatedNotificationsSchema 기반) */
export interface PaginatedNotifications {
	items: NotificationItem[];
	nextCursor: string | null;
	hasMore: boolean;
}

/** 사용자가 켜고 끌 수 있는 알림 종류. 후기(review) 알림은 거래(trade)를 따른다 */
export type NotificationSettingKey =
	| "chat"
	| "like"
	| "comment"
	| "market"
	| "trade";

/** 알림 설정 (API NotificationSettingsSchema 기반). 항상 모든 키가 들어 있다 */
export type NotificationSettings = Record<NotificationSettingKey, boolean>;
