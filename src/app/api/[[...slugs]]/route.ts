import { openapi } from "@elysiajs/openapi";
import { Elysia, t } from "elysia";
import { authGuard, optionalAuth } from "@/lib/elysia/auth";
import { artistRoutes, publicArtistRoutes } from "@/lib/elysia/routes/artists";
import { chatRoutes } from "@/lib/elysia/routes/chat";
import { likeRoutes } from "@/lib/elysia/routes/likes";
import { marketRoutes, publicMarketRoutes } from "@/lib/elysia/routes/markets";
import {
	galmangPocaRoutes,
	photocardRoutes,
	publicGalmangPocaRoutes,
	publicPhotocardRoutes,
} from "@/lib/elysia/routes/photocards";
import { postRoutes, publicPostRoutes } from "@/lib/elysia/routes/posts";
import { storageRoutes } from "@/lib/elysia/routes/storage";
import { publicUserRoutes, userRoutes } from "@/lib/elysia/routes/users";

// ==============================================
// Public Routes (인증 불필요)
// ==============================================
const publicRoutes = new Elysia({ prefix: "/public" }).get(
	"/health",
	() => ({
		status: "ok",
		timestamp: new Date().toISOString(),
	}),
	{
		response: t.Object({
			status: t.String(),
			timestamp: t.String(),
		}),
		detail: {
			tags: ["Auth"],
			summary: "헬스체크",
			description: "서버 상태를 확인합니다.",
		},
	},
);

// ==============================================
// Auth Routes (선택적 인증 - 로그인 상태 확인용)
// ==============================================
const authRoutes = new Elysia({ prefix: "/auth" }).use(optionalAuth).get(
	"/me",
	({ auth }) => {
		if (!auth.user) {
			return {
				authenticated: false,
				user: null,
			};
		}

		return {
			authenticated: true,
			user: {
				id: auth.user.id,
				email: auth.user.email,
				name: auth.user.user_metadata?.full_name ?? null,
				avatarUrl: auth.user.user_metadata?.avatar_url ?? null,
			},
		};
	},
	{
		response: t.Object({
			authenticated: t.Boolean(),
			user: t.Nullable(
				t.Object({
					id: t.String(),
					email: t.Optional(t.String()),
					name: t.Optional(t.String()),
					avatarUrl: t.Optional(t.String()),
				}),
			),
		}),
		detail: {
			tags: ["Auth"],
			summary: "인증된 사용자 정보 조회",
			description: "인증된 사용자 정보를 조회합니다.",
		},
	},
);

// ==============================================
// Protected Routes (인증 필수)
// ==============================================
const protectedRoutes = new Elysia({ prefix: "/protected" })
	.use(authGuard)
	// 현재 인증된 사용자 정보 (Supabase Auth 정보)
	.get(
		"/profile",
		({ auth }) => ({
			id: auth.user.id,
			email: auth.user.email,
			name: auth.user.user_metadata?.full_name ?? null,
			avatarUrl: auth.user.user_metadata?.avatar_url ?? null,
			provider: auth.user.app_metadata?.provider ?? null,
			createdAt: auth.user.created_at,
		}),
		{
			response: t.Object({
				id: t.String(),
				email: t.Optional(t.String()),
				name: t.Nullable(t.String()),
				avatarUrl: t.Nullable(t.String()),
				provider: t.Nullable(t.String()),
				createdAt: t.String(),
			}),
			detail: {
				tags: ["Auth"],
				summary: "인증된 사용자 프로필 조회",
				description: "Supabase Auth 기반의 사용자 프로필을 조회합니다.",
			},
		},
	);

// ==============================================
// Main App
// ==============================================
export const app = new Elysia({ prefix: "/api" })
	.use(
		openapi({
			documentation: {
				info: {
					title: "Pocaz API",
					version: "1.0.0",
					description: "Pocaz 서비스 API 문서",
				},
				tags: [
					{ name: "Auth", description: "인증 관련 API" },
					{ name: "Users", description: "사용자 관련 API" },
					{ name: "Posts", description: "게시글 관련 API" },
					{ name: "Markets", description: "장터 관련 API" },
					{ name: "Artists", description: "아티스트/그룹/소속사 관련 API" },
					{ name: "Photocards", description: "포토카드 관련 API" },
					{ name: "GalmangPoca", description: "갈망포카 관련 API" },
					{ name: "Likes", description: "좋아요 관련 API" },
					{ name: "Chat", description: "채팅 관련 API" },
					{ name: "Storage", description: "파일 저장소 관련 API" },
				],
			},
		}),
	)
	.get(
		"/",
		() => ({
			message: "Pocaz API",
			version: "1.0.0",
		}),
		{
			detail: {
				tags: ["Auth"],
				summary: "API 상태 확인",
				description: "API 서버 상태를 확인합니다.",
			},
		},
	);

// Core Routes
app
	.use(publicRoutes)
	.use(authRoutes)
	.use(protectedRoutes)
	// User
	.use(publicUserRoutes)
	.use(userRoutes)
	// Post
	.use(publicPostRoutes)
	.use(postRoutes)
	// Market
	.use(publicMarketRoutes)
	.use(marketRoutes)
	// Artist
	.use(publicArtistRoutes)
	.use(artistRoutes)
	// Photocard
	.use(publicPhotocardRoutes)
	.use(photocardRoutes)
	.use(publicGalmangPocaRoutes)
	.use(galmangPocaRoutes)
	// Like
	.use(likeRoutes)
	// Chat
	.use(chatRoutes)
	// Storage
	.use(storageRoutes);

// Next.js Route Handlers
export const GET = app.handle;
export const POST = app.handle;
export const PUT = app.handle;
export const PATCH = app.handle;
export const DELETE = app.handle;
