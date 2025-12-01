import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Storage 클라이언트 (Service Role Key 사용)
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
 * Storage Service
 */
export const storageService = {
	/**
	 * 파일 업로드 (Base64)
	 */
	async uploadBase64(
		bucket: StorageBucket,
		base64Data: string,
		fileName: string,
		contentType: string,
	): Promise<UploadResult> {
		// Base64 데이터에서 prefix 제거 (data:image/png;base64, 등)
		const base64Content = base64Data.replace(/^data:[^;]+;base64,/, "");
		const buffer = Buffer.from(base64Content, "base64");

		const uniqueFileName = `${Date.now()}-${crypto.randomUUID()}-${fileName}`;
		const path = uniqueFileName;

		const { data, error } = await supabaseAdmin.storage
			.from(bucket)
			.upload(path, buffer, {
				contentType,
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

	/**
	 * 파일 업로드 (Buffer)
	 */
	async uploadBuffer(
		bucket: StorageBucket,
		buffer: Buffer | File,
		fileName: string,
		contentType: string,
	): Promise<UploadResult> {
		const uniqueFileName = `${Date.now()}-${crypto.randomUUID()}-${fileName}`;
		const path = uniqueFileName;

		const { data, error } = await supabaseAdmin.storage
			.from(bucket)
			.upload(path, buffer, {
				contentType,
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

	/**
	 * 폴더 경로와 함께 업로드
	 */
	async uploadToFolder(
		bucket: StorageBucket,
		folder: string,
		buffer: Buffer,
		fileName: string,
		contentType: string,
	): Promise<UploadResult> {
		const uniqueFileName = `${Date.now()}-${crypto.randomUUID()}-${fileName}`;
		const path = `${folder}/${uniqueFileName}`;

		const { data, error } = await supabaseAdmin.storage
			.from(bucket)
			.upload(path, buffer, {
				contentType,
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

	/**
	 * 파일 삭제
	 */
	async delete(bucket: StorageBucket, paths: string[]): Promise<void> {
		const { error } = await supabaseAdmin.storage.from(bucket).remove(paths);

		if (error) {
			throw new Error(`Delete failed: ${error.message}`);
		}
	},

	/**
	 * 단일 파일 삭제
	 */
	async deleteOne(bucket: StorageBucket, path: string): Promise<void> {
		await this.delete(bucket, [path]);
	},

	/**
	 * Public URL 조회
	 */
	getPublicUrl(bucket: StorageBucket, path: string): string {
		const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
		return data.publicUrl;
	},

	/**
	 * Signed URL 생성 (private bucket용)
	 */
	async createSignedUrl(
		bucket: StorageBucket,
		path: string,
		expiresIn = 3600,
	): Promise<string> {
		const { data, error } = await supabaseAdmin.storage
			.from(bucket)
			.createSignedUrl(path, expiresIn);

		if (error) {
			throw new Error(`Signed URL creation failed: ${error.message}`);
		}

		return data.signedUrl;
	},

	/**
	 * 파일 목록 조회
	 */
	async list(bucket: StorageBucket, folder?: string) {
		const { data, error } = await supabaseAdmin.storage
			.from(bucket)
			.list(folder, {
				limit: 100,
				sortBy: { column: "created_at", order: "desc" },
			});

		if (error) {
			throw new Error(`List failed: ${error.message}`);
		}

		return data;
	},

	/**
	 * 파일 이동/이름 변경
	 */
	async move(
		bucket: StorageBucket,
		fromPath: string,
		toPath: string,
	): Promise<void> {
		const { error } = await supabaseAdmin.storage
			.from(bucket)
			.move(fromPath, toPath);

		if (error) {
			throw new Error(`Move failed: ${error.message}`);
		}
	},

	/**
	 * 파일 복사
	 */
	async copy(
		bucket: StorageBucket,
		fromPath: string,
		toPath: string,
	): Promise<void> {
		const { error } = await supabaseAdmin.storage
			.from(bucket)
			.copy(fromPath, toPath);

		if (error) {
			throw new Error(`Copy failed: ${error.message}`);
		}
	},
};
