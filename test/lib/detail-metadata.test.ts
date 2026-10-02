import { beforeEach, describe, expect, mock, test } from "bun:test";

const getMarket = mock(
	async (): Promise<unknown> => ({
		data: null,
		error: { status: 404 },
	}),
);
const getPost = mock(
	async (): Promise<unknown> => ({
		data: null,
		error: { status: 404 },
	}),
);

mock.module("@/utils/eden", () => ({
	api: {
		markets: (_params: { id: string }) => ({ get: getMarket }),
		posts: (_params: { id: string }) => ({ get: getPost }),
	},
}));

const { generateMetadata: generateMarketMetadata } = await import(
	"@/app/market/[productId]/page"
);
const { generateMetadata: generatePostMetadata } = await import(
	"@/app/community/posts/[postId]/page"
);

const FIRST = "https://cdn.example.com/first.png";
const SECOND = "https://cdn.example.com/second.png";

const images = (...urls: string[]) =>
	urls.map((imageUrl, index) => ({ id: `image-${index}`, imageUrl }));

const market = (urls: string[]) => ({
	id: "market-1",
	title: "르세라핌 김채원 포카",
	description: "상세 설명",
	price: 15000,
	user: { id: "seller-1", nickname: "판매자", profileImage: null },
	images: images(...urls),
});

const post = (urls: string[]) => ({
	id: "post-1",
	content: "오늘 받은 포카 자랑",
	user: { id: "user-1", nickname: "작성자", profileImage: null },
	images: images(...urls),
});

describe("상품 상세의 공유 미리보기", () => {
	beforeEach(() => getMarket.mockReset());

	test("첫 번째 이미지를 Open Graph와 Twitter 카드 이미지로 쓴다", async () => {
		getMarket.mockResolvedValue({ data: market([FIRST, SECOND]), error: null });

		const metadata = await generateMarketMetadata({
			params: Promise.resolve({ productId: "market-1" }),
		} as never);

		expect(metadata.openGraph).toMatchObject({ images: [{ url: FIRST }] });
		expect(metadata.twitter).toMatchObject({ images: [FIRST] });
	});

	test("이미지가 없는 상품은 이미지를 넣지 않는다", async () => {
		getMarket.mockResolvedValue({ data: market([]), error: null });

		const metadata = await generateMarketMetadata({
			params: Promise.resolve({ productId: "market-1" }),
		} as never);

		expect(metadata.title).toBe("르세라핌 김채원 포카 | POCAZ 마켓");
		expect(metadata.openGraph).not.toHaveProperty("images");
		expect(metadata.twitter).not.toHaveProperty("images");
	});

	test("없는 상품은 이미지 없이 안내 문구만 둔다", async () => {
		getMarket.mockResolvedValue({ data: null, error: { status: 404 } });

		const metadata = await generateMarketMetadata({
			params: Promise.resolve({ productId: "missing" }),
		} as never);

		expect(metadata.title).toBe("상품을 찾을 수 없습니다 | POCAZ");
		expect(metadata.openGraph).not.toHaveProperty("images");
	});
});

describe("게시글 상세의 공유 미리보기", () => {
	beforeEach(() => getPost.mockReset());

	test("첫 번째 이미지를 Open Graph와 Twitter 카드 이미지로 쓴다", async () => {
		getPost.mockResolvedValue({ data: post([FIRST, SECOND]), error: null });

		const metadata = await generatePostMetadata({
			params: Promise.resolve({ postId: "post-1" }),
		} as never);

		expect(metadata.openGraph).toMatchObject({
			type: "article",
			images: [{ url: FIRST }],
		});
		expect(metadata.twitter).toMatchObject({ images: [FIRST] });
	});

	test("이미지가 없는 게시글은 이미지를 넣지 않는다", async () => {
		getPost.mockResolvedValue({ data: post([]), error: null });

		const metadata = await generatePostMetadata({
			params: Promise.resolve({ postId: "post-1" }),
		} as never);

		expect(metadata.title).toBe("작성자의 게시글 | POCAZ 커뮤니티");
		expect(metadata.openGraph).not.toHaveProperty("images");
		expect(metadata.twitter).not.toHaveProperty("images");
	});

	test("없는 게시글은 이미지 없이 안내 문구만 둔다", async () => {
		getPost.mockResolvedValue({ data: null, error: { status: 404 } });

		const metadata = await generatePostMetadata({
			params: Promise.resolve({ postId: "missing" }),
		} as never);

		expect(metadata.title).toBe("게시글을 찾을 수 없습니다 | POCAZ");
		expect(metadata.openGraph).not.toHaveProperty("images");
	});
});
