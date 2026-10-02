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

const createRoom = mock(
	async (_body: { marketId: string }): Promise<unknown> =>
		edenResult(200, { id: "room-1" }),
);
const push = mock((_href: string) => {});
const toast = { success: mock(), error: mock(), info: mock() };

mock.module("@/utils/eden", () => ({
	api: { chat: { rooms: { market: { post: createRoom } } } },
}));
mock.module("sonner", () => ({ toast }));

registerDom();
// 앱 라우터 밖에서는 useRouter·usePathname이 값을 주지 않으므로 필요한 것만 바꾸고, 나머지 내보내기는 그대로 둔다
const actualNavigation = await import("next/navigation");
mock.module("next/navigation", () => ({
	...actualNavigation,
	useRouter: () => ({ push }),
	usePathname: () => "/market/market-1",
}));

const { cleanup, fireEvent, render, waitFor } = await import(
	"@testing-library/react"
);
const { ActionBar } = await import("@/app/market/[productId]/action-bar");

function renderActionBar({ loggedIn }: { loggedIn: boolean }) {
	return render(
		<ActionBar
			marketId="market-1"
			currentUserId={loggedIn ? "user-1" : null}
			isOwner={false}
			marketTitle="르세라핌 포토카드"
			initialLikeState={{ liked: false, count: 3, error: null }}
		/>,
	);
}

describe("상품 상세 액션바의 로그인 이동", () => {
	afterEach(cleanup);

	beforeEach(() => {
		for (const fn of [
			push,
			createRoom,
			toast.success,
			toast.error,
			toast.info,
		]) {
			fn.mockClear();
		}
	});

	test("로그인하지 않고 찜을 누르면 이 상품 상세로 돌아오도록 로그인 화면으로 보낸다", () => {
		const view = renderActionBar({ loggedIn: false });

		fireEvent.click(view.getByRole("button", { name: "찜 3회" }));

		expect(push).toHaveBeenCalledTimes(1);
		expect(push).toHaveBeenCalledWith("/login?redirect=%2Fmarket%2Fmarket-1");
	});

	test("로그인하지 않고 채팅하기를 누르면 이 상품 상세로 돌아오도록 로그인 화면으로 보낸다", async () => {
		const view = renderActionBar({ loggedIn: false });

		fireEvent.click(view.getByRole("button", { name: "채팅하기" }));

		await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
		expect(push).toHaveBeenCalledWith("/login?redirect=%2Fmarket%2Fmarket-1");
		expect(createRoom).not.toHaveBeenCalled();
	});

	test("로그인했으면 로그인 화면으로 보내지 않고 채팅방으로 이동한다", async () => {
		const view = renderActionBar({ loggedIn: true });

		fireEvent.click(view.getByRole("button", { name: "채팅하기" }));

		await waitFor(() => expect(push).toHaveBeenCalledWith("/chat/room-1"));
		expect(createRoom).toHaveBeenCalledWith({ marketId: "market-1" });
		for (const [href] of push.mock.calls) {
			expect(href).not.toContain("/login");
		}
	});
});
