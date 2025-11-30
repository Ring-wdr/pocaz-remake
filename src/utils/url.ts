/**
 * 환경에 맞는 base URL 결정
 * 우선순위:
 * 1. 브라우저: window.location.origin
 * 2. 명시적 환경 변수: NEXT_PUBLIC_SITE_URL
 * 3. Vercel 시스템 변수: VERCEL_PROJECT_PRODUCTION_URL → VERCEL_URL
 * 4. 로컬 개발: localhost
 */
export function getBaseUrl(): string {
	// 브라우저 환경
	if (typeof window !== "undefined") {
		return window.location.origin;
	}

	// 명시적으로 설정한 사이트 URL (Vercel 대시보드에서 설정)
	if (process.env.NEXT_PUBLIC_SITE_URL) {
		return process.env.NEXT_PUBLIC_SITE_URL;
	}

	// Vercel Production URL (프로덕션 배포시)
	if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
		return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
	}

	// Vercel Preview URL (프리뷰 배포시)
	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`;
	}

	// 로컬 개발 환경
	return `http://localhost:${process.env.PORT ?? 3000}`;
}

/**
 * Eden API용 base URL (브라우저에서는 상대 경로)
 */
export function getApiBaseUrl(): string {
	if (typeof window !== "undefined") {
		return "";
	}
	return getBaseUrl();
}
