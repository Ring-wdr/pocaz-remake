import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Storage 클라이언트 (Service Role Key 사용)
 * Storage RLS를 우회하므로 경로와 권한은 이 서비스와 라우트에서 정한다.
 */
const supabaseAdmin = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SECRET_KEY!,
);

/**
 * 업로드 결과 타입
 */
export interface UploadResult {
	path: string;
	fullPath: string;
	publicUrl: string;
}

/**
 * Storage Bucket 이름
 */
export const STORAGE_BUCKETS = {
	IMAGES: "images",
	AVATARS: "avatars",
	POSTS: "posts",
	MARKETS: "markets",
	PHOTOCARDS: "photocards",
} as const;

export type StorageBucket =
	(typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

/**
 * 업로드를 허용하는 이미지 형식. SVG는 스크립트를 담을 수 있어 받지 않는다.
 */
export interface ImageType {
	mime: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
	ext: "jpg" | "png" | "gif" | "webp";
}

/**
 * 파일 앞부분의 시그니처로 이미지 형식을 판별한다. 클라이언트가 보낸 MIME 타입은 쓰지 않는다.
 */
export function detectImageType(bytes: Uint8Array): ImageType | null {
	const startsWith = (signature: number[], offset = 0) =>
		signature.every((byte, i) => bytes[offset + i] === byte);

	if (startsWith([0xff, 0xd8, 0xff])) {
		return { mime: "image/jpeg", ext: "jpg" };
	}
	if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
		return { mime: "image/png", ext: "png" };
	}
	// GIF87a / GIF89a
	if (
		startsWith([0x47, 0x49, 0x46, 0x38]) &&
		(bytes[4] === 0x37 || bytes[4] === 0x39) &&
		bytes[5] === 0x61
	) {
		return { mime: "image/gif", ext: "gif" };
	}
	// RIFF....WEBP
	if (
		startsWith([0x52, 0x49, 0x46, 0x46]) &&
		startsWith([0x57, 0x45, 0x42, 0x50], 8)
	) {
		return { mime: "image/webp", ext: "webp" };
	}
	return null;
}

/**
 * Storage Service
 */
export const storageService = {
	/**
	 * 이미지 업로드. 경로는 `{업로더 Supabase ID}/{시각}-{UUID}.{확장자}`로 서버가 만든다.
	 */
	async uploadImage(
		bucket: StorageBucket,
		ownerId: string,
		bytes: Uint8Array,
		type: ImageType,
	): Promise<UploadResult> {
		const path = `${ownerId}/${Date.now()}-${crypto.randomUUID()}.${type.ext}`;

		const { data, error } = await supabaseAdmin.storage
			.from(bucket)
			.upload(path, bytes, {
				contentType: type.mime,
				upsert: false,
			});

		if (error) {
			throw new Error(`Upload failed: ${error.message}`);
		}

		const { data: urlData } = supabaseAdmin.storage
			.from(bucket)
			.getPublicUrl(data.path);

		return {
			path: data.path,
			fullPath: data.fullPath,
			publicUrl: urlData.publicUrl,
		};
	},
};
