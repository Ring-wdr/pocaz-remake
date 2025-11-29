import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
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
const publicRoutes = new Elysia({ prefix: "/public" }).get("/health", () => ({
	status: "ok",
	timestamp: new Date().toISOString(),
}));

// ==============================================
// Auth Routes (선택적 인증 - 로그인 상태 확인용)
// ==============================================
const authRoutes = new Elysia({ prefix: "/auth" })
	.use(optionalAuth)
	.get("/me", ({ auth }) => {
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
	});

// ==============================================
// Protected Routes (인증 필수)
// ==============================================
const protectedRoutes = new Elysia({ prefix: "/protected" })
	.use(authGuard)
	// 현재 인증된 사용자 정보 (Supabase Auth 정보)
	.get("/profile", ({ auth }) => ({
		id: auth.user.id,
		email: auth.user.email,
		name: auth.user.user_metadata?.full_name ?? null,
		avatarUrl: auth.user.user_metadata?.avatar_url ?? null,
		provider: auth.user.app_metadata?.provider ?? null,
		createdAt: auth.user.created_at,
	}));

// ==============================================
// Main App
// ==============================================
export const app = new Elysia({ prefix: "/api" })
	.get("/", () => ({ message: "Pocaz API", version: "1.0.0" }))
	.use(openapi({ enabled: process.env.NODE_ENV === "development" }))
	// Core Routes
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
