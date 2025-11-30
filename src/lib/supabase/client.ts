import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const globalForSupabase =
	process.env.NODE_ENV === "development"
		? (globalThis as unknown as {
				supabaseBrowserClient: SupabaseClient | undefined;
			})
		: { supabaseBrowserClient: undefined };

/**
 * 싱글톤 패턴의 Supabase 브라우저 클라이언트
 * globalThis를 사용하여 HMR 시에도 인스턴스를 유지합니다.
 */
export function createSupabaseBrowserClient(): SupabaseClient {
	if (globalForSupabase.supabaseBrowserClient) {
		return globalForSupabase.supabaseBrowserClient;
	}

	const client = createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
	);

	globalForSupabase.supabaseBrowserClient = client;

	return client;
}
