import PostListClient from "../client/post-list-client";
import { getPostList, POST_LIST_LIMIT } from "../data/get-post-list";
import type { PostCategory, PostListState } from "../types";

type PostListSectionProps = {
	category?: PostCategory;
};

export default async function PostListSection({
	category,
}: PostListSectionProps) {
	const { data, error } = await getPostList({
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
		<PostListClient
			initialState={initialState}
			category={category}
			limit={POST_LIST_LIMIT}
		/>
	);
}
