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
}

export function createMetadata({
	title = SITE_NAME,
	description = DEFAULT_DESCRIPTION,
	path,
	type = "website",
	baseUrl,
}: CreateMetadataOptions = {}): Metadata {
	const resolvedBaseUrl = baseUrl ?? getBaseUrl();
	const pageUrl = path
		? new URL(path, resolvedBaseUrl).toString()
		: resolvedBaseUrl;

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
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
		},
		alternates: path
			? {
					canonical: path,
				}
			: undefined,
	};
}

export const defaultMetadata = createMetadata();
