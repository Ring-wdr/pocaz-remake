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
 * Eden API용 base URL
 */
export function getApiBaseUrl(): string {
	return getBaseUrl();
}

/** 로그인 화면 경로(`/login`, `/login/...`, `/login?...`). 로그인 뒤 돌아갈 곳으로 삼으면 로그인 화면이 반복된다 */
const LOGIN_PATH = /^\/login(?:[/?#]|$)/;

/** 역슬래시와 제어 문자(탭·개행 포함). 브라우저가 주소를 읽을 때 `//`처럼 바꿔 해석할 수 있다 */
const UNSAFE_PATH_CHARACTERS = /[\\\p{Cc}]/u;

/**
 * 로그인 뒤 돌아갈 경로를 안전한 값으로 정리한다.
 * - 같은 사이트의 경로(`/`로 시작, 쿼리스트링 허용)만 그대로 돌려준다.
 * - `//evil.com`(프로토콜 상대 주소), `https://evil.com`(절대 주소), `/\evil.com`, 개행·제어 문자는
 *   다른 사이트로 보내는 주소가 될 수 있어 `/`로 바꾼다.
 * - `/login`으로 시작하는 경로도 `/`로 바꾼다(로그인 화면으로 다시 돌아오는 반복 방지).
 */
export function sanitizeReturnPath(value: string | null | undefined): string {
	if (typeof value !== "string") return "/";
	if (!value.startsWith("/") || value.startsWith("//")) return "/";
	if (value.includes("://") || UNSAFE_PATH_CHARACTERS.test(value)) return "/";
	if (LOGIN_PATH.test(value)) return "/";
	return value;
}

/**
 * 로그인 화면 주소. 돌아갈 경로를 `redirect`로 붙이면 로그인한 뒤 그 화면으로 돌아온다.
 * 돌아갈 곳이 홈(`/`)이거나 안전하지 않은 값이면 `redirect` 없이 `/login`만 돌려준다.
 */
export function loginHref(returnPath: string | null | undefined): string {
	const path = sanitizeReturnPath(returnPath);
	if (path === "/") return "/login";
	return `/login?redirect=${encodeURIComponent(path)}`;
}
