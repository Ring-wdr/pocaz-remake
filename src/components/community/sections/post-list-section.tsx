import { fetchPostList, POST_LIST_LIMIT } from "./fetch-post-list";
import { PostListSectionClient } from "./post-list-section.client";
import type { PostCategory, PostListState } from "./types";

interface PostListSectionProps {
	category?: PostCategory;
}

export default async function PostListSection({
	category,
}: PostListSectionProps) {
	const { data, error } = await fetchPostList({
		category,
		limit: POST_LIST_LIMIT,
	});

	const initialState: PostListState = {
		items: data?.items ?? [],
		nextCursor: data?.nextCursor ?? null,
		hasMore: data?.hasMore ?? false,
		keyword: "",
		error,
	};

	return (
		<PostListSectionClient
			initialState={initialState}
			category={category}
			limit={POST_LIST_LIMIT}
		/>
	);
}
