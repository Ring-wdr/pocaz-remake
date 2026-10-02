import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { registerDom } from "../helpers/dom";

/** Eden treaty 응답과 같은 모양 */
function edenResult(status: number, value?: unknown) {
	const ok = status < 400;
	return {
		data: ok ? value : null,
		error: ok ? null : { status, value },
		status,
		response: new Response(null, { status }),
		headers: {},
	};
}

const likePost = mock(
	async (): Promise<unknown> => edenResult(200, { liked: true, count: 4 }),
);
const posts = mock((_params: { postId: string }) => ({ post: likePost }));
const push = mock((_href: string) => {});
const toast = { success: mock(), error: mock() };

mock.module("@/utils/eden", () => ({ api: { likes: { posts } } }));
mock.module("sonner", () => ({ toast }));

registerDom();
// 앱 라우터 밖에서는 useRouter·usePathname이 값을 주지 않으므로 필요한 것만 바꾸고, 나머지 내보내기는 그대로 둔다
const actualNavigation = await import("next/navigation");
mock.module("next/navigation", () => ({
	...actualNavigation,
	useRouter: () => ({ push }),
	usePathname: () => "/community/posts/post-1",
}));

const { cleanup, fireEvent, render, waitFor } = await import(
	"@testing-library/react"
);
const { LikeButton } = await import(
	"@/app/community/posts/[postId]/components"
);

function renderLikeButton({ isLoggedIn }: { isLoggedIn: boolean }) {
	return render(
		<LikeButton
			postId="post-1"
			initialLiked={false}
			initialCount={3}
			isLoggedIn={isLoggedIn}
		/>,
	);
}

describe("게시글 좋아요 버튼의 로그인 안내", () => {
	afterEach(cleanup);

	beforeEach(() => {
		for (const fn of [posts, likePost, push, toast.success, toast.error]) {
			fn.mockClear();
		}
	});

	test("로그인하지 않고 누르면 안내 토스트를 띄우고, 로그인 버튼은 이 글로 돌아오도록 로그인 화면으로 보낸다", () => {
		const view = renderLikeButton({ isLoggedIn: false });

		fireEvent.click(view.getByRole("button", { name: "좋아요 3개" }));

		expect(likePost).not.toHaveBeenCalled();
		expect(toast.error).toHaveBeenCalledTimes(1);
		const [message, options] = toast.error.mock.calls[0] as [
			string,
			{ action: { label: string; onClick: () => void } },
		];
		expect(message).toBe("로그인이 필요합니다");
		expect(options.action.label).toBe("로그인");

		options.action.onClick();

		expect(push).toHaveBeenCalledWith(
			"/login?redirect=%2Fcommunity%2Fposts%2Fpost-1",
		);
	});

	test("로그인했으면 안내 없이 좋아요를 요청한다", async () => {
		const view = renderLikeButton({ isLoggedIn: true });

		fireEvent.click(view.getByRole("button", { name: "좋아요 3개" }));

		await waitFor(() => expect(likePost).toHaveBeenCalledTimes(1));
		// 서버가 돌려준 개수로 바뀐다
		await view.findByRole("button", { name: "좋아요 4개" });
		expect(toast.error).not.toHaveBeenCalled();
		expect(push).not.toHaveBeenCalled();
	});
});
