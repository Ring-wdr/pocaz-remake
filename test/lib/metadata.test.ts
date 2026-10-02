import { describe, expect, test } from "bun:test";
import { createMetadata } from "@/lib/metadata";

const baseUrl = "https://pocaz.example";
const imageUrl = "https://cdn.example.com/markets/card.png";

describe("createMetadata의 공유 미리보기 이미지", () => {
	test("이미지를 주면 Open Graph와 Twitter 카드에 같은 주소를 넣는다", () => {
		const metadata = createMetadata({
			title: "르세라핌 포토카드",
			path: "/market/1",
			baseUrl,
			image: imageUrl,
		});

		expect(metadata.openGraph).toMatchObject({ images: [{ url: imageUrl }] });
		expect(metadata.twitter).toMatchObject({ images: [imageUrl] });
	});

	test("상대 경로는 사이트 주소를 붙여 절대 주소로 만든다", () => {
		const metadata = createMetadata({
			baseUrl,
			image: "/uploads/card.png",
		});

		expect(metadata.openGraph).toMatchObject({
			images: [{ url: "https://pocaz.example/uploads/card.png" }],
		});
		expect(metadata.twitter).toMatchObject({
			images: ["https://pocaz.example/uploads/card.png"],
		});
	});

	test("앞뒤 공백은 떼고, 한글 파일 이름은 주소로 쓸 수 있게 인코딩한다", () => {
		const metadata = createMetadata({
			baseUrl,
			image: "  https://cdn.example.com/채원.png  ",
		});

		expect(metadata.twitter).toMatchObject({
			images: ["https://cdn.example.com/%EC%B1%84%EC%9B%90.png"],
		});
	});

	test.each([
		["생략", undefined],
		["null", null],
		["빈 문자열", ""],
		["공백뿐인 문자열", "   "],
	])("이미지가 %s이면 images를 넣지 않는다", (_name, image) => {
		const metadata = createMetadata({ title: "제목", baseUrl, image });

		expect(metadata.openGraph).not.toHaveProperty("images");
		expect(metadata.twitter).not.toHaveProperty("images");
	});

	test.each([
		["javascript:alert(1)"],
		["data:image/png;base64,AAAA"],
		["ftp://example.com/card.png"],
		["http://"],
	])(
		"http(s) 주소가 아니거나 읽을 수 없는 값(%s)이면 이미지를 넣지 않는다",
		(image) => {
			const metadata = createMetadata({ baseUrl, image });

			expect(metadata.openGraph).not.toHaveProperty("images");
			expect(metadata.twitter).not.toHaveProperty("images");
		},
	);

	test("이미지 옵션은 나머지 필드를 바꾸지 않는다", () => {
		const options = {
			title: "르세라핌 포토카드",
			description: "설명",
			path: "/market/1",
			type: "article" as const,
			baseUrl,
		};

		const without = createMetadata(options);
		const withImage = createMetadata({ ...options, image: imageUrl });

		expect(withImage).toEqual({
			...without,
			openGraph: { ...without.openGraph, images: [{ url: imageUrl }] },
			twitter: { ...without.twitter, images: [imageUrl] },
		});
		expect(withImage.openGraph).toMatchObject({
			title: "르세라핌 포토카드",
			url: "https://pocaz.example/market/1",
			type: "article",
		});
	});
});
