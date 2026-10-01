/**
 * services/storage.ts가 쓰는 Supabase admin 클라이언트의 가짜 구현. 업로드 호출을 기록만 한다.
 */
export interface RecordedUpload {
	bucket: string;
	path: string;
	contentType?: string;
}

export const storageCalls: { uploads: RecordedUpload[] } = { uploads: [] };

export function resetStorageCalls() {
	storageCalls.uploads.length = 0;
}

export function createFakeSupabaseAdmin() {
	return {
		storage: {
			from(bucket: string) {
				return {
					async upload(
						path: string,
						_body: unknown,
						options?: { contentType?: string },
					) {
						storageCalls.uploads.push({
							bucket,
							path,
							contentType: options?.contentType,
						});
						return {
							data: { path, fullPath: `${bucket}/${path}` },
							error: null,
						};
					},
					getPublicUrl(path: string) {
						return {
							data: { publicUrl: `https://storage.test/${bucket}/${path}` },
						};
					},
				};
			},
		},
	};
}

/** 형식별 최소 시그니처 바이트. 내용은 판별에 필요한 머리 부분만 있으면 된다. */
export const imageBytes = {
	png: new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]),
	jpeg: new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]),
	gif: new TextEncoder().encode("GIF89a\0\0\0\0"),
	webp: new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 "),
	svg: new TextEncoder().encode(
		'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
	),
};
