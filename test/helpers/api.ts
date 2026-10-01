import { app } from "@/app/api/[[...slugs]]/route";

export interface TestUser {
	/** Supabase auth user id */
	id: string;
	email?: string;
	user_metadata?: { full_name?: string; avatar_url?: string };
	app_metadata?: Record<string, unknown>;
}

interface CallOptions {
	user?: TestUser;
	body?: unknown;
}

/**
 * Elysia 앱을 서버 없이 호출한다. path는 /api 뒤의 경로다.
 */
export async function callApi(
	method: string,
	path: string,
	{ user, body }: CallOptions = {},
) {
	const headers = new Headers();
	if (user) {
		// 헤더 값에는 ASCII만 들어가므로 한글 이름(user_metadata) 등을 위해 인코딩한다
		headers.set("x-test-user", encodeURIComponent(JSON.stringify(user)));
	}
	let requestBody: BodyInit | undefined;
	if (body instanceof FormData) {
		requestBody = body;
	} else if (body !== undefined) {
		headers.set("content-type", "application/json");
		requestBody = JSON.stringify(body);
	}

	const response = await app.handle(
		new Request(`http://localhost/api${path}`, {
			method,
			headers,
			body: requestBody,
		}),
	);

	const text = await response.text();
	let json: unknown = text;
	try {
		json = JSON.parse(text);
	} catch {
		// JSON이 아닌 응답은 문자열 그대로 둔다
	}
	return { status: response.status, body: json as Record<string, unknown> };
}
