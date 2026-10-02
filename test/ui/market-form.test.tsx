import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import type { ComponentProps } from "react";
import type {
	MarketFormSubmitValues,
	MarketFormValues,
} from "@/components/market/market-form";
import { registerDom } from "../helpers/dom";

const back = mock(() => {});
const toast = { success: mock(), error: mock() };

mock.module("sonner", () => ({ toast }));

registerDom();
// 앱 라우터 밖에서는 useRouter가 예외를 던지므로 back만 가진 라우터로 바꾸고, 나머지 내보내기는 그대로 둔다
const actualNavigation = await import("next/navigation");
mock.module("next/navigation", () => ({
	...actualNavigation,
	useRouter: () => ({ back }),
}));

const { act, cleanup, fireEvent, render, waitFor, within } = await import(
	"@testing-library/react"
);
const { MarketForm } = await import("@/components/market/market-form");

/**
 * 요소가 화면에 있는지. 단언에 DOM 노드를 그대로 넘기면 실패했을 때 happy-dom 객체 전체가
 * 오류 메시지(수십 MB)로 찍혀 테스트가 멈춘 것처럼 보이므로, 불리언으로 바꿔서 넘긴다.
 */
function isShown(node: HTMLElement | null): boolean {
	return node !== null;
}

const existingImages = [
	{ id: "image-1", imageUrl: "https://storage.test/markets/a.png" },
	{ id: "image-2", imageUrl: "https://storage.test/markets/b.png" },
];

const filled: MarketFormValues = {
	title: "르세라핌 김채원 포카",
	description: "상세 설명",
	price: 15000,
	condition: "like-new",
	isNegotiable: true,
};

function imageFile(name = "new.png", type = "image/png", bytes = 4) {
	return new File([new Uint8Array(bytes)], name, { type });
}

function renderForm(props: Partial<ComponentProps<typeof MarketForm>> = {}) {
	const onSubmit = mock(async (_values: MarketFormSubmitValues) => {});
	const view = render(
		<MarketForm
			mode="edit"
			initialValues={filled}
			existingImages={existingImages}
			onSubmit={onSubmit}
			{...props}
		/>,
	);
	const submitName = props.mode === "create" ? "등록하기" : "저장하기";
	return {
		view,
		onSubmit,
		submit: () =>
			view.getByRole("button", { name: submitName }) as HTMLButtonElement,
		title: () =>
			view.getByRole("textbox", { name: "상품명" }) as HTMLInputElement,
		price: () =>
			view.getByRole("textbox", { name: "가격" }) as HTMLInputElement,
		negotiable: () =>
			view.getByRole("checkbox", {
				name: "가격 협상 가능",
			}) as HTMLInputElement,
		description: () =>
			// 라벨 안의 필수 표시(*)까지 이름에 들어가므로 앞부분만 맞춘다
			view.getByRole("textbox", {
				name: /^상품 설명/,
			}) as HTMLTextAreaElement,
		fileInput: () =>
			view.getByLabelText("상품 이미지 업로드") as HTMLInputElement,
		condition: (label: string) =>
			view.getByRole("button", { name: label }) as HTMLButtonElement,
		removeButtons: () => view.queryAllByRole("button", { name: "이미지 삭제" }),
		/** 파일 선택 창에서 파일을 고른 것처럼 change 이벤트를 보낸다 */
		pickFiles: (...files: File[]) =>
			fireEvent.change(view.getByLabelText("상품 이미지 업로드"), {
				target: { files },
			}),
		/** 미리보기 이미지의 alt 목록 */
		imageAlts: () =>
			view
				.queryAllByRole("img")
				.map((image) => image.getAttribute("alt") ?? ""),
		/** 대표 뱃지가 붙은 이미지의 src. 뱃지가 없거나 둘 이상이면 null */
		badgedImageSrc: () => {
			const badges = view.queryAllByText("대표");
			if (badges.length !== 1) return null;
			return badges[0].parentElement?.querySelector("img")?.getAttribute("src");
		},
	};
}

describe("상품 폼 (수정 모드)", () => {
	afterEach(cleanup);

	beforeEach(() => {
		for (const fn of [back, toast.success, toast.error]) {
			fn.mockClear();
		}
	});

	test("초기값이 폼에 채워지고 저장 버튼이 활성화되어 있다", () => {
		const form = renderForm();

		expect(isShown(form.view.queryByText("상품 수정"))).toBe(true);
		expect(form.title().value).toBe("르세라핌 김채원 포카");
		expect(form.price().value).toBe("15,000");
		expect(form.negotiable().checked).toBe(true);
		expect(form.description().value).toBe("상세 설명");
		expect(form.condition("거의 새것").getAttribute("aria-pressed")).toBe(
			"true",
		);
		for (const other of ["새 상품", "사용감 적음", "사용감 있음"]) {
			expect(form.condition(other).getAttribute("aria-pressed")).toBe("false");
		}
		expect(form.submit().disabled).toBe(false);
	});

	test("기존 이미지가 순서대로 보이고, 대표 뱃지는 첫 이미지에만 붙는다", () => {
		const form = renderForm();

		expect(form.imageAlts()).toEqual(["상품 이미지 1", "상품 이미지 2"]);
		expect(
			form.view.queryAllByRole("img").map((i) => i.getAttribute("src")),
		).toEqual(existingImages.map((image) => image.imageUrl));
		expect(form.view.queryAllByText("대표")).toHaveLength(1);
		expect(form.badgedImageSrc()).toBe(existingImages[0].imageUrl);
		expect(isShown(form.view.queryByText("2/10"))).toBe(true);
	});

	test("값이 없는 초기값(가격협의, 설명 없음)도 받는다", () => {
		const form = renderForm({
			initialValues: { ...filled, price: null, description: "" },
		});

		expect(form.price().value).toBe("");
		expect(form.negotiable().checked).toBe(true);
		expect(form.description().value).toBe("");
		// 설명이 비어 있으면 채우기 전까지 저장할 수 없다
		expect(form.submit().disabled).toBe(true);
	});

	test("마지막 남은 이미지를 지우면 저장 버튼이 비활성화되고, 눌러도 저장하지 않는다", () => {
		const form = renderForm({ existingImages: [existingImages[0]] });
		expect(form.submit().disabled).toBe(false);

		fireEvent.click(form.removeButtons()[0]);

		expect(form.removeButtons()).toHaveLength(0);
		expect(form.imageAlts()).toEqual([]);
		expect(isShown(form.view.queryByText("0/10"))).toBe(true);
		expect(form.submit().disabled).toBe(true);
		fireEvent.click(form.submit());
		expect(form.onSubmit).not.toHaveBeenCalled();
	});

	test("이미지 둘 중 하나를 지우면 저장할 수 있고, 대표 뱃지는 남은 첫 이미지로 옮겨 간다", () => {
		const form = renderForm();

		// 대표(첫 이미지)를 지운다
		fireEvent.click(form.removeButtons()[0]);

		expect(form.imageAlts()).toEqual(["상품 이미지 1"]);
		expect(
			form.view.queryAllByRole("img").map((i) => i.getAttribute("src")),
		).toEqual([existingImages[1].imageUrl]);
		expect(form.badgedImageSrc()).toBe(existingImages[1].imageUrl);
		expect(form.submit().disabled).toBe(false);
	});

	test("기존 이미지를 모두 지운 뒤 새 파일을 고르면 다시 저장할 수 있고, 새 파일이 대표가 된다", () => {
		const form = renderForm();
		fireEvent.click(form.removeButtons()[1]);
		fireEvent.click(form.removeButtons()[0]);
		expect(form.submit().disabled).toBe(true);

		form.pickFiles(imageFile("fresh.png"));

		expect(form.imageAlts()).toEqual(["상품 이미지 1"]);
		expect(form.view.queryAllByText("대표")).toHaveLength(1);
		expect(isShown(form.view.queryByText("1/10"))).toBe(true);
		expect(form.submit().disabled).toBe(false);
	});

	test("새 파일은 기존 이미지 뒤에 붙고, 지우면 사라진다", () => {
		const form = renderForm();

		form.pickFiles(imageFile("a.png"), imageFile("b.png"));

		expect(form.imageAlts()).toEqual([
			"상품 이미지 1",
			"상품 이미지 2",
			"상품 이미지 3",
			"상품 이미지 4",
		]);
		expect(form.badgedImageSrc()).toBe(existingImages[0].imageUrl);
		expect(isShown(form.view.queryByText("4/10"))).toBe(true);

		// 세 번째(새 파일 a) 이미지를 지운다
		fireEvent.click(form.removeButtons()[2]);

		expect(form.imageAlts()).toHaveLength(3);
		expect(isShown(form.view.queryByText("3/10"))).toBe(true);
	});

	test("저장하면 정리한 값과 새 파일, 삭제 표시한 기존 이미지 id를 넘긴다", async () => {
		const form = renderForm();
		fireEvent.change(form.title(), { target: { value: "  새 제목  " } });
		fireEvent.change(form.price(), { target: { value: "12000" } });
		fireEvent.click(form.condition("사용감 적음"));
		fireEvent.change(form.description(), {
			target: { value: "  새 설명\n두 번째 줄  " },
		});
		fireEvent.click(form.negotiable());
		fireEvent.click(form.removeButtons()[0]);
		const fresh = imageFile("fresh.png");
		form.pickFiles(fresh);

		fireEvent.click(form.submit());

		await waitFor(() => expect(form.onSubmit).toHaveBeenCalledTimes(1));
		const values = form.onSubmit.mock.calls[0][0];
		expect(values).toEqual({
			title: "새 제목",
			description: "새 설명\n두 번째 줄",
			price: 12000,
			condition: "good",
			isNegotiable: false,
			newFiles: [fresh],
			removedImageIds: ["image-1"],
		});
		expect(values.newFiles[0]).toBe(fresh);
	});

	test("가격을 비우고 협상 가능이면 price는 null이고, 협상 가능을 끄면 저장할 수 없다", async () => {
		const form = renderForm();

		fireEvent.change(form.price(), { target: { value: "" } });
		expect(form.submit().disabled).toBe(false);
		fireEvent.click(form.submit());
		await waitFor(() => expect(form.onSubmit).toHaveBeenCalledTimes(1));
		expect(form.onSubmit.mock.calls[0][0].price).toBeNull();

		fireEvent.click(form.negotiable());
		expect(form.negotiable().checked).toBe(false);
		await waitFor(() => expect(form.submit().disabled).toBe(true));
	});

	test("가격 칸에는 숫자만 들어가고 천 단위 쉼표가 붙는다", () => {
		const form = renderForm();

		fireEvent.change(form.price(), { target: { value: "1a2b3,456" } });

		expect(form.price().value).toBe("123,456");
	});

	test("상태를 아직 정하지 않은 상품은 상태를 고르기 전까지 저장할 수 없다", () => {
		const form = renderForm({ initialValues: { ...filled, condition: null } });

		for (const label of [
			"새 상품",
			"거의 새것",
			"사용감 적음",
			"사용감 있음",
		]) {
			expect(form.condition(label).getAttribute("aria-pressed")).toBe("false");
		}
		expect(form.submit().disabled).toBe(true);

		fireEvent.click(form.condition("새 상품"));

		expect(form.condition("새 상품").getAttribute("aria-pressed")).toBe("true");
		expect(form.submit().disabled).toBe(false);
	});

	test("제목이나 설명이 공백뿐이면 저장할 수 없다", () => {
		const form = renderForm();

		fireEvent.change(form.title(), { target: { value: "   " } });
		expect(form.submit().disabled).toBe(true);
		fireEvent.change(form.title(), { target: { value: "제목" } });
		expect(form.submit().disabled).toBe(false);

		fireEvent.change(form.description(), { target: { value: "  " } });
		expect(form.submit().disabled).toBe(true);
	});

	test("저장하는 동안에는 버튼이 잠기고 한 번만 저장하며, 끝나면 풀린다", async () => {
		let finish: () => void = () => {};
		const onSubmit = mock(
			() =>
				new Promise<void>((resolve) => {
					finish = resolve;
				}),
		);
		const form = renderForm({ onSubmit });
		const button = form.submit();

		fireEvent.click(button);

		await waitFor(() => expect(button.disabled).toBe(true));
		expect(button.getAttribute("aria-busy")).toBe("true");
		fireEvent.click(button);
		expect(onSubmit).toHaveBeenCalledTimes(1);

		await act(async () => finish());
		await waitFor(() => expect(button.disabled).toBe(false));
		expect(button.getAttribute("aria-busy")).toBe("false");
	});

	test("저장 함수가 예외를 던져도 오류 토스트만 띄우고 입력한 내용은 남는다", async () => {
		const onSubmit = mock(async () => {
			throw new Error("boom");
		});
		const logged = mock(() => {});
		const originalError = console.error;
		console.error = logged;
		try {
			const form = renderForm({ onSubmit });
			fireEvent.change(form.title(), { target: { value: "고친 제목" } });
			const button = form.submit();

			fireEvent.click(button);

			await waitFor(() =>
				expect(toast.error).toHaveBeenCalledWith(
					"처리 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.",
				),
			);
			await waitFor(() => expect(button.disabled).toBe(false));
			expect(form.title().value).toBe("고친 제목");
		} finally {
			console.error = originalError;
		}
	});

	test("남아 있는 이미지와 새 파일을 합쳐 10장이 되면 더 고를 수 없다", () => {
		const tenImages = Array.from({ length: 10 }, (_, index) => ({
			id: `image-${index}`,
			imageUrl: `https://storage.test/markets/${index}.png`,
		}));
		const form = renderForm({ existingImages: tenImages });

		form.pickFiles(imageFile("extra.png"));

		expect(toast.error).toHaveBeenCalledWith(
			"이미지는 최대 10개까지 업로드할 수 있어요.",
		);
		expect(form.imageAlts()).toHaveLength(10);

		// 하나를 지우면 한 장 더 고를 수 있다
		fireEvent.click(form.removeButtons()[0]);
		toast.error.mockClear();
		form.pickFiles(imageFile("extra.png"), imageFile("extra2.png"));

		expect(toast.error).not.toHaveBeenCalled();
		expect(form.imageAlts()).toHaveLength(10);
	});

	test("이미지가 아닌 파일과 20MB를 넘는 파일은 걸러내고 이유를 알린다", () => {
		const form = renderForm();

		form.pickFiles(imageFile("note.txt", "text/plain"));
		expect(toast.error).toHaveBeenLastCalledWith(
			"이미지 파일만 업로드할 수 있어요.",
		);
		expect(form.imageAlts()).toHaveLength(2);

		form.pickFiles(imageFile("huge.png", "image/png", 20 * 1024 * 1024 + 1));
		expect(toast.error).toHaveBeenLastCalledWith(
			"huge.png 파일이 너무 큽니다. 최대 20MB까지 업로드할 수 있어요.",
		);
		expect(form.imageAlts()).toHaveLength(2);
	});

	test("뒤로 가기 버튼은 이전 화면으로 돌아간다", () => {
		const form = renderForm();

		fireEvent.click(form.view.getByRole("button", { name: "뒤로 가기" }));

		expect(back).toHaveBeenCalledTimes(1);
	});
});

describe("상품 폼 (등록 모드)", () => {
	afterEach(cleanup);

	beforeEach(() => {
		for (const fn of [back, toast.success, toast.error]) {
			fn.mockClear();
		}
	});

	function renderCreateForm() {
		return renderForm({
			mode: "create",
			initialValues: undefined,
			existingImages: undefined,
		});
	}

	test("빈 폼으로 시작하고 등록 버튼은 잠겨 있다", () => {
		const form = renderCreateForm();

		expect(isShown(form.view.queryByText("상품 등록"))).toBe(true);
		expect(form.title().value).toBe("");
		expect(form.price().value).toBe("");
		expect(form.negotiable().checked).toBe(false);
		expect(form.description().value).toBe("");
		expect(form.imageAlts()).toEqual([]);
		expect(isShown(form.view.queryByText("0/10"))).toBe(true);
		expect(form.submit().disabled).toBe(true);
	});

	test("이미지·상품명·가격·상태·설명을 모두 채워야 등록할 수 있다", () => {
		const form = renderCreateForm();

		form.pickFiles(imageFile());
		expect(form.submit().disabled).toBe(true);
		fireEvent.change(form.title(), { target: { value: "제목" } });
		expect(form.submit().disabled).toBe(true);
		fireEvent.change(form.price(), { target: { value: "1000" } });
		expect(form.submit().disabled).toBe(true);
		fireEvent.click(form.condition("새 상품"));
		expect(form.submit().disabled).toBe(true);
		fireEvent.change(form.description(), { target: { value: "설명" } });

		expect(form.submit().disabled).toBe(false);
	});

	test("가격 없이도 협상 가능을 켜면 등록할 수 있다", () => {
		const form = renderCreateForm();
		form.pickFiles(imageFile());
		fireEvent.change(form.title(), { target: { value: "제목" } });
		fireEvent.click(form.condition("새 상품"));
		fireEvent.change(form.description(), { target: { value: "설명" } });
		expect(form.submit().disabled).toBe(true);

		fireEvent.click(form.negotiable());

		expect(form.submit().disabled).toBe(false);
	});

	test("등록하면 새 파일과 입력값을 넘기고, 지울 기존 이미지는 없다", async () => {
		const form = renderCreateForm();
		const first = imageFile("first.png");
		const second = imageFile("second.png");
		form.pickFiles(first, second);
		fireEvent.change(form.title(), { target: { value: "제목" } });
		fireEvent.change(form.price(), { target: { value: "1500" } });
		fireEvent.click(form.condition("사용감 있음"));
		fireEvent.change(form.description(), { target: { value: "설명" } });

		fireEvent.click(form.submit());

		await waitFor(() => expect(form.onSubmit).toHaveBeenCalledTimes(1));
		expect(form.onSubmit.mock.calls[0][0]).toEqual({
			title: "제목",
			description: "설명",
			price: 1500,
			condition: "used",
			isNegotiable: false,
			newFiles: [first, second],
			removedImageIds: [],
		});
		// 새 파일만 있어도 첫 이미지가 대표다
		expect(form.view.queryAllByText("대표")).toHaveLength(1);
	});

	test("새로 고른 이미지를 지우면 대표 뱃지가 다음 이미지로 옮겨 간다", () => {
		const form = renderCreateForm();
		form.pickFiles(imageFile("first.png"), imageFile("second.png"));
		const [firstPreview, secondPreview] = form.view
			.queryAllByRole("img")
			.map((image) => image.getAttribute("src"));
		expect(form.badgedImageSrc()).toBe(firstPreview);

		fireEvent.click(form.removeButtons()[0]);

		expect(form.imageAlts()).toEqual(["상품 이미지 1"]);
		expect(form.badgedImageSrc()).toBe(secondPreview);
		expect(
			within(form.view.container).queryAllByRole("button", {
				name: "이미지 삭제",
			}),
		).toHaveLength(1);
	});
});
