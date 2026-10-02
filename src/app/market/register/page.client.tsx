"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
	MarketForm,
	type MarketFormSubmitValues,
} from "@/components/market/market-form";
import { uploadMarketImages } from "@/components/market/upload-market-images";
import type { ArtistCatalogGroup } from "@/types/entities";
import { api } from "@/utils/eden";

interface MarketRegisterPageProps {
	/** 아티스트 태그로 고를 수 있는 그룹과 멤버 */
	groups: ArtistCatalogGroup[];
}

export default function MarketRegisterPage({
	groups,
}: MarketRegisterPageProps) {
	const router = useRouter();

	const handleSubmit = async (values: MarketFormSubmitValues) => {
		// 이미지를 먼저 올린다. 실패하면 상품은 만들지 않는다
		const upload = await uploadMarketImages(values.newFiles);
		if (!upload.ok) {
			toast.error(upload.message);
			return;
		}

		try {
			const { error } = await api.markets.post({
				title: values.title,
				description: values.description,
				price: values.price ?? undefined,
				condition: values.condition,
				isNegotiable: values.isNegotiable,
				groupId: values.groupId ?? undefined,
				artistId: values.artistId ?? undefined,
				imageUrls: upload.urls,
			});

			if (error) {
				console.error("Failed to create market item:", error);
				toast.error("상품 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.");
				return;
			}
		} catch (error) {
			console.error("Failed to create market item:", error);
			toast.error("상품 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.");
			return;
		}

		toast.success("상품을 등록했습니다.");
		router.push("/market");
	};

	return <MarketForm mode="create" groups={groups} onSubmit={handleSubmit} />;
}
