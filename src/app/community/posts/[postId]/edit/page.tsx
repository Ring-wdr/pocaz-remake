import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/actions";
import { api } from "@/utils/eden";

import EditPostClient from "./page.client";

async function getPost(postId: string) {
	const { data, error } = await api.posts({ id: postId }).get();
	if (error || !data) {
		return null;
	}
	return data;
}

export default async function EditPostPage({
	params,
}: PageProps<"/community/posts/[postId]/edit">) {
	const { postId } = await params;

	const [currentUser, post] = await Promise.all([
		getCurrentUser(),
		getPost(postId),
	]);

	// 로그인 체크
	if (!currentUser) {
		redirect("/login");
	}

	// 게시글 존재 확인
	if (!post) {
		redirect("/community");
	}

	// 작성자 확인
	if (currentUser.id !== post.user.id) {
		redirect(`/community/posts/${postId}`);
	}

	return (
		<EditPostClient
			postId={postId}
			initialContent={post.content}
			initialImages={post.images}
		/>
	);
}
