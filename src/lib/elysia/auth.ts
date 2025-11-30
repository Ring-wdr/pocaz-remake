import type { Session } from "@supabase/supabase-js";
import { Elysia, t } from "elysia";
import { createSupabaseElysiaClient } from "@/lib/supabase/elysia";

/**
 * 인증 에러 응답 스키마
 */
export const AuthErrorSchema = t.Object({
	error: t.String(),
	message: t.Optional(t.String()),
});

/**
 * JWT Claims에서 추출한 사용자 정보 타입
 * getClaims()의 반환값을 기반으로 정의
 */
export interface AuthUser {
	id: string; // sub (JWT subject = user id)
	email?: string;
	user_metadata?: {
		full_name?: string;
		avatar_url?: string;
		[key: string]: unknown;
	};
	app_metadata?: {
		provider?: string;
		[key: string]: unknown;
	};
}

/**
 * Supabase Auth 정보를 담는 타입
 */
export interface AuthContext {
	user: AuthUser | null;
	session: Session | null;
}

/**
 * 인증된 사용자 정보를 담는 타입 (Protected routes용)
 */
export interface AuthenticatedContext {
	user: AuthUser;
	session: Session;
}

/**
 * JWT Claims를 AuthUser로 변환
 */
function claimsToAuthUser(claims: Record<string, unknown>): AuthUser {
	return {
		id: claims.sub as string,
		email: claims.email as string | undefined,
		user_metadata: claims.user_metadata as AuthUser["user_metadata"],
		app_metadata: claims.app_metadata as AuthUser["app_metadata"],
	};
}

/**
 * Elysia Auth Plugin
 * 모든 요청에 Supabase Auth 정보를 Context에 주입
 * getClaims()를 사용하여 JWT claims 기반으로 인증 처리
 */
export const authPlugin = new Elysia({ name: "auth" }).derive(
	{ as: "global" },
	async ({ request }): Promise<{ auth: AuthContext }> => {
		const supabase = createSupabaseElysiaClient(request);

		const [
			{ data: claimsData },
			{
				data: { session },
			},
		] = await Promise.all([
			supabase.auth.getClaims(),
			supabase.auth.getSession(),
		]);

		const user = claimsData?.claims
			? claimsToAuthUser(claimsData.claims)
			: null;

		return {
			auth: {
				user,
				session,
			},
		};
	},
);

/**
 * Auth Guard - 인증되지 않은 요청을 차단
 * Protected routes에 적용
 *
 * 이 guard를 사용하는 모든 라우트는 자동으로 401 응답 스키마가 추가됩니다.
 */
export const authGuard = new Elysia({ name: "auth-guard" })
	.guard({
		response: {
			401: AuthErrorSchema,
		},
	})
	.derive(
		{ as: "global" },
		async ({ request }): Promise<{ auth: AuthenticatedContext }> => {
			const supabase = createSupabaseElysiaClient(request);
			const [
				{ data: claimsData },
				{
					data: { session },
				},
			] = await Promise.all([
				supabase.auth.getClaims(),
				supabase.auth.getSession(),
			]);

			const user = claimsData?.claims
				? claimsToAuthUser(claimsData.claims)
				: null;

			return {
				auth: {
					user: user!,
					session: session!,
				},
			};
		},
	)
	.onBeforeHandle(({ auth, set }) => {
		if (!auth.user || !auth.session) {
			set.status = 401;
			return {
				error: "Unauthorized",
				message: "Authentication required",
			};
		}
	});

/**
 * Optional Auth - 인증 정보가 있으면 주입, 없으면 null
 * Public routes에서 선택적으로 인증 정보를 사용할 때
 */
export const optionalAuth = authPlugin;
