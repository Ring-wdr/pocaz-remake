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
const toggleLike = mock(
	async (): Promise<unknown> => edenResult(200, { liked: true, count: 4 }),
);
const push = mock((_href: string) => {});
const toast = { success: mock(), error: mock(), info: mock() };

mock.module("@/utils/eden", () => ({
	api: {
		chat: { rooms: { market: { post: createRoom } } },
		likes: {
			markets: (_params: { marketId: string }) => ({ post: toggleLike }),
		},
	},
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

function renderActionBar({
	loggedIn,
	isOwner = false,
	liked = false,
	count = 3,
}: {
	loggedIn: boolean;
	isOwner?: boolean;
	liked?: boolean;
	count?: number;
}) {
	return render(
		<ActionBar
			marketId="market-1"
			currentUserId={loggedIn ? "user-1" : null}
			isOwner={isOwner}
			marketTitle="르세라핌 포토카드"
			initialLikeState={{ liked, count, error: null }}
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

describe("상품 상세 액션바의 찜 수", () => {
	afterEach(cleanup);

	beforeEach(() => {
		for (const fn of [
			push,
			toggleLike,
			toast.success,
			toast.error,
			toast.info,
		]) {
			fn.mockClear();
		}
		toggleLike.mockImplementation(async () =>
			edenResult(200, { liked: true, count: 4 }),
		);
	});

	test("하트 옆에 찜 수를 숫자로 보여 주고, 버튼 이름은 그대로 읽어 준다", () => {
		const view = renderActionBar({ loggedIn: false, count: 3 });

		const like = view.getByRole("button", { name: "찜 3회" });
		expect(like.textContent).toBe("3");
		expect(like.getAttribute("aria-pressed")).toBe("false");
	});

	test("찜이 없으면 0을 보여 준다", () => {
		const view = renderActionBar({ loggedIn: false, count: 0 });

		const like = view.getByRole("button", { name: "찜 0회" });
		expect(like.textContent).toBe("0");
	});

	test("찜하면 서버 응답을 기다리지 않고 숫자를 하나 올리고, 응답이 오면 서버 값으로 맞춘다", async () => {
		let respond: (value: unknown) => void = () => {};
		toggleLike.mockImplementationOnce(
			() =>
				new Promise((resolve) => {
					respond = resolve;
				}),
		);
		const view = renderActionBar({ loggedIn: true, count: 3 });

		fireEvent.click(view.getByRole("button", { name: "찜 3회" }));

		// 응답 전: 낙관적으로 올라간 숫자와 눌린 상태
		const pending = await view.findByRole("button", { name: "찜 4회" });
		expect(pending.textContent).toBe("4");
		expect(pending.getAttribute("aria-pressed")).toBe("true");
		await waitFor(() => expect(toggleLike).toHaveBeenCalledTimes(1));

		// 그 사이 다른 사람도 찜해서 서버는 5를 돌려준다
		respond(edenResult(200, { liked: true, count: 5 }));
		const settled = await view.findByRole("button", { name: "찜 5회" });
		expect(settled.textContent).toBe("5");
		expect(settled.getAttribute("aria-pressed")).toBe("true");
		expect(toast.error).not.toHaveBeenCalled();
	});

	test("찜을 취소하면 숫자가 하나 줄어든다", async () => {
		toggleLike.mockImplementationOnce(async () =>
			edenResult(200, { liked: false, count: 2 }),
		);
		const view = renderActionBar({ loggedIn: true, liked: true, count: 3 });

		fireEvent.click(view.getByRole("button", { name: "찜 3회" }));

		const like = await view.findByRole("button", { name: "찜 2회" });
		expect(like.textContent).toBe("2");
		expect(like.getAttribute("aria-pressed")).toBe("false");
	});

	test("내 상품은 찜할 수 없어서 숫자가 그대로다", () => {
		const view = renderActionBar({ loggedIn: true, isOwner: true, count: 3 });

		fireEvent.click(view.getByRole("button", { name: "찜 3회" }));

		expect(toast.info).toHaveBeenCalledWith("내 상품은 찜할 수 없어요.");
		expect(view.getByRole("button", { name: "찜 3회" }).textContent).toBe("3");
		expect(toggleLike).not.toHaveBeenCalled();
	});
});
