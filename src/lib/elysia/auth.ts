import type { Session, User } from "@supabase/supabase-js";
import { Elysia } from "elysia";
import { createSupabaseElysiaClient } from "@/lib/supabase/elysia";

/**
 * Supabase Auth 정보를 담는 타입
 */
export interface AuthContext {
	user: User | null;
	session: Session | null;
}

/**
 * 인증된 사용자 정보를 담는 타입 (Protected routes용)
 */
export interface AuthenticatedContext {
	user: User;
	session: Session;
}

/**
 * Elysia Auth Plugin
 * 모든 요청에 Supabase Auth 정보를 Context에 주입
 */
export const authPlugin = new Elysia({ name: "auth" }).derive(
	{ as: "global" },
	async ({ request }): Promise<{ auth: AuthContext }> => {
		const supabase = createSupabaseElysiaClient(request);

		const {
			data: { user },
		} = await supabase.auth.getUser();

		const {
			data: { session },
		} = await supabase.auth.getSession();

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
 */
export const authGuard = new Elysia({ name: "auth-guard" })
	.derive(
		{ as: "global" },
		async ({ request }): Promise<{ auth: AuthenticatedContext }> => {
			const supabase = createSupabaseElysiaClient(request);

			const {
				data: { user },
			} = await supabase.auth.getUser();

			const {
				data: { session },
			} = await supabase.auth.getSession();

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
