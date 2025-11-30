import { treaty } from "@elysiajs/eden";
import type { app } from "@/app/api/[[...slugs]]/route";
import { getApiBaseUrl } from "./url";

/**
 * Type-safe Eden Treaty 클라이언트
 * 서버/클라이언트 양쪽에서 사용 가능
 */
export const { api } = treaty<typeof app>(getApiBaseUrl(), {
	fetch: {
		credentials: "include",
	},
});
