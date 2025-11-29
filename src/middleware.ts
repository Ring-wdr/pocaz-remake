import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
	return await updateSession(request);
}

export const config = {
	matcher: [
		/*
		 * 다음으로 시작하는 경로를 제외한 모든 요청 경로와 일치:
		 * - _next/static (정적 파일)
		 * - _next/image (이미지 최적화 파일)
		 * - favicon.ico (파비콘 파일)
		 * - public 폴더의 이미지들
		 */
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
