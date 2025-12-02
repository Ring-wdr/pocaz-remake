"use server";

import { api } from "@/utils/eden";

export type MarketLikeState = {
	liked: boolean;
	count: number;
	error: string | null;
};

export async function toggleMarketLike(
	prevState: MarketLikeState,
	formData: FormData,
): Promise<MarketLikeState> {
	const marketId = formData.get("marketId")?.toString();
	if (!marketId) {
		return { ...prevState, error: "잘못된 요청입니다." };
	}

	try {
		const { data, error } = await api.likes.markets({ marketId }).post();

		if (data) {
			return {
				liked: data.liked,
				count: data.count,
				error: null,
			};
		}

		return {
			...prevState,
			error: "찜 처리에 실패했습니다. 다시 시도해 주세요.",
		};
	} catch (err) {
		console.error("toggleMarketLike failed", err);
		return {
			...prevState,
			error: "찜 처리에 실패했습니다. 다시 시도해 주세요.",
		};
	}
}
