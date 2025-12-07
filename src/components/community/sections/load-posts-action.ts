"use server";

import { fetchPostList, POST_LIST_LIMIT, toCategory } from "./fetch-post-list";
import type { PostCategory, PostListState } from "./types";

function parseCategory(raw: FormDataEntryValue | null): PostCategory | undefined {
	if (typeof raw !== "string") return undefined;
	return toCategory(raw);
}

function parseLimit(raw: FormDataEntryValue | null): number {
	if (typeof raw !== "string") return POST_LIST_LIMIT;
	const parsed = Number.parseInt(raw, 10);
	if (Number.isNaN(parsed) || parsed <= 0) return POST_LIST_LIMIT;
	return parsed;
}

export async function loadPostsAction(
	prevState: PostListState,
	formData: FormData,
): Promise<PostListState> {
	const keyword = formData.get("keyword")?.toString().trim() ?? "";
	const category = parseCategory(formData.get("category"));
	const cursor = formData.get("cursor")?.toString() || null;
	const limit = parseLimit(formData.get("limit"));

	const baseState: PostListState = {
		...prevState,
		keyword,
		error: null,
	};

	const { data, error } = await fetchPostList({
		keyword,
		category,
		cursor,
		limit,
	});

	if (error || !data) {
		return {
			...baseState,
			items: cursor ? prevState.items : [],
			nextCursor: null,
			hasMore: false,
			error: error ?? "게시글을 불러올 수 없습니다.",
		};
	}

	const items = cursor ? [...prevState.items, ...data.items] : data.items;

	return {
		items,
		nextCursor: data.nextCursor,
		hasMore: data.hasMore,
		keyword,
		error: null,
	};
}
