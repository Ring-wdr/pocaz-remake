import {
	afterEach,
	beforeEach,
	describe,
	expect,
	mock,
	spyOn,
	test,
} from "bun:test";
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

const uploadFiles = mock(
	async (body: { bucket: string; files: File[] }): Promise<unknown> =>
		edenResult(200, {
			uploaded: body.files.map((file, index) => ({
				index,
				path: `user/${file.name}`,
				publicUrl: `https://storage.test/markets/${file.name}`,
				fileName: file.name,
			})),
		}),
);
const createMarket = mock(
	async (_body: Record<string, unknown>): Promise<unknown> =>
		edenResult(201, { id: "market-1" }),
);
const push = mock((_href: string) => {});
const toast = { success: mock(), error: mock() };

mock.module("@/utils/eden", () => ({
	api: {
		markets: { post: createMarket },
		storage: { upload: { files: { post: uploadFiles } } },
	},
}));
mock.module("sonner", () => ({ toast }));

registerDom();
// 앱 라우터 밖에서는 useRouter가 예외를 던지므로 필요한 것만 가진 라우터로 바꾸고, 나머지 내보내기는 그대로 둔다
const actualNavigation = await import("next/navigation");
mock.module("next/navigation", () => ({
	...actualNavigation,
	useRouter: () => ({ push, back: () => {} }),
}));

const { cleanup, fireEvent, render, waitFor } = await import(
	"@testing-library/react"
);
const { default: MarketRegisterPage } = await import(
	"@/app/market/register/page.client"
);

const CREATE_FAILED = "상품 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.";

const groups = [
	{
		id: "group-1",
		name: "르세라핌",
		artists: [
			{ id: "artist-1", name: "김채원" },
			{ id: "artist-2", name: "사쿠라" },
		],
	},
];

function imageFile(name: string) {
	return new File([new Uint8Array(4)], name, { type: "image/png" });
}

/** 등록 폼을 그리고, 모든 항목을 채운다(가격과 협상 가능은 옵션, 아티스트 태그는 고르지 않는다) */
function renderFilledForm({
	price = "15000",
	negotiable = false,
}: {
	price?: string;
	negotiable?: boolean;
} = {}) {
	const view = render(<MarketRegisterPage groups={groups} />);
	const files = [imageFile("first.png"), imageFile("second.png")];
	fireEvent.change(view.getByLabelText("상품 이미지 업로드"), {
		target: { files },
	});
	fireEvent.change(view.getByRole("textbox", { name: "상품명" }), {
		target: { value: "  르세라핌 김채원 포카  " },
	});
	fireEvent.change(view.getByRole("textbox", { name: "가격" }), {
		target: { value: price },
	});
	if (negotiable) {
		fireEvent.click(view.getByRole("checkbox", { name: "가격 협상 가능" }));
	}
	fireEvent.click(view.getByRole("button", { name: "거의 새것" }));
	fireEvent.change(view.getByRole("textbox", { name: /^상품 설명/ }), {
		target: { value: "  상세 설명  " },
	});
	return {
		view,
		files,
		submit: () =>
			view.getByRole("button", { name: "등록하기" }) as HTMLButtonElement,
	};
}

describe("상품 등록 저장", () => {
	afterEach(cleanup);

	beforeEach(() => {
		for (const fn of [push, toast.success, toast.error]) {
			fn.mockClear();
		}
		uploadFiles.mockClear();
		createMarket.mockReset();
		createMarket.mockImplementation(async () =>
			edenResult(201, { id: "market-1" }),
		);
	});

	test("이미지를 올린 뒤 올린 주소로 상품을 만들고, 토스트와 함께 마켓 목록으로 이동한다", async () => {
		const { files, submit } = renderFilledForm();

		fireEvent.click(submit());

		await waitFor(() =>
			expect(toast.success).toHaveBeenCalledWith("상품을 등록했습니다."),
		);
		expect(uploadFiles).toHaveBeenCalledTimes(1);
		expect(uploadFiles).toHaveBeenCalledWith({ bucket: "markets", files });
		expect(createMarket).toHaveBeenCalledTimes(1);
		expect(createMarket).toHaveBeenCalledWith({
			title: "르세라핌 김채원 포카",
			description: "상세 설명",
			price: 15000,
			condition: "like-new",
			isNegotiable: false,
			imageUrls: [
				"https://storage.test/markets/first.png",
				"https://storage.test/markets/second.png",
			],
		});
		expect(toast.error).not.toHaveBeenCalled();
		expect(push).toHaveBeenCalledTimes(1);
		expect(push).toHaveBeenCalledWith("/market");
		const body = createMarket.mock.calls[0][0];
		expect(body.groupId).toBeUndefined();
		expect(body.artistId).toBeUndefined();
	});

	test("그룹과 멤버를 고르면 groupId·artistId를 함께 보내고, 고르지 않으면 보내지 않는다", async () => {
		const tagged = renderFilledForm();
		fireEvent.change(tagged.view.getByRole("combobox", { name: "그룹" }), {
			target: { value: "group-1" },
		});
		fireEvent.change(tagged.view.getByRole("combobox", { name: "멤버" }), {
			target: { value: "artist-1" },
		});

		fireEvent.click(tagged.submit());

		await waitFor(() => expect(toast.success).toHaveBeenCalled());
		expect(createMarket.mock.calls[0][0]).toMatchObject({
			groupId: "group-1",
			artistId: "artist-1",
		});
		cleanup();

		// 그룹만 고르면 멤버는 보내지 않는다
		createMarket.mockClear();
		const groupOnly = renderFilledForm();
		fireEvent.change(groupOnly.view.getByRole("combobox", { name: "그룹" }), {
			target: { value: "group-1" },
		});
		fireEvent.click(groupOnly.submit());

		await waitFor(() => expect(createMarket).toHaveBeenCalledTimes(1));
		const body = createMarket.mock.calls[0][0];
		expect(body.groupId).toBe("group-1");
		expect(body.artistId).toBeUndefined();
	});

	test("가격을 비우고 협상 가능으로 등록하면 price 없이 보낸다", async () => {
		const { submit } = renderFilledForm({ price: "", negotiable: true });

		fireEvent.click(submit());

		await waitFor(() => expect(toast.success).toHaveBeenCalled());
		const body = createMarket.mock.calls[0][0];
		expect(body.price).toBeUndefined();
		expect(body.isNegotiable).toBe(true);
	});

	test.each([
		[
			"서버가 거절",
			async () => edenResult(500, { error: "boom" }),
			"이미지 업로드에 실패했습니다. 다시 시도해 주세요.",
		],
		[
			"일부 파일만 실패",
			async () =>
				edenResult(200, {
					uploaded: [],
					errors: [{ index: 0, fileName: "first.png", error: "x" }],
				}),
			"일부 이미지 업로드에 실패했습니다. 파일을 확인해 주세요.",
		],
		[
			"올라간 파일이 없음",
			async () => edenResult(200, { uploaded: [] }),
			"업로드된 이미지가 없습니다.",
		],
		[
			"네트워크 오류",
			async () => {
				throw new Error("network down");
			},
			"이미지 업로드 중 오류가 발생했습니다.",
		],
	])(
		"이미지 업로드(%s)가 실패하면 상품을 만들지 않고 이유를 알린다",
		async (_label, failure, message) => {
			const logged = spyOn(console, "error").mockImplementation(() => {});
			uploadFiles.mockImplementationOnce(failure);
			const { submit } = renderFilledForm();

			fireEvent.click(submit());

			await waitFor(() => expect(toast.error).toHaveBeenCalledWith(message));
			await waitFor(() => expect(submit().disabled).toBe(false));
			expect(createMarket).not.toHaveBeenCalled();
			expect(toast.success).not.toHaveBeenCalled();
			expect(push).not.toHaveBeenCalled();
			logged.mockRestore();
		},
	);

	test.each([
		["500 응답", async () => edenResult(500, { error: "boom" })],
		[
			"네트워크 오류",
			async () => {
				throw new Error("network down");
			},
		],
	])(
		"상품 생성(%s)이 실패하면 안내하고 이동하지 않으며 다시 등록할 수 있다",
		async (_label, failure) => {
			const logged = spyOn(console, "error").mockImplementation(() => {});
			createMarket.mockImplementationOnce(failure);
			const { submit } = renderFilledForm();

			fireEvent.click(submit());

			await waitFor(() =>
				expect(toast.error).toHaveBeenCalledWith(CREATE_FAILED),
			);
			await waitFor(() => expect(submit().disabled).toBe(false));
			expect(toast.success).not.toHaveBeenCalled();
			expect(push).not.toHaveBeenCalled();

			// 입력한 내용이 그대로라서 다시 누르면 등록된다
			fireEvent.click(submit());
			await waitFor(() => expect(push).toHaveBeenCalledWith("/market"));
			expect(createMarket).toHaveBeenCalledTimes(2);
			logged.mockRestore();
		},
	);

	test("등록하는 동안에는 버튼이 잠겨 한 번만 등록한다", async () => {
		let finish: (value: unknown) => void = () => {};
		createMarket.mockImplementationOnce(
			() =>
				new Promise((resolve) => {
					finish = resolve;
				}),
		);
		const { submit } = renderFilledForm();
		const button = submit();

		fireEvent.click(button);
		await waitFor(() => expect(createMarket).toHaveBeenCalledTimes(1));
		expect(button.disabled).toBe(true);
		fireEvent.click(button);
		expect(createMarket).toHaveBeenCalledTimes(1);

		finish(edenResult(201, { id: "market-1" }));
		await waitFor(() => expect(push).toHaveBeenCalledWith("/market"));
	});
});
