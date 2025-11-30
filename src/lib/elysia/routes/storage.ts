import { Elysia, t } from "elysia";

import { authGuard } from "@/lib/elysia/auth";
import {
	type StorageBucket,
	STORAGE_BUCKETS,
	storageService,
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

// 공통 스키마
const UploadResultSchema = t.Object({
	path: t.String(),
	publicUrl: t.String(),
});

const MultipleUploadResultSchema = t.Object({
	uploaded: t.Array(
		t.Object({
			index: t.Number(),
			path: t.String(),
			publicUrl: t.String(),
		}),
	),
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

const FileItemSchema = t.Object({
	name: t.String(),
	id: t.Optional(t.String()),
	updated_at: t.Optional(t.String()),
	created_at: t.Optional(t.String()),
	last_accessed_at: t.Optional(t.String()),
	metadata: t.Optional(t.Unknown()),
});

const ErrorSchema = t.Object({
	error: t.String(),
});

const MessageSchema = t.Object({
	message: t.String(),
});

/**
 * Storage Routes (모두 인증 필수)
 */
export const storageRoutes = new Elysia({ prefix: "/storage" })
	.use(authGuard)

	// POST /api/storage/upload/file - FormData 단일 파일 업로드
	.post(
		"/upload/file",
		async ({ body, set }) => {
			const { bucket, file } = body;

			// Bucket 검증
			const validBuckets = Object.values(STORAGE_BUCKETS);
			if (!validBuckets.includes(bucket as StorageBucket)) {
				set.status = 400;
				return {
					error: `Invalid bucket. Allowed: ${validBuckets.join(", ")}`,
				};
			}

			// MIME 타입 검증
			if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
				set.status = 400;
				return {
					error: `Unsupported file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
				};
			}

			// 파일 크기 검증
			if (file.size > MAX_FILE_SIZE) {
				set.status = 400;
				return { error: "File too large. Maximum size is 20MB" };
			}

			try {
				const buffer = Buffer.from(await file.arrayBuffer());
				const result = await storageService.uploadBuffer(
					bucket as StorageBucket,
					buffer,
					file.name,
					file.type,
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
				file: t.File(),
			}),
			response: {
				201: UploadResultSchema,
				400: ErrorSchema,
				500: ErrorSchema,
			},
			detail: {
				tags: ["Storage"],
				summary: "FormData 단일 파일 업로드",
				description: "FormData로 단일 파일을 업로드합니다.",
			},
		},
	)

	// POST /api/storage/upload/files - FormData 여러 파일 업로드
	.post(
		"/upload/files",
		async ({ body, set }) => {
			const { bucket, files } = body;

			// Bucket 검증
			const validBuckets = Object.values(STORAGE_BUCKETS);
			if (!validBuckets.includes(bucket as StorageBucket)) {
				set.status = 400;
				return {
					error: `Invalid bucket. Allowed: ${validBuckets.join(", ")}`,
				};
			}

			const results: { index: number; path: string; publicUrl: string }[] = [];
			const errors: { index: number; fileName: string; error: string }[] = [];

			for (let i = 0; i < files.length; i++) {
				const file = files[i];

				// MIME 타입 검증
				if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
					errors.push({
						index: i,
						fileName: file.name,
						error: "Unsupported file type",
					});
					continue;
				}

				// 파일 크기 검증
				if (file.size > MAX_FILE_SIZE) {
					errors.push({
						index: i,
						fileName: file.name,
						error: "File too large",
					});
					continue;
				}

				try {
					const buffer = Buffer.from(await file.arrayBuffer());
					const result = await storageService.uploadBuffer(
						bucket as StorageBucket,
						buffer,
						file.name,
						file.type,
					);
					results.push({
						index: i,
						path: result.path,
						publicUrl: result.publicUrl,
					});
				} catch (error) {
					errors.push({
						index: i,
						fileName: file.name,
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
				files: t.Files(),
			}),
			response: {
				201: MultipleUploadResultSchema,
				400: ErrorSchema,
			},
			detail: {
				tags: ["Storage"],
				summary: "FormData 여러 파일 업로드",
				description: "FormData로 여러 파일을 업로드합니다 (최대 10개).",
			},
		},
	)

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
			response: {
				201: UploadResultSchema,
				400: ErrorSchema,
				500: ErrorSchema,
			},
			detail: {
				tags: ["Storage"],
				summary: "Base64 이미지 업로드",
				description: "Base64로 인코딩된 이미지를 업로드합니다.",
			},
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
			response: {
				201: MultipleUploadResultSchema,
				400: ErrorSchema,
			},
			detail: {
				tags: ["Storage"],
				summary: "여러 파일 업로드",
				description: "여러 파일을 한 번에 업로드합니다 (최대 10개).",
			},
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
				await storageService.delete(body.bucket as StorageBucket, body.paths);
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
			response: {
				200: MessageSchema,
				400: ErrorSchema,
				500: ErrorSchema,
			},
			detail: {
				tags: ["Storage"],
				summary: "파일 삭제",
				description: "파일을 삭제합니다.",
			},
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
			response: {
				200: t.Object({ publicUrl: t.String() }),
				400: ErrorSchema,
			},
			detail: {
				tags: ["Storage"],
				summary: "Public URL 조회",
				description: "파일의 공개 URL을 조회합니다.",
			},
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
			response: {
				200: t.Object({ signedUrl: t.String() }),
				400: ErrorSchema,
				500: ErrorSchema,
			},
			detail: {
				tags: ["Storage"],
				summary: "Signed URL 생성",
				description: "파일에 대한 서명된 URL을 생성합니다 (기본 만료: 1시간).",
			},
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
			response: {
				200: t.Object({ files: t.Array(FileItemSchema) }),
				400: ErrorSchema,
				500: ErrorSchema,
			},
			detail: {
				tags: ["Storage"],
				summary: "파일 목록 조회",
				description: "버킷의 파일 목록을 조회합니다.",
			},
		},
	)

	// GET /api/storage/buckets - 사용 가능한 버킷 목록
	.get(
		"/buckets",
		() => ({
			buckets: Object.values(STORAGE_BUCKETS),
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
