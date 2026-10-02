import type { Metadata } from "next";

import { getBaseUrl } from "@/utils/url";

const SITE_NAME = "POCAZ";
const DEFAULT_DESCRIPTION = "포토카드 거래 및 커뮤니티 플랫폼";
type OpenGraphType =
	| "article"
	| "book"
	| "music.song"
	| "music.album"
	| "music.playlist"
	| "music.radio_station"
	| "profile"
	| "website"
	| "video.tv_show"
	| "video.other"
	| "video.movie"
	| "video.episode";

interface CreateMetadataOptions {
	title?: string;
	description?: string;
	path?: string;
	ogTitle?: string;
	type?: OpenGraphType;
	baseUrl?: string;
	/**
	 * 공유 미리보기(Open Graph·Twitter 카드)에 쓸 이미지 주소. 상대 경로면 사이트 주소를 붙여 절대 주소로 바꾼다.
	 * 없거나 http(s) 주소로 읽을 수 없으면 이미지를 넣지 않는다.
	 */
	image?: string | null;
}

/**
 * 공유 미리보기 이미지를 절대 http(s) 주소로 만든다. 값이 없거나 주소로 읽을 수 없거나
 * http(s)가 아니면(`javascript:`, `data:` 등) undefined라 이미지를 넣지 않는다.
 */
function resolveImageUrl(
	image: string | null | undefined,
	baseUrl: string,
): string | undefined {
	const value = image?.trim();
	if (!value) return undefined;

	try {
		const url = new URL(value, baseUrl);
		return url.protocol === "http:" || url.protocol === "https:"
			? url.toString()
			: undefined;
	} catch {
		return undefined;
	}
}

export function createMetadata({
	title = SITE_NAME,
	description = DEFAULT_DESCRIPTION,
	path,
	type = "website",
	baseUrl,
	image,
}: CreateMetadataOptions = {}): Metadata {
	const resolvedBaseUrl = baseUrl ?? getBaseUrl();
	const pageUrl = path
		? new URL(path, resolvedBaseUrl).toString()
		: resolvedBaseUrl;
	const imageUrl = resolveImageUrl(image, resolvedBaseUrl);

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			url: pageUrl,
			siteName: SITE_NAME,
			locale: "ko_KR",
			type,
			...(imageUrl && { images: [{ url: imageUrl }] }),
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			...(imageUrl && { images: [imageUrl] }),
		},
		alternates: path
			? {
					canonical: path,
				}
			: undefined,
	};
}

export const defaultMetadata = createMetadata();
