import { Elysia, t } from "elysia";
import { authGuard } from "@/lib/elysia/auth";
import { LimitQuery } from "@/lib/elysia/schemas";
import { notificationService } from "@/lib/services/notification";
import { userService } from "@/lib/services/user";

// 공통 스키마
const ErrorSchema = t.Object({
	error: t.String(),
});

const NotificationItemSchema = t.Object({
	id: t.String(),
	// comment | like | chat | market | trade | review
	type: t.String(),
	title: t.String(),
	body: t.Nullable(t.String()),
	// 눌렀을 때 이동할 앱 안 경로
	href: t.Nullable(t.String()),
	// 읽은 시각. null이면 안 읽은 알림
	readAt: t.Nullable(t.String()),
	createdAt: t.String(),
});

const PaginatedNotificationsSchema = t.Object({
	items: t.Array(NotificationItemSchema),
	nextCursor: t.Nullable(t.String()),
	hasMore: t.Boolean(),
});

/**
 * Notification Routes (모두 인증 필수)
 */
export const notificationRoutes = new Elysia({ prefix: "/notifications" })
	.use(authGuard)
	// GET /api/notifications - 내 알림 목록
	.get(
		"/",
		async ({ auth, query }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				return { items: [], nextCursor: null, hasMore: false };
			}

			const result = await notificationService.list(user.id, {
				cursor: query.cursor,
				limit: query.limit ?? 20,
			});

			return {
				items: result.items.map((notification) => ({
					id: notification.id,
					type: notification.type,
					title: notification.title,
					body: notification.body,
					href: notification.href,
					readAt: notification.readAt?.toISOString() ?? null,
					createdAt: notification.createdAt.toISOString(),
				})),
				nextCursor: result.nextCursor,
				hasMore: result.hasMore,
			};
		},
		{
			query: t.Object({
				cursor: t.Optional(t.String()),
				limit: LimitQuery,
			}),
			response: {
				200: PaginatedNotificationsSchema,
				401: ErrorSchema,
			},
			detail: {
				tags: ["Notifications"],
				summary: "내 알림 목록 조회",
				description:
					"내 알림을 최신순으로 페이지네이션하여 조회합니다. nextCursor를 cursor로 보내면 다음 페이지를 받습니다.",
			},
		},
	)
	// GET /api/notifications/unread-count - 안 읽은 알림 수 (/:id/... 라우트보다 먼저 둔다)
	.get(
		"/unread-count",
		async ({ auth }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				return { count: 0 };
			}

			return { count: await notificationService.unreadCount(user.id) };
		},
		{
			response: {
				200: t.Object({ count: t.Number() }),
				401: ErrorSchema,
			},
			detail: {
				tags: ["Notifications"],
				summary: "안 읽은 알림 수 조회",
				description: "읽지 않은 알림의 수를 조회합니다 (종 아이콘 뱃지용).",
			},
		},
	)
	// POST /api/notifications/read-all - 모두 읽음 처리
	.post(
		"/read-all",
		async ({ auth, status }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				return status(401, { error: "User not found" });
			}

			return { updated: await notificationService.markAllRead(user.id) };
		},
		{
			response: {
				200: t.Object({ updated: t.Number() }),
				401: ErrorSchema,
			},
			detail: {
				tags: ["Notifications"],
				summary: "알림 모두 읽음 처리",
				description:
					"안 읽은 알림을 모두 읽음 처리하고, 바뀐 알림 수(updated)를 돌려줍니다.",
			},
		},
	)
	// PATCH /api/notifications/:id/read - 알림 읽음 처리
	.patch(
		"/:id/read",
		async ({ auth, params, status }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				return status(401, { error: "User not found" });
			}

			const readAt = await notificationService.markRead(user.id, params.id);
			// 남의 알림은 없는 알림과 똑같이 404로 답해 존재 여부를 알려 주지 않는다
			if (!readAt) {
				return status(404, { error: "Notification not found" });
			}

			return { id: params.id, readAt: readAt.toISOString() };
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: t.Object({ id: t.String(), readAt: t.String() }),
				401: ErrorSchema,
				404: ErrorSchema,
			},
			detail: {
				tags: ["Notifications"],
				summary: "알림 읽음 처리",
				description:
					"알림 하나를 읽음 처리합니다. 이미 읽은 알림은 처음 읽은 시각을 그대로 돌려줍니다. 없는 알림이나 남의 알림은 404입니다.",
			},
		},
	);
