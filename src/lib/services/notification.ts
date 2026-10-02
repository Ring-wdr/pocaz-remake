import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { MarketStatus } from "@/lib/services/market";

// ==============================================
// 종류와 설정
// ==============================================

/**
 * 알림 종류. Notification.type에 그대로 저장한다.
 */
export type NotificationType =
	| "comment"
	| "like"
	| "chat"
	| "market"
	| "trade"
	| "review";

/**
 * 사용자가 켜고 끌 수 있는 알림 설정 키. 모두 기본으로 켜져 있다.
 */
const SETTING_KEYS = ["chat", "like", "comment", "market", "trade"] as const;
export type NotificationSettingKey = (typeof SETTING_KEYS)[number];
export type NotificationSettings = Record<NotificationSettingKey, boolean>;

const DEFAULT_SETTINGS: NotificationSettings = {
	chat: true,
	like: true,
	comment: true,
	market: true,
	trade: true,
};

/**
 * 알림 종류별로 따르는 설정 키. 후기(review)는 거래(trade) 설정을 따른다.
 */
const SETTING_KEY_OF_TYPE: Record<NotificationType, NotificationSettingKey> = {
	comment: "comment",
	like: "like",
	chat: "chat",
	market: "market",
	trade: "trade",
	review: "trade",
};

/**
 * User.notificationSettings(JSON)에서 알려진 키의 불리언 값만 꺼내 기본값 위에 덮는다.
 * 모르는 키와 불리언이 아닌 값은 무시하므로, 저장된 값이 어떤 모양이어도 항상 다섯 키가 모두 채워진다.
 */
function resolveSettings(
	stored: Prisma.JsonValue | null | undefined,
): NotificationSettings {
	const settings = { ...DEFAULT_SETTINGS };
	if (stored && typeof stored === "object" && !Array.isArray(stored)) {
		for (const key of SETTING_KEYS) {
			const value = stored[key];
			if (typeof value === "boolean") settings[key] = value;
		}
	}
	return settings;
}

// ==============================================
// 문구
// ==============================================

/** 알림 본문에 싣는 미리보기 글자 수 */
const PREVIEW_LENGTH = 50;

/** 채팅 이미지 메시지의 content 접두사 (chat-room.tsx의 IMAGE_PREFIX와 같은 값) */
const CHAT_IMAGE_PREFIX = "image:";

/**
 * 알림 본문에 싣는 미리보기. 앞 50자만 남긴다.
 * 이모지 같은 서로게이트 쌍을 반으로 자르지 않도록 글자(코드 포인트) 단위로 센다.
 */
export function previewText(text: string): string {
	return Array.from(text.trim()).slice(0, PREVIEW_LENGTH).join("");
}

/**
 * 채팅 메시지의 알림 본문. 이미지 메시지는 사진이라고만 적는다.
 */
export function chatPreview(content: string): string {
	return content.startsWith(CHAT_IMAGE_PREFIX)
		? "[사진]"
		: previewText(content);
}

const MARKET_STATUS_TITLE: Record<MarketStatus, string> = {
	available: "찜한 상품이 판매중으로 바뀌었어요",
	reserved: "찜한 상품이 예약중으로 바뀌었어요",
	sold: "찜한 상품이 판매완료로 바뀌었어요",
};

const postHref = (postId: string) => `/community/posts/${postId}`;
const marketHref = (marketId: string) => `/market/${marketId}`;
const chatHref = (roomId: string) => `/chat/${roomId}`;

// ==============================================
// DTOs
// ==============================================

/**
 * 알림을 일으킨 사용자
 */
export interface NotificationActor {
	id: string;
	nickname: string;
}

/**
 * 알림 생성 DTO
 */
export interface CreateNotificationDto {
	/** 받는 사람 */
	userId: string;
	type: NotificationType;
	title: string;
	body?: string | null;
	/** 눌렀을 때 이동할 앱 안 경로 */
	href?: string | null;
	/** 알림을 일으킨 사용자. 받는 사람과 같으면 알림을 만들지 않는다 */
	actorId?: string | null;
}

/**
 * 같은 알림을 여러 사람에게 만드는 DTO. 받는 사람만 userIds로 바뀐다.
 */
export interface CreateManyNotificationsDto
	extends Omit<CreateNotificationDto, "userId"> {
	userIds: string[];
}

export interface CreateNotificationOptions {
	/**
	 * true면 같은 받는 사람·종류·행동한 사람·이동 경로로 아직 안 읽은 알림이 있을 때 새로 만들지 않는다.
	 */
	skipDuplicateUnread?: boolean;
}

/**
 * 채팅 메시지 알림 입력
 */
export interface ChatMessageNotificationDto {
	roomId: string;
	senderId: string;
	senderNickname: string;
	/** 보낸 사람을 뺀 방의 다른 멤버 */
	recipientIds: string[];
	/** 알림 본문. 메시지 내용에서 chatPreview로 만든다 */
	preview: string;
}

/**
 * 목록 조회 옵션
 */
export interface NotificationListOptions {
	cursor?: string;
	limit?: number;
}

// ==============================================
// 내부 함수
// ==============================================

/**
 * 알림은 부가 기능이라 만들다 실패해도 본 요청을 실패시키지 않는다. 오류는 서버 로그에만 남기고 fallback을 돌려준다.
 */
async function bestEffort<T>(
	label: string,
	work: () => Promise<T>,
	fallback: T,
): Promise<T> {
	try {
		return await work();
	} catch (error) {
		console.error(`[notification] ${label} failed`, error);
		return fallback;
	}
}

/**
 * userIds 중 이 종류의 알림을 받을 사람. 행동한 본인, 없는 사용자, 탈퇴한 사용자,
 * 이 종류의 설정을 끈 사용자는 뺀다. 설정은 사용자를 한 번에 읽어 확인한다.
 */
async function eligibleRecipients(
	userIds: string[],
	type: NotificationType,
	actorId?: string | null,
): Promise<string[]> {
	const candidates = Array.from(new Set(userIds)).filter(
		(id) => id !== actorId,
	);
	if (candidates.length === 0) return [];

	const users = await prisma.user.findMany({
		where: { id: { in: candidates }, deletedAt: null },
		select: { id: true, notificationSettings: true },
	});
	const key = SETTING_KEY_OF_TYPE[type];
	return users
		.filter((user) => resolveSettings(user.notificationSettings)[key])
		.map((user) => user.id);
}

async function createOne(
	dto: CreateNotificationDto,
	options: CreateNotificationOptions = {},
) {
	const [userId] = await eligibleRecipients(
		[dto.userId],
		dto.type,
		dto.actorId,
	);
	if (!userId) return null;

	if (options.skipDuplicateUnread) {
		const duplicate = await prisma.notification.findFirst({
			where: {
				userId,
				type: dto.type,
				actorId: dto.actorId ?? null,
				href: dto.href ?? null,
				readAt: null,
			},
			select: { id: true },
		});
		if (duplicate) return null;
	}

	return prisma.notification.create({
		data: {
			userId,
			type: dto.type,
			title: dto.title,
			body: dto.body ?? null,
			href: dto.href ?? null,
			actorId: dto.actorId ?? null,
		},
	});
}

async function createMany(dto: CreateManyNotificationsDto) {
	const userIds = await eligibleRecipients(dto.userIds, dto.type, dto.actorId);
	if (userIds.length === 0) return 0;

	const { count } = await prisma.notification.createMany({
		data: userIds.map((userId) => ({
			userId,
			type: dto.type,
			title: dto.title,
			body: dto.body ?? null,
			href: dto.href ?? null,
			actorId: dto.actorId ?? null,
		})),
	});
	return count;
}

// ==============================================
// Service
// ==============================================

/**
 * Notification Service. 알림을 만드는 함수(create, createMany, createFor...)는 모두 실패해도 던지지 않는다.
 * 오류는 서버 로그에만 남기므로, 알림을 만드는 쪽의 요청은 알림 때문에 실패하지 않는다.
 */
export const notificationService = {
	/**
	 * 알림 한 건 생성. 받는 사람이 행동한 본인이거나 탈퇴했거나 이 종류의 설정을 꺼 뒀으면 만들지 않고 null을 돌려준다.
	 */
	async create(
		dto: CreateNotificationDto,
		options: CreateNotificationOptions = {},
	) {
		return bestEffort("create", () => createOne(dto, options), null);
	},

	/**
	 * 같은 알림을 여러 사람에게 생성. 만든 알림 수를 돌려준다.
	 */
	async createMany(dto: CreateManyNotificationsDto) {
		return bestEffort("createMany", () => createMany(dto), 0);
	},

	/**
	 * 채팅 메시지 알림. 받는 사람의 같은 방에 아직 안 읽은 채팅 알림이 있으면 새로 만들지 않고
	 * 최신 메시지의 보낸 사람·내용·시각으로 바꾼다(메시지를 연달아 보내도 방마다 알림 하나만 남는다).
	 */
	async createForChatMessage(dto: ChatMessageNotificationDto) {
		await bestEffort(
			"createForChatMessage",
			async () => {
				const userIds = await eligibleRecipients(
					dto.recipientIds,
					"chat",
					dto.senderId,
				);
				const href = chatHref(dto.roomId);
				const title = `${dto.senderNickname}님의 새 메시지`;

				await Promise.all(
					userIds.map((userId) =>
						bestEffort(
							"createForChatMessage",
							async () => {
								const { count } = await prisma.notification.updateMany({
									where: { userId, type: "chat", href, readAt: null },
									data: {
										title,
										body: dto.preview,
										actorId: dto.senderId,
										createdAt: new Date(),
									},
								});
								if (count > 0) return;

								await prisma.notification.create({
									data: {
										userId,
										type: "chat",
										title,
										body: dto.preview,
										href,
										actorId: dto.senderId,
									},
								});
							},
							undefined,
						),
					),
				);
			},
			undefined,
		);
	},

	/**
	 * 댓글·답글 알림. 댓글은 글쓴이에게, 답글은 부모 댓글 작성자에게 알린다.
	 * 지워진 댓글의 작성자에게는 답글을 알리지 않는다.
	 */
	async createForComment(dto: {
		postId: string;
		/** 글쓴이 */
		postAuthorId: string;
		/** 답글이면 부모 댓글 id */
		parentId?: string | null;
		actor: NotificationActor;
		content: string;
	}) {
		await bestEffort(
			"createForComment",
			async () => {
				let userId = dto.postAuthorId;
				if (dto.parentId) {
					const parent = await prisma.comment.findUnique({
						where: { id: dto.parentId },
						select: { userId: true, deletedAt: true },
					});
					if (!parent || parent.deletedAt) return;
					userId = parent.userId;
				}

				await createOne({
					userId,
					type: "comment",
					title: `${dto.actor.nickname}님이 ${dto.parentId ? "답글" : "댓글"}을 남겼어요`,
					body: previewText(dto.content),
					href: postHref(dto.postId),
					actorId: dto.actor.id,
				});
			},
			undefined,
		);
	},

	/**
	 * 게시글 좋아요 알림(좋아요가 켜질 때만). 같은 글에 같은 사람이 남긴 안 읽은 알림이 있으면 만들지 않는다.
	 */
	async createForLike(dto: { postId: string; actor: NotificationActor }) {
		await bestEffort(
			"createForLike",
			async () => {
				const post = await prisma.post.findUnique({
					where: { id: dto.postId },
					select: { userId: true, content: true },
				});
				if (!post) return;

				await createOne(
					{
						userId: post.userId,
						type: "like",
						title: `${dto.actor.nickname}님이 내 글을 좋아해요`,
						body: previewText(post.content),
						href: postHref(dto.postId),
						actorId: dto.actor.id,
					},
					{ skipDuplicateUnread: true },
				);
			},
			undefined,
		);
	},

	/**
	 * 상품 상태가 바뀌었다고 찜한 사용자에게 알린다. 주인과 excludeUserIds는 뺀다.
	 * 상태가 바뀌었는지는 부르는 쪽에서 확인한다.
	 */
	async createForMarketStatus(dto: {
		marketId: string;
		/** 상품 주인. 상태를 바꾼 사람이라 알리지 않는다 */
		ownerId: string;
		/** 바뀐 뒤의 상태 */
		status: MarketStatus;
		excludeUserIds?: string[];
	}) {
		await bestEffort(
			"createForMarketStatus",
			async () => {
				const market = await prisma.market.findUnique({
					where: { id: dto.marketId },
					select: { title: true },
				});
				if (!market) return;

				const likes = await prisma.marketLike.findMany({
					where: { marketId: dto.marketId },
					select: { userId: true },
				});
				const excluded = new Set(dto.excludeUserIds);
				await createMany({
					userIds: likes
						.map((like) => like.userId)
						.filter((userId) => !excluded.has(userId)),
					type: "market",
					title: MARKET_STATUS_TITLE[dto.status],
					body: market.title,
					href: marketHref(dto.marketId),
					actorId: dto.ownerId,
				});
			},
			undefined,
		);
	},

	/**
	 * 거래 완료 알림. 구매자에게 알린다.
	 */
	async createForTrade(dto: {
		marketId: string;
		sellerId: string;
		buyerId: string;
	}) {
		await bestEffort(
			"createForTrade",
			async () => {
				const market = await prisma.market.findUnique({
					where: { id: dto.marketId },
					select: { title: true },
				});
				if (!market) return;

				await createOne({
					userId: dto.buyerId,
					type: "trade",
					title: "거래가 완료됐어요",
					body: market.title,
					href: "/mypage/purchases",
					actorId: dto.sellerId,
				});
			},
			undefined,
		);
	},

	/**
	 * 후기 알림. 후기를 받은 거래 상대에게 알린다. 거래 알림 설정을 따른다.
	 */
	async createForReview(dto: {
		actor: NotificationActor;
		revieweeId: string;
		rating: number;
		content?: string | null;
	}) {
		await bestEffort(
			"createForReview",
			async () => {
				await createOne({
					userId: dto.revieweeId,
					type: "review",
					title: `${dto.actor.nickname}님이 후기를 남겼어요`,
					body: [
						`별점 ${dto.rating}점`,
						dto.content ? previewText(dto.content) : null,
					]
						.filter(Boolean)
						.join(" · "),
					href: `/users/${dto.revieweeId}`,
					actorId: dto.actor.id,
				});
			},
			undefined,
		);
	},

	/**
	 * 알림 목록 (최신순, 커서 기반 페이지네이션). 커서는 마지막 항목의 id다.
	 */
	async list(userId: string, options: NotificationListOptions = {}) {
		const { cursor, limit = 20 } = options;

		const notifications = await prisma.notification.findMany({
			where: { userId },
			take: limit + 1,
			...(cursor && {
				cursor: { id: cursor },
				skip: 1,
			}),
			// 같은 시각에 만들어진 알림도 순서가 고정되도록 id를 이어서 쓴다
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
		});

		const hasMore = notifications.length > limit;
		const items = hasMore ? notifications.slice(0, limit) : notifications;
		// 다음 요청은 커서 항목을 건너뛰므로(skip: 1) 이 페이지의 마지막 항목을 커서로 준다
		const nextCursor = hasMore ? items[items.length - 1].id : null;

		return { items, nextCursor, hasMore };
	},

	/**
	 * 안 읽은 알림 수
	 */
	async unreadCount(userId: string) {
		return prisma.notification.count({ where: { userId, readAt: null } });
	},

	/**
	 * 알림 하나를 읽음 처리하고 읽은 시각을 돌려준다. 이미 읽은 알림은 처음 읽은 시각을 그대로 두고,
	 * 없는 알림이나 남의 알림이면 아무것도 바꾸지 않고 null을 돌려준다.
	 */
	async markRead(userId: string, id: string) {
		await prisma.notification.updateMany({
			where: { id, userId, readAt: null },
			data: { readAt: new Date() },
		});
		const notification = await prisma.notification.findFirst({
			where: { id, userId },
			select: { readAt: true },
		});
		return notification?.readAt ?? null;
	},

	/**
	 * 안 읽은 알림을 모두 읽음 처리하고, 바뀐 알림 수를 돌려준다.
	 */
	async markAllRead(userId: string) {
		const { count } = await prisma.notification.updateMany({
			where: { userId, readAt: null },
			data: { readAt: new Date() },
		});
		return count;
	},

	/**
	 * 알림 설정. 저장된 값을 기본값(모두 켜짐)에 합쳐 다섯 키를 모두 돌려준다.
	 */
	async getSettings(userId: string): Promise<NotificationSettings> {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { notificationSettings: true },
		});
		return resolveSettings(user?.notificationSettings);
	},

	/**
	 * 알림 설정을 부분 갱신하고 바뀐 전체 설정을 돌려준다. patch에 없는 키와 모르는 키는 건드리지 않는다.
	 */
	async updateSettings(
		userId: string,
		patch: Partial<NotificationSettings>,
	): Promise<NotificationSettings> {
		const changes: Partial<NotificationSettings> = {};
		for (const key of SETTING_KEYS) {
			const value = patch[key];
			if (typeof value === "boolean") changes[key] = value;
		}

		if (Object.keys(changes).length > 0) {
			// 읽고 합쳐 쓰는 대신 jsonb 병합을 한 문장으로 해서, 서로 다른 키를 거의 동시에 바꿔도 앞선 변경이 덮어써지지 않는다
			await prisma.$executeRaw`
				UPDATE "User"
				SET "notificationSettings" =
					COALESCE("notificationSettings", '{}'::jsonb) || ${JSON.stringify(changes)}::jsonb
				WHERE "id" = ${userId}
			`;
		}
		return notificationService.getSettings(userId);
	},
};
