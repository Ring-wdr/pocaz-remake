import { api } from "@/utils/eden";
import type { PostCategory, PostListQuery, PostListResult } from "../types";

const DEFAULT_LIMIT = 20;

function parseLimit(limit?: number): number {
	if (!limit || Number.isNaN(limit) || limit <= 0) return DEFAULT_LIMIT;
	return limit;
}

export function toCategory(value: string | null): PostCategory | undefined {
	if (!value) return undefined;
	const normalized = value.trim() as PostCategory;
	return normalized === "free" ||
		normalized === "boast" ||
		normalized === "info"
		? normalized
		: undefined;
}

export async function getPostList({
	category,
	keyword,
	cursor,
	limit = DEFAULT_LIMIT,
}: PostListQuery): Promise<{
	data: PostListResult | null;
	error: string | null;
}> {
	const safeLimit = parseLimit(limit);
	const limitString = safeLimit.toString();

	try {
		let response: Awaited<ReturnType<typeof api.posts.get>>;

		if (keyword) {
			response = await api.posts.search.get({
				query: {
					keyword,
					cursor: cursor ?? undefined,
					limit: limitString,
				},
				fetch: { cache: "no-store" },
			});
		} else {
			response = await api.posts.get({
				query: {
					limit: limitString,
					category,
					cursor: cursor ?? undefined,
				},
				fetch: { next: { revalidate: 30 } },
			});
		}

		if (response.error || !response.data) {
			return { data: null, error: "게시글을 불러올 수 없습니다." };
		}

		return { data: response.data, error: null };
	} catch (error) {
		console.error("getPostList failed", error);
		return { data: null, error: "게시글을 불러오는 중 오류가 발생했습니다." };
	}
}

export { DEFAULT_LIMIT as POST_LIST_LIMIT };
