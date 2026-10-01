import { Elysia, t } from "elysia";

import { authGuard } from "@/lib/elysia/auth";
import {
	detectImageType,
	STORAGE_BUCKETS,
	type StorageBucket,
	storageService,
} from "@/lib/services/storage";

/**
 * 파일 하나의 최대 크기 (20MB). 화면별로 더 작은 제한은 클라이언트가 안내한다.
 */
const MAX_FILE_SIZE = 20 * 1024 * 1024;

/**
 * 한 번에 올릴 수 있는 파일 수
 */
const MAX_FILES = 10;

const SUPPORTED_TYPES = "JPEG, PNG, GIF, WebP";

const validBuckets = Object.values(STORAGE_BUCKETS);

function isBucket(value: string): value is StorageBucket {
	return validBuckets.includes(value as StorageBucket);
}

/**
 * 크기와 실제 형식을 검사한다. 통과하면 업로드할 바이트와 형식을 돌려준다.
 */
async function readImage(file: File) {
	if (file.size > MAX_FILE_SIZE) {
		return { ok: false, error: "File too large" } as const;
	}
	const bytes = new Uint8Array(await file.arrayBuffer());
	const type = detectImageType(bytes);
	if (!type) {
		return { ok: false, error: "Unsupported file type" } as const;
	}
	return { ok: true, bytes, type } as const;
}

// 공통 스키마
const UploadedFileSchema = t.Object({
	path: t.String(),
	publicUrl: t.String(),
	fileName: t.Optional(t.String()),
	index: t.Optional(t.Number()),
});

const UploadResponseSchema = t.Object({
	uploaded: t.Array(UploadedFileSchema),
	errors: t.Optional(
		t.Array(
			t.Object({
				index: t.Number(),
				fileName: t.String(),
				error: t.String(),
			}),
		),
	),
});

const ErrorSchema = t.Object({
	error: t.String(),
});

/**
 * Storage Routes (모두 인증 필수)
 * 업로드한 파일은 업로더의 Supabase ID 폴더에 저장된다.
 */
export const storageRoutes = new Elysia({ prefix: "/storage" })
	.use(authGuard)

	// POST /api/storage/upload/file - FormData 단일 파일 업로드
	.post(
		"/upload/file",
		async ({ auth, body, set }) => {
			const { bucket, file } = body;

			if (!isBucket(bucket)) {
				set.status = 400;
				return {
					error: `Invalid bucket. Allowed: ${validBuckets.join(", ")}`,
				};
			}

			const image = await readImage(file);
			if (!image.ok) {
				set.status = 400;
				return {
					error:
						image.error === "File too large"
							? "File too large. Maximum size is 20MB"
							: `Unsupported file type. Allowed: ${SUPPORTED_TYPES}`,
				};
			}

			try {
				const result = await storageService.uploadImage(
					bucket,
					auth.user.id,
					image.bytes,
					image.type,
				);

				return {
					uploaded: [
						{
							path: result.path,
							publicUrl: result.publicUrl,
							fileName: file.name,
						},
					],
				};
			} catch (error) {
				set.status = 500;
				return {
					error: error instanceof Error ? error.message : "Upload failed",
				};
			}
		},
		{
			body: t.Object({
				bucket: t.String(),
				file: t.File(),
			}),
			response: {
				200: UploadResponseSchema,
				400: ErrorSchema,
				500: ErrorSchema,
			},
			detail: {
				tags: ["Storage"],
				summary: "FormData 단일 파일 업로드",
				description: `FormData로 단일 이미지(${SUPPORTED_TYPES}, 최대 20MB)를 업로드합니다.`,
			},
		},
	)

	// POST /api/storage/upload/files - FormData 여러 파일 업로드
	.post(
		"/upload/files",
		async ({ auth, body, set }) => {
			const { bucket, files } = body;

			if (!isBucket(bucket)) {
				set.status = 400;
				return {
					error: `Invalid bucket. Allowed: ${validBuckets.join(", ")}`,
				};
			}

			const results: {
				index: number;
				path: string;
				publicUrl: string;
				fileName: string;
			}[] = [];
			const errors: { index: number; fileName: string; error: string }[] = [];

			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				const image = await readImage(file);
				if (!image.ok) {
					errors.push({ index: i, fileName: file.name, error: image.error });
					continue;
				}

				try {
					const result = await storageService.uploadImage(
						bucket,
						auth.user.id,
						image.bytes,
						image.type,
					);
					results.push({
						index: i,
						path: result.path,
						publicUrl: result.publicUrl,
						fileName: file.name,
					});
				} catch (error) {
					errors.push({
						index: i,
						fileName: file.name,
						error: error instanceof Error ? error.message : "Upload failed",
					});
				}
			}

			return {
				uploaded: results,
				errors: errors.length > 0 ? errors : undefined,
			};
		},
		{
			body: t.Object({
				bucket: t.String(),
				files: t.Files({ maxItems: MAX_FILES }),
			}),
			response: {
				200: UploadResponseSchema,
				400: ErrorSchema,
			},
			detail: {
				tags: ["Storage"],
				summary: "FormData 여러 파일 업로드",
				description: `FormData로 이미지(${SUPPORTED_TYPES}, 파일당 최대 20MB)를 최대 ${MAX_FILES}개까지 업로드합니다.`,
			},
		},
	)

	// GET /api/storage/buckets - 사용 가능한 버킷 목록
	.get(
		"/buckets",
		() => ({
			buckets: validBuckets,
		}),
		{
			response: t.Object({
				buckets: t.Array(t.String()),
			}),
			detail: {
				tags: ["Storage"],
				summary: "사용 가능한 버킷 목록 조회",
				description: "사용 가능한 스토리지 버킷 목록을 조회합니다.",
			},
		},
	);
