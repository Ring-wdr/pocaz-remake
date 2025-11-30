import { api } from "@/utils/eden";

import { CommentsClient } from "./comments-client";

interface CommentsSectionProps {
	postId: string;
	isLoggedIn: boolean;
	currentUserId?: string;
}

async function getComments(postId: string) {
	try {
		const { data, error } = await api.posts({ id: postId }).comments.get({
			query: { limit: "20" },
		});

		if (error || !data || "error" in data) {
			return {
				items: [],
				totalCount: 0,
				nextCursor: null,
				hasMore: false,
			};
		}

		return data;
	} catch {
		return {
			items: [],
			totalCount: 0,
			nextCursor: null,
			hasMore: false,
		};
	}
}

export async function CommentsSection({
	postId,
	isLoggedIn,
	currentUserId,
}: CommentsSectionProps) {
	const initialData = await getComments(postId);

	return (
		<CommentsClient
			postId={postId}
			initialData={initialData}
			isLoggedIn={isLoggedIn}
			currentUserId={currentUserId}
		/>
	);
}
