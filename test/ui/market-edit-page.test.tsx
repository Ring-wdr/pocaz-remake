import {
	afterEach,
	beforeEach,
	describe,
	expect,
	mock,
	spyOn,
	test,
} from "bun:test";
import type { MarketFormValues } from "@/components/market/market-form";
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

/** 요청이 들어온 순서. 저장 단계의 순서를 확인하는 데 쓴다 */
const calls: string[] = [];

const put = mock(async (_body: Record<string, unknown>): Promise<unknown> => {
	calls.push("put");
	return edenResult(200, {});
});
const addImages = mock(
	async (_body: { imageUrls: string[] }): Promise<unknown> => {
		calls.push("add-images");
		return edenResult(200, { images: [] });
	},
);
const deleteImage = mock(
	async (params: { imageId: string }): Promise<unknown> => {
		calls.push(`delete:${params.imageId}`);
		return edenResult(200, { message: "Image deleted successfully" });
	},
);
const uploadFiles = mock(
	async (body: { bucket: string; files: File[] }): Promise<unknown> => {
		calls.push("upload");
		return edenResult(200, {
			uploaded: body.files.map((file, index) => ({
				index,
				path: `user/${file.name}`,
				publicUrl: `https://storage.test/markets/${file.name}`,
				fileName: file.name,
			})),
		});
	},
);
// api.markets({ id }).images.post(...) 와 api.markets({ id }).images({ imageId }).delete() 를 모두 받는다
const images = Object.assign(
	(params: { imageId: string }) => ({ delete: () => deleteImage(params) }),
	{ post: addImages },
);
const markets = mock((_params: { id: string }) => ({ put, images }));
const push = mock((_href: string) => {});
const refresh = mock(() => {});
const toast = { success: mock(), error: mock() };

mock.module("@/utils/eden", () => ({
	api: { markets, storage: { upload: { files: { post: uploadFiles } } } },
}));
mock.module("sonner", () => ({ toast }));

registerDom();
// 앱 라우터 밖에서는 useRouter가 예외를 던지므로 필요한 것만 가진 라우터로 바꾸고, 나머지 내보내기는 그대로 둔다
const actualNavigation = await import("next/navigation");
mock.module("next/navigation", () => ({
	...actualNavigation,
	useRouter: () => ({ push, refresh, back: () => {} }),
}));

const { cleanup, fireEvent, render, waitFor } = await import(
	"@testing-library/react"
);
const { QueryClient, QueryClientProvider } = await import(
	"@tanstack/react-query"
);
const { default: MarketEditPageClient } = await import(
	"@/app/market/[productId]/edit/page.client"
);

const existingImages = [
	{ id: "image-1", imageUrl: "https://storage.test/markets/a.png" },
	{ id: "image-2", imageUrl: "https://storage.test/markets/b.png" },
];

const initialValues = {
	title: "르세라핌 김채원 포카",
	description: "상세 설명",
	price: 15000,
	condition: "like-new",
	isNegotiable: false,
	groupId: null,
	artistId: null,
} as const;

const groups = [
	{
		id: "group-1",
		name: "르세라핌",
		artists: [
			{ id: "artist-1", name: "김채원" },
			{ id: "artist-2", name: "사쿠라" },
		],
	},
	{
		id: "group-2",
		name: "뉴진스",
		artists: [{ id: "artist-3", name: "민지" }],
	},
];

const INFO_FAILED =
	"상품 정보를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.";

let queryClient = new QueryClient();

function renderEditPage(values: MarketFormValues = initialValues) {
	const view = render(
		<QueryClientProvider client={queryClient}>
			<MarketEditPageClient
				marketId="market-1"
				initialValues={values}
				existingImages={existingImages}
				groups={groups}
			/>
		</QueryClientProvider>,
	);
	return {
		view,
		submit: () =>
			view.getByRole("button", { name: "저장하기" }) as HTMLButtonElement,
		title: () =>
			view.getByRole("textbox", { name: "상품명" }) as HTMLInputElement,
		price: () =>
			view.getByRole("textbox", { name: "가격" }) as HTMLInputElement,
		negotiable: () =>
			view.getByRole("checkbox", {
				name: "가격 협상 가능",
			}) as HTMLInputElement,
		removeImage: (index: number) =>
			fireEvent.click(
				view.getAllByRole("button", { name: "이미지 삭제" })[index],
			),
		pickFiles: (...files: File[]) =>
			fireEvent.change(view.getByLabelText("상품 이미지 업로드"), {
				target: { files },
			}),
	};
}

function imageFile(name: string) {
	return new File([new Uint8Array(4)], name, { type: "image/png" });
}

/** 저장 버튼을 누르고, 요청이 끝나 버튼이 다시 눌릴 수 있을 때까지 기다린다 */
async function save(page: ReturnType<typeof renderEditPage>) {
	fireEvent.click(page.submit());
	await waitFor(() => expect(page.submit().disabled).toBe(true));
	await waitFor(() => expect(page.submit().disabled).toBe(false));
}

describe("상품 수정 저장", () => {
	afterEach(cleanup);

	beforeEach(() => {
		queryClient = new QueryClient();
		calls.length = 0;
		for (const fn of [markets, push, refresh, toast.success, toast.error]) {
			fn.mockClear();
		}
		put.mockClear();
		addImages.mockClear();
		deleteImage.mockClear();
		uploadFiles.mockClear();
	});

	test("정보 저장, 새 이미지 업로드와 추가, 지운 이미지 삭제 순서로 저장하고 상세로 돌아간다", async () => {
		const invalidate = spyOn(queryClient, "invalidateQueries");
		const page = renderEditPage();
		fireEvent.change(page.title(), { target: { value: "  새 제목  " } });
		fireEvent.change(page.price(), { target: { value: "12000" } });
		fireEvent.click(page.negotiable());
		page.removeImage(0);
		const fresh = imageFile("fresh.png");
		page.pickFiles(fresh);

		fireEvent.click(page.submit());

		await waitFor(() =>
			expect(toast.success).toHaveBeenCalledWith("상품 정보를 수정했어요"),
		);
		expect(calls).toEqual(["put", "upload", "add-images", "delete:image-1"]);
		expect(markets).toHaveBeenCalledWith({ id: "market-1" });
		expect(put).toHaveBeenCalledWith({
			title: "새 제목",
			description: "상세 설명",
			price: 12000,
			condition: "like-new",
			isNegotiable: true,
			groupId: null,
			artistId: null,
		});
		expect(uploadFiles).toHaveBeenCalledWith({
			bucket: "markets",
			files: [fresh],
		});
		expect(addImages).toHaveBeenCalledWith({
			imageUrls: ["https://storage.test/markets/fresh.png"],
		});
		expect(deleteImage).toHaveBeenCalledWith({ imageId: "image-1" });
		expect(toast.error).not.toHaveBeenCalled();
		expect(push).toHaveBeenCalledTimes(1);
		expect(push).toHaveBeenCalledWith("/market/market-1");
		expect(refresh).toHaveBeenCalledTimes(1);
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["chat", "rooms"] });
		expect(invalidate).toHaveBeenCalledWith({
			queryKey: ["markets", "market-1", "info"],
		});
		await waitFor(() => expect(page.submit().disabled).toBe(false));
	});

	test("이미지를 건드리지 않으면 상품 정보만 저장한다", async () => {
		const page = renderEditPage();
		fireEvent.change(page.title(), { target: { value: "제목만 바꿈" } });

		fireEvent.click(page.submit());

		await waitFor(() => expect(toast.success).toHaveBeenCalled());
		expect(calls).toEqual(["put"]);
		expect(push).toHaveBeenCalledWith("/market/market-1");
	});

	test("가격을 비우고 협상 가능으로 저장하면 price: null로 가격을 지운다", async () => {
		const page = renderEditPage();
		fireEvent.change(page.price(), { target: { value: "" } });
		fireEvent.click(page.negotiable());

		fireEvent.click(page.submit());

		await waitFor(() => expect(toast.success).toHaveBeenCalled());
		expect(put).toHaveBeenCalledTimes(1);
		expect(put.mock.calls[0][0]).toMatchObject({
			price: null,
			isNegotiable: true,
		});
	});

	test("그룹·멤버 태그를 바꾸거나 풀면 groupId·artistId로 그대로 보낸다(풀 때는 null)", async () => {
		const tagged = {
			...initialValues,
			groupId: "group-1",
			artistId: "artist-1",
		};
		const page = renderEditPage(tagged);
		const groupSelect = () =>
			page.view.getByRole("combobox", { name: "그룹" }) as HTMLSelectElement;
		const artistSelect = () =>
			page.view.getByRole("combobox", { name: "멤버" }) as HTMLSelectElement;
		expect(groupSelect().value).toBe("group-1");
		expect(artistSelect().value).toBe("artist-1");

		// 손대지 않고 저장하면 기존 태그를 그대로 보낸다
		await save(page);
		expect(put.mock.calls[0][0]).toMatchObject({
			groupId: "group-1",
			artistId: "artist-1",
		});

		// 다른 그룹·멤버로 바꾼다
		fireEvent.change(groupSelect(), { target: { value: "group-2" } });
		fireEvent.change(artistSelect(), { target: { value: "artist-3" } });
		await save(page);
		expect(put.mock.calls[1][0]).toMatchObject({
			groupId: "group-2",
			artistId: "artist-3",
		});

		// 태그를 비운다
		fireEvent.change(groupSelect(), { target: { value: "" } });
		await save(page);
		expect(put).toHaveBeenCalledTimes(3);
		expect(put.mock.calls[2][0]).toMatchObject({
			groupId: null,
			artistId: null,
		});
		expect(toast.error).not.toHaveBeenCalled();
	});

	test.each([
		["500 응답", async () => edenResult(500, { error: "boom" })],
		[
			"네트워크 오류",
			async () => {
				throw new Error("network down");
			},
		],
	])(
		"정보 저장(%s)이 실패하면 안내만 하고 이미지에는 손대지 않는다",
		async (_label, failure) => {
			const logged = spyOn(console, "error").mockImplementation(() => {});
			put.mockImplementationOnce(async () => {
				calls.push("put");
				return failure();
			});
			const invalidate = spyOn(queryClient, "invalidateQueries");
			const page = renderEditPage();
			page.removeImage(0);
			page.pickFiles(imageFile("fresh.png"));

			await save(page);

			expect(toast.error).toHaveBeenCalledWith(INFO_FAILED);
			expect(toast.success).not.toHaveBeenCalled();
			expect(calls).toEqual(["put"]);
			expect(push).not.toHaveBeenCalled();
			expect(refresh).not.toHaveBeenCalled();
			// 아무것도 바뀌지 않았으니 캐시도 그대로 둔다
			expect(invalidate).not.toHaveBeenCalled();
			logged.mockRestore();
		},
	);

	test.each([
		[
			"서버가 거절",
			async () => edenResult(500, { error: "boom" }),
			"상품 정보는 저장했지만 이미지 업로드에 실패했습니다. 다시 시도해 주세요.",
		],
		[
			"일부 파일만 실패",
			async () =>
				edenResult(200, {
					uploaded: [],
					errors: [{ index: 0, fileName: "fresh.png", error: "x" }],
				}),
			"상품 정보는 저장했지만 일부 이미지 업로드에 실패했습니다. 파일을 확인해 주세요.",
		],
		[
			"네트워크 오류",
			async () => {
				throw new Error("network down");
			},
			"상품 정보는 저장했지만 이미지 업로드 중 오류가 발생했습니다.",
		],
	])(
		"이미지 업로드(%s)가 실패하면 정보는 저장됐다고 알리고, 이미지는 건드리지 않는다",
		async (_label, failure, message) => {
			const logged = spyOn(console, "error").mockImplementation(() => {});
			uploadFiles.mockImplementationOnce(async () => {
				calls.push("upload");
				return failure();
			});
			const invalidate = spyOn(queryClient, "invalidateQueries");
			const page = renderEditPage();
			page.removeImage(0);
			page.pickFiles(imageFile("fresh.png"));

			await save(page);

			expect(toast.error).toHaveBeenCalledWith(message);
			expect(calls).toEqual(["put", "upload"]);
			expect(push).not.toHaveBeenCalled();
			// 정보는 이미 바뀌었으니 채팅 쪽 캐시는 새로 받는다
			expect(invalidate).toHaveBeenCalledWith({ queryKey: ["chat", "rooms"] });

			// 다시 저장하면 이번에는 끝까지 간다
			calls.length = 0;
			await save(page);
			await waitFor(() => expect(toast.success).toHaveBeenCalled());
			expect(calls).toEqual(["put", "upload", "add-images", "delete:image-1"]);
			logged.mockRestore();
		},
	);

	test("새 이미지를 상품에 붙이지 못하면 기존 이미지는 지우지 않고, 다시 저장할 수 있다", async () => {
		const logged = spyOn(console, "error").mockImplementation(() => {});
		addImages.mockImplementationOnce(async () => {
			calls.push("add-images");
			return edenResult(500, { error: "boom" });
		});
		const page = renderEditPage();
		page.removeImage(0);
		page.pickFiles(imageFile("fresh.png"));

		await save(page);

		expect(toast.error).toHaveBeenCalledWith(
			"상품 정보는 저장했지만 새 이미지를 추가하지 못했어요. 다시 저장해 주세요.",
		);
		// 이미지가 0장이 되는 일이 없도록 삭제는 시작하지 않는다
		expect(calls).toEqual(["put", "upload", "add-images"]);
		expect(push).not.toHaveBeenCalled();

		calls.length = 0;
		await save(page);
		await waitFor(() =>
			expect(toast.success).toHaveBeenCalledWith("상품 정보를 수정했어요"),
		);
		expect(calls).toEqual(["put", "upload", "add-images", "delete:image-1"]);
		logged.mockRestore();
	});

	test("지운 이미지 삭제가 일부 실패하면 몇 장인지 알리고, 다시 저장할 때는 실패한 것만 지운다(새 이미지를 또 붙이지 않는다)", async () => {
		const logged = spyOn(console, "error").mockImplementation(() => {});
		deleteImage.mockImplementationOnce(async (params) => {
			calls.push(`delete:${params.imageId}`);
			return edenResult(500, { error: "boom" });
		});
		const page = renderEditPage();
		// 둘 다 지우고 새 이미지를 붙인다
		page.removeImage(1);
		page.removeImage(0);
		page.pickFiles(imageFile("fresh.png"));

		await save(page);

		expect(toast.error).toHaveBeenCalledWith(
			"상품 정보는 저장했지만 지운 이미지 1장을 삭제하지 못했어요. 다시 저장해 주세요.",
		);
		expect(calls.slice(0, 3)).toEqual(["put", "upload", "add-images"]);
		expect([...calls.slice(3)].sort()).toEqual([
			"delete:image-1",
			"delete:image-2",
		]);
		expect(push).not.toHaveBeenCalled();
		const failedId = calls[3];

		calls.length = 0;
		await save(page);
		await waitFor(() => expect(toast.success).toHaveBeenCalled());

		// 새 이미지는 이미 붙었으므로 다시 올리거나 붙이지 않고, 지우지 못한 이미지만 다시 지운다
		expect(calls).toEqual(["put", failedId]);
		expect(addImages).toHaveBeenCalledTimes(1);
		expect(uploadFiles).toHaveBeenCalledTimes(1);
		expect(push).toHaveBeenCalledWith("/market/market-1");
		logged.mockRestore();
	});

	test("이미 지워진 이미지(404)는 삭제된 것으로 본다", async () => {
		deleteImage.mockImplementationOnce(async (params) => {
			calls.push(`delete:${params.imageId}`);
			return edenResult(404, { error: "Image not found" });
		});
		const logged = spyOn(console, "error").mockImplementation(() => {});
		const page = renderEditPage();
		page.removeImage(0);

		fireEvent.click(page.submit());

		await waitFor(() =>
			expect(toast.success).toHaveBeenCalledWith("상품 정보를 수정했어요"),
		);
		expect(calls).toEqual(["put", "delete:image-1"]);
		expect(toast.error).not.toHaveBeenCalled();
		expect(push).toHaveBeenCalledWith("/market/market-1");
		logged.mockRestore();
	});

	test("저장하는 동안에는 버튼이 잠겨 한 번만 저장한다", async () => {
		let finish: (value: unknown) => void = () => {};
		put.mockImplementationOnce(() => {
			calls.push("put");
			return new Promise((resolve) => {
				finish = resolve;
			});
		});
		const page = renderEditPage();
		const button = page.submit();

		fireEvent.click(button);
		await waitFor(() => expect(button.disabled).toBe(true));
		fireEvent.click(button);
		expect(put).toHaveBeenCalledTimes(1);

		finish(edenResult(200, {}));
		await waitFor(() => expect(toast.success).toHaveBeenCalled());
		await waitFor(() => expect(button.disabled).toBe(false));
	});
});
