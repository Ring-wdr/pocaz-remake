import { treaty } from "@elysiajs/eden";
import type { app as AppType } from "@/app/api/[[...slugs]]/route";
import { getApiBaseUrl } from "./url";

/**
 * Type-safe Eden Treaty 클라이언트
 * 서버/클라이언트 컴포넌트 모두에서 사용 가능
 *
 * - 클라이언트: credentials: "include"로 브라우저 쿠키 자동 전송
 * - 서버: onRequest 훅에서 Next.js cookies()를 헤더에 주입
 */
function createApi() {
	const baseUrl = getApiBaseUrl();
	return treaty<typeof AppType>(baseUrl, {
		fetch: {
			credentials: "include",
		},
		async onRequest() {
			if (typeof window === "undefined") {
				const { cookies } = await import("next/headers");
				const cookieStore = await cookies();
				return {
					headers: {
						cookie: cookieStore.toString(),
					},
				};
			}
		},
	}).api;
}

let cachedApi: ReturnType<typeof createApi> | null = null;

export const api = new Proxy({} as ReturnType<typeof createApi>, {
	get(_, prop) {
		if (!cachedApi) {
			cachedApi = createApi();
		}
		return cachedApi[prop as keyof typeof cachedApi];
	},
});
