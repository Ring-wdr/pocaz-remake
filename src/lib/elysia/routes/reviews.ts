import { Elysia, t } from "elysia";
import { authGuard } from "@/lib/elysia/auth";
import { LimitQuery } from "@/lib/elysia/schemas";
import { notificationService } from "@/lib/services/notification";
import { ReviewError, reviewService } from "@/lib/services/review";
import { userService } from "@/lib/services/user";

// 공통 스키마
const ErrorSchema = t.Object({
	error: t.String(),
});

// 방금 남긴 후기
const ReviewSchema = t.Object({
	id: t.String(),
	transactionId: t.String(),
	reviewerId: t.String(),
	revieweeId: t.String(),
	rating: t.Number(),
	content: t.Nullable(t.String()),
	createdAt: t.String(),
});

// 받은 후기 목록의 항목
const ReviewItemSchema = t.Object({
	id: t.String(),
	rating: t.Number(),
	content: t.Nullable(t.String()),
	createdAt: t.String(),
	reviewer: t.Object({
		id: t.String(),
		nickname: t.String(),
		profileImage: t.Nullable(t.String()),
	}),
	market: t.Object({
		id: t.String(),
		title: t.String(),
	}),
});

const PaginatedReviewsSchema = t.Object({
	items: t.Array(ReviewItemSchema),
	nextCursor: t.Nullable(t.String()),
	hasMore: t.Boolean(),
});

/**
 * Public Review Routes (인증 불필요)
 */
export const publicReviewRoutes = new Elysia({ prefix: "/users" })
	// GET /api/users/:id/reviews - 사용자가 받은 후기 목록
	.get(
		"/:id/reviews",
		async ({ params, query, status }) => {
			// 없는 사용자와 탈퇴한 사용자의 후기는 내보내지 않는다
			if (!(await userService.findById(params.id))) {
				return status(404, { error: "User not found" });
			}

			const result = await reviewService.listByUser(params.id, {
				cursor: query.cursor,
				limit: query.limit ?? 20,
			});

			return {
				items: result.items.map((review) => ({
					id: review.id,
					rating: review.rating,
					content: review.content,
					createdAt: review.createdAt.toISOString(),
					reviewer: review.reviewer,
					market: review.transaction.market,
				})),
				nextCursor: result.nextCursor,
				hasMore: result.hasMore,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			query: t.Object({
				cursor: t.Optional(t.String()),
				limit: LimitQuery,
			}),
			response: {
				200: PaginatedReviewsSchema,
				404: ErrorSchema,
			},
			detail: {
				tags: ["Reviews"],
				summary: "받은 후기 목록 조회",
				description:
					"사용자가 거래 상대에게서 받은 후기를 최신순으로 페이지네이션하여 조회합니다.",
			},
		},
	);

/**
 * Protected Review Routes (인증 필수)
 */
export const reviewRoutes = new Elysia({ prefix: "/transactions" })
	.use(authGuard)
	// POST /api/transactions/:id/reviews - 거래 후기 작성
	.post(
		"/:id/reviews",
		async ({ auth, params, body, status }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				return status(401, { error: "User not found" });
			}

			try {
				const review = await reviewService.create({
					transactionId: params.id,
					reviewerId: user.id,
					rating: body.rating,
					content: body.content,
				});

				// 후기를 받은 거래 상대에게 알린다
				await notificationService.createForReview({
					actor: user,
					revieweeId: review.revieweeId,
					rating: review.rating,
					content: review.content,
				});

				return status(201, {
					id: review.id,
					transactionId: review.transactionId,
					reviewerId: review.reviewerId,
					revieweeId: review.revieweeId,
					rating: review.rating,
					content: review.content,
					createdAt: review.createdAt.toISOString(),
				});
			} catch (error) {
				if (!(error instanceof ReviewError)) throw error;
				return status(error.status, { error: error.message });
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				rating: t.Integer({ minimum: 1, maximum: 5 }),
				// 화면의 글자 수 제한(300자)과 같은 값
				content: t.Optional(t.String({ maxLength: 300 })),
			}),
			response: {
				201: ReviewSchema,
				400: ErrorSchema,
				401: ErrorSchema,
				403: ErrorSchema,
				404: ErrorSchema,
				409: ErrorSchema,
			},
			detail: {
				tags: ["Reviews"],
				summary: "거래 후기 작성",
				description:
					"완료된 거래의 구매자나 판매자가 상대에게 별점(1~5)과 짧은 후기를 남깁니다. 거래당 한 사람이 한 번만 남길 수 있습니다.",
			},
		},
	);
