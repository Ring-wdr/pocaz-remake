/**
 * Post Entity Types
 *
 * Prisma Post, Comment 모델을 기반으로 한 커뮤니티 관련 타입 정의
 */

import type {
	PostModel,
	PostImageModel,
	CommentModel,
} from "@/generated/prisma/models";

/** Post 카테고리 타입 (Prisma 스키마의 category 필드와 동기화) */
export type PostCategory = "free" | "boast" | "info";

/** Post 작성자 정보 */
export interface PostAuthor {
	id: string;
	nickname: string;
	profileImage: string | null;
}

/** Post 이미지 */
export interface PostImageItem {
	id: PostImageModel["id"];
	imageUrl: PostImageModel["imageUrl"];
}

/** Post 목록 아이템 */
export interface PostListItem {
	id: PostModel["id"];
	content: PostModel["content"];
	category: PostCategory;
	createdAt: PostModel["createdAt"];
	user: PostAuthor;
	images: PostImageItem[];
	likeCount: number;
	commentCount: number;
}

/** Post 상세 정보 */
export interface PostDetail extends PostListItem {
	updatedAt: PostModel["updatedAt"];
}

/** Comment 작성자 정보 */
export interface CommentAuthor {
	id: string;
	nickname: string;
	profileImage: string | null;
}

/** Comment 아이템 */
export interface CommentItem {
	id: CommentModel["id"];
	content: CommentModel["content"];
	createdAt: CommentModel["createdAt"];
	deletedAt: CommentModel["deletedAt"];
	user: CommentAuthor;
	parentId: CommentModel["parentId"];
	replies?: CommentItem[];
}
