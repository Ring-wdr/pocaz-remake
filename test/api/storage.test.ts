import { beforeEach, describe, expect, test } from "bun:test";
import { callApi, type TestUser } from "../helpers/api";
import {
	imageBytes,
	resetStorageCalls,
	storageCalls,
} from "../helpers/storage";

const uploader: TestUser = {
	id: "8a6e0804-2bd0-4672-b79d-d97358d4ac31",
	email: "uploader@example.com",
};

function form(bucket: string, field: "file" | "files", files: File[]) {
	const data = new FormData();
	data.set("bucket", bucket);
	for (const file of files) {
		data.append(field, file);
	}
	return data;
}

describe("storage 업로드", () => {
	beforeEach(resetStorageCalls);

	test("업로더 ID 아래에 서버가 만든 이름으로 저장한다", async () => {
		const file = new File([imageBytes.png], "../../남의폴더/사진.png", {
			type: "image/png",
		});

		const res = await callApi("POST", "/storage/upload/file", {
			user: uploader,
			body: form("markets", "file", [file]),
		});

		expect(res.status).toBe(200);
		expect(storageCalls.uploads).toHaveLength(1);
		const [{ bucket, path }] = storageCalls.uploads;
		expect(bucket).toBe("markets");
		expect(path.startsWith(`${uploader.id}/`)).toBe(true);
		expect(path).toMatch(/\.png$/);
		expect(path).not.toContain("사진");
		expect(path).not.toContain("..");
	});

	test("Content-Type은 클라이언트가 보낸 값이 아니라 파일 내용으로 정한다", async () => {
		const file = new File([imageBytes.png], "a.jpg", { type: "image/jpeg" });

		await callApi("POST", "/storage/upload/file", {
			user: uploader,
			body: form("posts", "file", [file]),
		});

		expect(storageCalls.uploads[0]?.contentType).toBe("image/png");
		expect(storageCalls.uploads[0]?.path).toMatch(/\.png$/);
	});

	test("SVG와 이미지가 아닌 파일은 MIME을 속여도 거부한다", async () => {
		const svg = new File([imageBytes.svg], "x.svg", { type: "image/svg+xml" });
		const fake = new File(["<html>"], "x.png", { type: "image/png" });

		const single = await callApi("POST", "/storage/upload/file", {
			user: uploader,
			body: form("images", "file", [svg]),
		});
		const multi = await callApi("POST", "/storage/upload/files", {
			user: uploader,
			body: form("images", "files", [fake, svg]),
		});

		expect(single.status).toBe(400);
		expect(multi.status).toBe(200);
		expect(multi.body.uploaded).toEqual([]);
		expect(multi.body.errors).toHaveLength(2);
		expect(storageCalls.uploads).toHaveLength(0);
	});

	test("여러 파일 업로드는 형식별로 처리하고 10개를 넘으면 거부한다", async () => {
		const ok = await callApi("POST", "/storage/upload/files", {
			user: uploader,
			body: form("posts", "files", [
				new File([imageBytes.jpeg], "a.jpg", { type: "image/jpeg" }),
				new File([imageBytes.gif], "b.gif", { type: "image/gif" }),
				new File([imageBytes.webp], "c.webp", { type: "image/webp" }),
			]),
		});
		expect(ok.status).toBe(200);
		expect(storageCalls.uploads.map((u) => u.contentType)).toEqual([
			"image/jpeg",
			"image/gif",
			"image/webp",
		]);

		const tooMany = Array.from(
			{ length: 11 },
			(_, i) => new File([imageBytes.png], `${i}.png`, { type: "image/png" }),
		);
		const rejected = await callApi("POST", "/storage/upload/files", {
			user: uploader,
			body: form("posts", "files", tooMany),
		});
		expect(rejected.status).toBe(422);
		expect(storageCalls.uploads).toHaveLength(3);
	});

	test("로그인하지 않으면 업로드할 수 없다", async () => {
		const res = await callApi("POST", "/storage/upload/file", {
			body: form("posts", "file", [
				new File([imageBytes.png], "a.png", { type: "image/png" }),
			]),
		});
		expect(res.status).toBe(401);
	});
});

describe("소유권 없이 열려 있던 스토리지 라우트는 제거됐다", () => {
	const removed: [string, string, unknown][] = [
		["DELETE", "/storage/delete", { bucket: "markets", paths: ["x.png"] }],
		["POST", "/storage/signed-url", { bucket: "images", path: "x.png" }],
		["POST", "/storage/url", { bucket: "images", path: "x.png" }],
		["GET", "/storage/list/images", undefined],
		[
			"POST",
			"/storage/upload",
			{
				bucket: "images",
				base64Data: "AA==",
				fileName: "a.png",
				contentType: "image/png",
			},
		],
		["POST", "/storage/upload/multiple", { bucket: "images", files: [] }],
	];

	for (const [method, path, body] of removed) {
		test(`${method} ${path} → 404`, async () => {
			const res = await callApi(method, path, { user: uploader, body });
			expect(res.status).toBe(404);
		});
	}
});
