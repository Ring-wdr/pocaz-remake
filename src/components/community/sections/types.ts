export type PostCategory = "free" | "boast" | "info";

export interface PostListItem {
	id: string;
	content: string;
	createdAt: string;
	user: {
		id: string;
		nickname: string;
		profileImage: string | null;
	};
	images: { id: string; imageUrl: string }[];
	replyCount: number;
	likeCount: number;
}

export interface PostListResult {
	items: PostListItem[];
	nextCursor: string | null;
	hasMore: boolean;
}

export interface PostListQuery {
	category?: PostCategory;
	keyword?: string;
	cursor?: string | null;
	limit?: number;
}

export interface PostListState extends PostListResult {
	keyword: string;
	error: string | null;
}

export const POST_CATEGORIES: PostCategory[] = ["free", "boast", "info"];
