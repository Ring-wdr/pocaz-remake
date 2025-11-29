import { Elysia, t } from "elysia";
import { authGuard } from "@/lib/elysia/auth";
import {
	storageService,
	STORAGE_BUCKETS,
	type StorageBucket,
} from "@/lib/services/storage";

/**
 * 지원하는 이미지 MIME 타입
 */
const ALLOWED_IMAGE_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/svg+xml",
];

/**
 * 최대 파일 크기 (20MB)
 */
const MAX_FILE_SIZE = 20 * 1024 * 1024;

/**
 * Storage Routes (모두 인증 필수)
 */
export const storageRoutes = new Elysia({ prefix: "/storage" })
	.use(authGuard)

	// POST /api/storage/upload - Base64 이미지 업로드
	.post(
		"/upload",
		async ({ body, set }) => {
			// MIME 타입 검증
			if (!ALLOWED_IMAGE_TYPES.includes(body.contentType)) {
				set.status = 400;
				return {
					error: `Unsupported file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
				};
			}

			// Bucket 검증
			const validBuckets = Object.values(STORAGE_BUCKETS);
			if (!validBuckets.includes(body.bucket as StorageBucket)) {
				set.status = 400;
				return {
					error: `Invalid bucket. Allowed: ${validBuckets.join(", ")}`,
				};
			}

			// Base64 크기 검증 (대략적인 계산)
			const base64Size = (body.base64Data.length * 3) / 4;
			if (base64Size > MAX_FILE_SIZE) {
				set.status = 400;
				return { error: "File too large. Maximum size is 20MB" };
			}

			try {
				const result = await storageService.uploadBase64(
					body.bucket as StorageBucket,
					body.base64Data,
					body.fileName,
					body.contentType,
				);

				set.status = 201;
				return {
					path: result.path,
					publicUrl: result.publicUrl,
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
				base64Data: t.String(),
				fileName: t.String(),
				contentType: t.String(),
			}),
		},
	)

	// POST /api/storage/upload/multiple - 여러 파일 업로드
	.post(
		"/upload/multiple",
		async ({ body, set }) => {
			const validBuckets = Object.values(STORAGE_BUCKETS);
			if (!validBuckets.includes(body.bucket as StorageBucket)) {
				set.status = 400;
				return {
					error: `Invalid bucket. Allowed: ${validBuckets.join(", ")}`,
				};
			}

			const results = [];
			const errors = [];

			for (let i = 0; i < body.files.length; i++) {
				const file = body.files[i];

				if (!ALLOWED_IMAGE_TYPES.includes(file.contentType)) {
					errors.push({
						index: i,
						fileName: file.fileName,
						error: "Unsupported file type",
					});
					continue;
				}

				const base64Size = (file.base64Data.length * 3) / 4;
				if (base64Size > MAX_FILE_SIZE) {
					errors.push({
						index: i,
						fileName: file.fileName,
						error: "File too large",
					});
					continue;
				}

				try {
					const result = await storageService.uploadBase64(
						body.bucket as StorageBucket,
						file.base64Data,
						file.fileName,
						file.contentType,
					);
					results.push({
						index: i,
						path: result.path,
						publicUrl: result.publicUrl,
					});
				} catch (error) {
					errors.push({
						index: i,
						fileName: file.fileName,
						error: error instanceof Error ? error.message : "Upload failed",
					});
				}
			}

			set.status = 201;
			return {
				uploaded: results,
				errors: errors.length > 0 ? errors : undefined,
			};
		},
		{
			body: t.Object({
				bucket: t.String(),
				files: t.Array(
					t.Object({
						base64Data: t.String(),
						fileName: t.String(),
						contentType: t.String(),
					}),
					{ minItems: 1, maxItems: 10 },
				),
			}),
		},
	)

	// DELETE /api/storage/delete - 파일 삭제
	.delete(
		"/delete",
		async ({ body, set }) => {
			const validBuckets = Object.values(STORAGE_BUCKETS);
			if (!validBuckets.includes(body.bucket as StorageBucket)) {
				set.status = 400;
				return {
					error: `Invalid bucket. Allowed: ${validBuckets.join(", ")}`,
				};
			}

			try {
				await storageService.delete(
					body.bucket as StorageBucket,
					body.paths,
				);
				return { message: "Files deleted successfully" };
			} catch (error) {
				set.status = 500;
				return {
					error: error instanceof Error ? error.message : "Delete failed",
				};
			}
		},
		{
			body: t.Object({
				bucket: t.String(),
				paths: t.Array(t.String(), { minItems: 1 }),
			}),
		},
	)

	// POST /api/storage/url - Public URL 조회
	.post(
		"/url",
		async ({ body, set }) => {
			const validBuckets = Object.values(STORAGE_BUCKETS);
			if (!validBuckets.includes(body.bucket as StorageBucket)) {
				set.status = 400;
				return {
					error: `Invalid bucket. Allowed: ${validBuckets.join(", ")}`,
				};
			}

			const publicUrl = storageService.getPublicUrl(
				body.bucket as StorageBucket,
				body.path,
			);

			return { publicUrl };
		},
		{
			body: t.Object({
				bucket: t.String(),
				path: t.String(),
			}),
		},
	)

	// POST /api/storage/signed-url - Signed URL 생성
	.post(
		"/signed-url",
		async ({ body, set }) => {
			const validBuckets = Object.values(STORAGE_BUCKETS);
			if (!validBuckets.includes(body.bucket as StorageBucket)) {
				set.status = 400;
				return {
					error: `Invalid bucket. Allowed: ${validBuckets.join(", ")}`,
				};
			}

			try {
				const signedUrl = await storageService.createSignedUrl(
					body.bucket as StorageBucket,
					body.path,
					body.expiresIn ?? 3600,
				);
				return { signedUrl };
			} catch (error) {
				set.status = 500;
				return {
					error:
						error instanceof Error
							? error.message
							: "Signed URL creation failed",
				};
			}
		},
		{
			body: t.Object({
				bucket: t.String(),
				path: t.String(),
				expiresIn: t.Optional(t.Number()),
			}),
		},
	)

	// GET /api/storage/list/:bucket - 파일 목록 조회
	.get(
		"/list/:bucket",
		async ({ params, query, set }) => {
			const validBuckets = Object.values(STORAGE_BUCKETS);
			if (!validBuckets.includes(params.bucket as StorageBucket)) {
				set.status = 400;
				return {
					error: `Invalid bucket. Allowed: ${validBuckets.join(", ")}`,
				};
			}

			try {
				const files = await storageService.list(
					params.bucket as StorageBucket,
					query.folder,
				);
				return { files };
			} catch (error) {
				set.status = 500;
				return {
					error: error instanceof Error ? error.message : "List failed",
				};
			}
		},
		{
			params: t.Object({
				bucket: t.String(),
			}),
			query: t.Object({
				folder: t.Optional(t.String()),
			}),
		},
	)

	// GET /api/storage/buckets - 사용 가능한 버킷 목록
	.get("/buckets", () => ({
		buckets: Object.values(STORAGE_BUCKETS),
	}));
