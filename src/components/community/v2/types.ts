export type PostCategory = "free" | "boast" | "info";

export const POST_CATEGORIES: PostCategory[] = ["free", "boast", "info"];

export type PostListItem = {
	id: string;
	content: string;
	createdAt: string;
	user: {
		id: string;
		nickname: string;
	};
	images: { id: string; imageUrl: string }[];
	replyCount: number;
	likeCount: number;
};

export type PostListResult = {
	items: PostListItem[];
	nextCursor: string | null;
	hasMore: boolean;
};

export type PostListState = PostListResult & {
	keyword: string;
	error: string | null;
};

export type PostListQuery = {
	category?: PostCategory;
	keyword?: string;
	cursor?: string | null;
	limit?: number;
};
