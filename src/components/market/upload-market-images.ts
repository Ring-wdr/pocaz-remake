import { api } from "@/utils/eden";

export type UploadMarketImagesResult =
	| { ok: true; urls: string[] }
	| { ok: false; message: string };

/**
 * 상품 이미지 파일을 markets 버킷에 올리고, 고른 순서대로 공개 URL을 돌려준다.
 * 하나라도 올리지 못하면 이유를 담은 안내 문구를 돌려준다(이미 올라간 파일은 쓰지 않는다).
 * 등록과 수정이 같은 단계를 쓴다.
 */
export async function uploadMarketImages(
	files: File[],
): Promise<UploadMarketImagesResult> {
	try {
		const result = await api.storage.upload.files.post({
			bucket: "markets",
			files,
		});

		if (
			result.error ||
			!result.data ||
			!("uploaded" in result.data) ||
			!result.data.uploaded
		) {
			return {
				ok: false,
				message: "이미지 업로드에 실패했습니다. 다시 시도해 주세요.",
			};
		}

		if (Array.isArray(result.data.errors) && result.data.errors.length > 0) {
			return {
				ok: false,
				message: "일부 이미지 업로드에 실패했습니다. 파일을 확인해 주세요.",
			};
		}

		const urls = [...result.data.uploaded]
			.sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
			.map((item) => item.publicUrl);

		if (urls.length === 0) {
			return { ok: false, message: "업로드된 이미지가 없습니다." };
		}

		return { ok: true, urls };
	} catch (error) {
		console.error("Image upload failed", error);
		return { ok: false, message: "이미지 업로드 중 오류가 발생했습니다." };
	}
}
