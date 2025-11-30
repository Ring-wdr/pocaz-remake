import { Elysia, t } from "elysia";
import { authGuard } from "@/lib/elysia/auth";
import { activityService } from "@/lib/services/activity";
import { marketLikeService } from "@/lib/services/market";
import { postService } from "@/lib/services/post";
import { transactionService } from "@/lib/services/transaction";
import { userService } from "@/lib/services/user";

// 공통 응답 스키마
const UserResponseSchema = t.Object({
	id: t.String(),
	supabaseId: t.String(),
	email: t.Nullable(t.String()),
	nickname: t.String(),
	profileImage: t.Nullable(t.String()),
	score: t.Number(),
	artistId: t.Nullable(t.String()),
	createdAt: t.String(),
});

const PublicUserSchema = t.Object({
	id: t.String(),
	nickname: t.String(),
	profileImage: t.Nullable(t.String()),
	score: t.Number(),
	artistId: t.Optional(t.Nullable(t.String())),
});

const ErrorSchema = t.Object({
	error: t.String(),
	message: t.Optional(t.String()),
});

/**
 * User API Routes
 * 인증된 사용자를 위한 User CRUD API
 */
export const userRoutes = new Elysia({ prefix: "/users" })
	.use(authGuard)
	// GET /api/users/me - 현재 사용자 정보 (Prisma User)
	.get(
		"/me",
		async ({ auth }) => {
			const user = await userService.findOrCreate(
				auth.user.id,
				auth.user.email,
				auth.user.user_metadata?.full_name,
				auth.user.user_metadata?.avatar_url,
			);

			return {
				id: user.id,
				supabaseId: user.supabaseId,
				email: user.email,
				nickname: user.nickname,
				profileImage: user.profileImage,
				score: user.score,
				artistId: user.artistId,
				createdAt: user.createdAt.toISOString(),
			};
		},
		{
			response: UserResponseSchema,
			detail: {
				tags: ["Users"],
				summary: "현재 사용자 정보 조회",
				description: "인증된 사용자의 Prisma User 정보를 조회합니다.",
			},
		},
	)
	// PUT /api/users/me - 현재 사용자 정보 수정
	.put(
		"/me",
		async ({ auth, body, set }) => {
			const existingUser = await userService.findBySupabaseId(auth.user.id);

			if (!existingUser) {
				set.status = 404;
				return {
					error: "User not found",
					message: "Please complete registration first",
				};
			}

			const user = await userService.update(existingUser.id, {
				nickname: body.nickname,
				profileImage: body.profileImage,
				artistId: body.artistId,
			});

			return {
				id: user.id,
				supabaseId: user.supabaseId,
				email: user.email,
				nickname: user.nickname,
				profileImage: user.profileImage,
				score: user.score,
				artistId: user.artistId,
				updatedAt: user.updatedAt.toISOString(),
			};
		},
		{
			body: t.Object({
				nickname: t.Optional(t.String({ minLength: 1, maxLength: 50 })),
				profileImage: t.Optional(t.Nullable(t.String())),
				artistId: t.Optional(t.Nullable(t.String())),
			}),
			response: {
				200: t.Object({
					id: t.String(),
					supabaseId: t.String(),
					email: t.Nullable(t.String()),
					nickname: t.String(),
					profileImage: t.Nullable(t.String()),
					score: t.Number(),
					artistId: t.Nullable(t.String()),
					updatedAt: t.String(),
				}),
				404: ErrorSchema,
			},
			detail: {
				tags: ["Users"],
				summary: "현재 사용자 정보 수정",
				description: "인증된 사용자의 프로필 정보를 수정합니다.",
			},
		},
	)
	// DELETE /api/users/me - 회원 탈퇴 (soft delete)
	.delete(
		"/me",
		async ({ auth, set }) => {
			const existingUser = await userService.findBySupabaseId(auth.user.id);

			if (!existingUser) {
				set.status = 404;
				return {
					error: "User not found",
				};
			}

			await userService.softDelete(existingUser.id);

			return {
				message: "User deleted successfully",
			};
		},
		{
			response: {
				200: t.Object({ message: t.String() }),
				404: t.Object({ error: t.String() }),
			},
			detail: {
				tags: ["Users"],
				summary: "회원 탈퇴",
				description: "인증된 사용자의 계정을 삭제합니다 (soft delete).",
			},
		},
	)
	// GET /api/users/:id - 특정 사용자 조회 (공개 정보만)
	.get(
		"/:id",
		async ({ params, set }) => {
			const user = await userService.findById(params.id);

			if (!user || user.deletedAt) {
				set.status = 404;
				return {
					error: "User not found",
				};
			}

			return {
				id: user.id,
				nickname: user.nickname,
				profileImage: user.profileImage,
				score: user.score,
				artistId: user.artistId,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: PublicUserSchema,
				404: t.Object({ error: t.String() }),
			},
			detail: {
				tags: ["Users"],
				summary: "특정 사용자 조회",
				description: "특정 사용자의 공개 정보를 조회합니다.",
			},
		},
	)
	// GET /api/users/me/posts - 내가 작성한 게시글 목록
	.get(
		"/me/posts",
		async ({ auth, query }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				return { items: [], nextCursor: null, hasMore: false };
			}

			const result = await postService.findByUserId(user.id, {
				cursor: query.cursor,
				limit: query.limit ? Number.parseInt(query.limit, 10) : 20,
			});

			return {
				items: result.items.map((post) => ({
					id: post.id,
					content: post.content,
					createdAt: post.createdAt.toISOString(),
					user: {
						id: post.user.id,
						nickname: post.user.nickname,
						profileImage: post.user.profileImage,
					},
					images: post.images.map((img) => ({
						id: img.id,
						imageUrl: img.imageUrl,
					})),
					replyCount: post._count.replies,
					likeCount: post._count.likes,
				})),
				nextCursor: result.nextCursor,
				hasMore: result.hasMore,
			};
		},
		{
			query: t.Object({
				cursor: t.Optional(t.String()),
				limit: t.Optional(t.String()),
			}),
			response: t.Object({
				items: t.Array(
					t.Object({
						id: t.String(),
						content: t.String(),
						createdAt: t.String(),
						user: t.Object({
							id: t.String(),
							nickname: t.String(),
							profileImage: t.Nullable(t.String()),
						}),
						images: t.Array(t.Object({ id: t.String(), imageUrl: t.String() })),
						replyCount: t.Number(),
						likeCount: t.Number(),
					}),
				),
				nextCursor: t.Nullable(t.String()),
				hasMore: t.Boolean(),
			}),
			detail: {
				tags: ["Users"],
				summary: "내가 작성한 게시글 목록",
				description: "현재 사용자가 작성한 게시글 목록을 조회합니다.",
			},
		},
	)
	// GET /api/users/me/purchases - 내 구매 내역
	.get(
		"/me/purchases",
		async ({ auth }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				return { items: [] };
			}

			const purchases = await transactionService.getPurchases(user.id);
			return {
				items: purchases.map((purchase) => ({
					id: purchase.id,
					title: purchase.title,
					price: purchase.price,
					seller: purchase.seller.nickname,
					date: purchase.date.toISOString(),
					image: purchase.image,
					href: `/market/${purchase.marketId}`,
				})),
			};
		},
		{
			response: t.Object({
				items: t.Array(
					t.Object({
						id: t.String(),
						title: t.String(),
						price: t.Number(),
						seller: t.String(),
						date: t.String(),
						image: t.Nullable(t.String()),
						href: t.String(),
					}),
				),
			}),
			detail: {
				tags: ["Users"],
				summary: "내 구매 내역",
				description: "현재 사용자의 구매 내역을 조회합니다.",
			},
		},
	)
	// GET /api/users/me/sales - 내 판매 내역
	.get(
		"/me/sales",
		async ({ auth, query }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				return { items: [] };
			}

			const sales = await transactionService.getSales(user.id, query.status);
			return {
				items: sales.map((s) => ({
					id: s.id,
					title: s.title,
					price: s.price,
					status: s.status,
					date: s.date.toISOString(),
					image: s.image,
					href: `/market/${s.id}`,
				})),
			};
		},
		{
			query: t.Object({
				status: t.Optional(t.String()),
			}),
			response: t.Object({
				items: t.Array(
					t.Object({
						id: t.String(),
						title: t.String(),
						price: t.Nullable(t.Number()),
						status: t.String(),
						date: t.String(),
						image: t.Nullable(t.String()),
						href: t.String(),
					}),
				),
			}),
			detail: {
				tags: ["Users"],
				summary: "내 판매 내역",
				description: "현재 사용자의 판매 내역을 조회합니다.",
			},
		},
	)
	// GET /api/users/me/wishlist - 내 찜 목록
	.get(
		"/me/wishlist",
		async ({ auth }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				return { items: [] };
			}

			const wishlist = await marketLikeService.getWishlist(user.id);
			return {
				items: wishlist.map((item) => ({
					id: item.id,
					title: item.title,
					price: item.price,
					status: item.status,
					seller: item.user.nickname,
					image: item.images[0]?.imageUrl ?? null,
					href: `/market/${item.id}`,
					likedAt: item.likedAt.toISOString(),
				})),
			};
		},
		{
			response: t.Object({
				items: t.Array(
					t.Object({
						id: t.String(),
						title: t.String(),
						price: t.Nullable(t.Number()),
						status: t.String(),
						seller: t.String(),
						image: t.Nullable(t.String()),
						href: t.String(),
						likedAt: t.String(),
					}),
				),
			}),
			detail: {
				tags: ["Users"],
				summary: "내 찜 목록",
				description: "현재 사용자가 찜한 상품 목록을 조회합니다.",
			},
		},
	)
	// GET /api/users/me/trades - 내 거래 내역
	.get(
		"/me/trades",
		async ({ auth }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				return { items: [] };
			}

			const trades = await transactionService.getTrades(user.id);
			return {
				items: trades.map((t) => ({
					id: t.id,
					title: t.title,
					price: t.price,
					type: t.type,
					partner: t.partner.nickname,
					date: t.date.toISOString(),
					image: t.image,
					href: `/market/${t.marketId}`,
				})),
			};
		},
		{
			response: t.Object({
				items: t.Array(
					t.Object({
						id: t.String(),
						title: t.String(),
						price: t.Number(),
						type: t.String(),
						partner: t.String(),
						date: t.String(),
						image: t.Nullable(t.String()),
						href: t.String(),
					}),
				),
			}),
			detail: {
				tags: ["Users"],
				summary: "내 거래 내역",
				description: "현재 사용자의 거래 내역(구매+판매)을 조회합니다.",
			},
		},
	)
	// GET /api/users/me/activity - 내 활동 내역
	.get(
		"/me/activity",
		async ({ auth }) => {
			const user = await userService.findBySupabaseId(auth.user.id);
			if (!user) {
				return { items: [] };
			}

			const activities = await activityService.getByUserId(user.id);
			return {
				items: activities.map((a) => ({
					id: a.id,
					type: a.type,
					text: a.description,
					target: a.target,
					targetHref: a.targetHref,
					time: a.createdAt.toISOString(),
				})),
			};
		},
		{
			response: t.Object({
				items: t.Array(
					t.Object({
						id: t.String(),
						type: t.String(),
						text: t.String(),
						target: t.Nullable(t.String()),
						targetHref: t.Nullable(t.String()),
						time: t.String(),
					}),
				),
			}),
			detail: {
				tags: ["Users"],
				summary: "내 활동 내역",
				description: "현재 사용자의 활동 내역을 조회합니다.",
			},
		},
	);

/**
 * Public User Routes (인증 불필요)
 */
export const publicUserRoutes = new Elysia({ prefix: "/users" })
	// GET /api/users - 전체 사용자 목록 (공개 정보만)
	.get(
		"/",
		async () => {
			const users = await userService.findAll();

			return users.map((user) => ({
				id: user.id,
				nickname: user.nickname,
				profileImage: user.profileImage,
				score: user.score,
			}));
		},
		{
			response: t.Array(
				t.Object({
					id: t.String(),
					nickname: t.String(),
					profileImage: t.Nullable(t.String()),
					score: t.Number(),
				}),
			),
			detail: {
				tags: ["Users"],
				summary: "전체 사용자 목록 조회",
				description: "모든 사용자의 공개 정보를 조회합니다.",
			},
		},
	);
