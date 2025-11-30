/**
 * 환경에 맞는 base URL 결정
 * - 브라우저: window.location.origin 사용
 * - 서버 (Vercel): VERCEL_URL 환경 변수 사용
 * - 서버 (로컬): localhost 사용
 */
export function getBaseUrl(): string {
	// 브라우저 환경
	if (typeof window !== "undefined") {
		return window.location.origin;
	}

	// Vercel 환경
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
