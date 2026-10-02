"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { toast } from "sonner";

import {
	type ExistingMarketImage,
	MarketForm,
	type MarketFormSubmitValues,
	type MarketFormValues,
} from "@/components/market/market-form";
import { uploadMarketImages } from "@/components/market/upload-market-images";
import {
	chatRoomsQueryKey,
	marketInfoQueryOptions,
} from "@/lib/queries/markets";
import type { ArtistCatalogGroup } from "@/types/entities";
import { api } from "@/utils/eden";

interface MarketEditPageClientProps {
	marketId: string;
	initialValues: MarketFormValues;
	existingImages: ExistingMarketImage[];
	/** 아티스트 태그로 고를 수 있는 그룹과 멤버 */
	groups: ArtistCatalogGroup[];
}

export default function MarketEditPageClient({
	marketId,
	initialValues,
	existingImages,
	groups,
}: MarketEditPageClientProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	// 저장이 이미지 단계에서 중간에 실패해 다시 저장할 때, 이미 끝난 이미지는 다시 붙이거나 지우지 않도록 기억한다
	const doneImages = useRef({
		addedFiles: new Set<File>(),
		removedIds: new Set<string>(),
	});

	/** 1단계: 제목·가격·협상·상태·설명·아티스트 태그. 실패하면 토스트를 띄우고 false */
	const saveInfo = async (values: MarketFormSubmitValues) => {
		try {
			const { error } = await api.markets({ id: marketId }).put({
				title: values.title,
				description: values.description,
				// 가격을 비웠으면(가격협의) null을 보내 기존 가격을 지운다
				price: values.price,
				condition: values.condition,
				isNegotiable: values.isNegotiable,
				// 태그를 풀었으면 null을 보내 기존 태그를 지운다
				groupId: values.groupId,
				artistId: values.artistId,
			});
			if (!error) return true;
			console.error("Failed to update market item:", error);
		} catch (error) {
			console.error("Failed to update market item:", error);
		}
		toast.error("상품 정보를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
		return false;
	};

	const addImages = async (imageUrls: string[]) => {
		try {
			const { error } = await api
				.markets({ id: marketId })
				.images.post({ imageUrls });
			if (!error) return true;
			console.error("Failed to add market images:", error);
		} catch (error) {
			console.error("Failed to add market images:", error);
		}
		return false;
	};

	const removeImage = async (imageId: string) => {
		try {
			const { error } = await api
				.markets({ id: marketId })
				.images({ imageId })
				.delete();
			// 이미 없는 이미지(404)는 지워진 것과 같다
			if (!error || error.status === 404) return true;
			console.error("Failed to delete market image:", error);
		} catch (error) {
			console.error("Failed to delete market image:", error);
		}
		return false;
	};

	/**
	 * 2~4단계: 새 이미지를 올려 붙이고, 삭제하기로 한 기존 이미지를 지운다.
	 * 상품 정보는 이미 저장된 뒤라서, 실패 토스트에 그 사실과 실패한 단계를 함께 알린다.
	 * 붙이는 것을 먼저 해서, 중간에 멈춰도 이미지가 0장이 되는 순간은 없다.
	 */
	const saveImages = async (values: MarketFormSubmitValues) => {
		const filesToAdd = values.newFiles.filter(
			(file) => !doneImages.current.addedFiles.has(file),
		);
		if (filesToAdd.length > 0) {
			const upload = await uploadMarketImages(filesToAdd);
			if (!upload.ok) {
				toast.error(`상품 정보는 저장했지만 ${upload.message}`);
				return false;
			}

			if (!(await addImages(upload.urls))) {
				toast.error(
					"상품 정보는 저장했지만 새 이미지를 추가하지 못했어요. 다시 저장해 주세요.",
				);
				return false;
			}
			for (const file of filesToAdd) {
				doneImages.current.addedFiles.add(file);
			}
		}

		const idsToRemove = values.removedImageIds.filter(
			(imageId) => !doneImages.current.removedIds.has(imageId),
		);
		if (idsToRemove.length > 0) {
			const results = await Promise.all(
				idsToRemove.map(async (imageId) => ({
					imageId,
					removed: await removeImage(imageId),
				})),
			);
			let failedCount = 0;
			for (const { imageId, removed } of results) {
				if (removed) {
					doneImages.current.removedIds.add(imageId);
				} else {
					failedCount += 1;
				}
			}
			if (failedCount > 0) {
				toast.error(
					`상품 정보는 저장했지만 지운 이미지 ${failedCount}장을 삭제하지 못했어요. 다시 저장해 주세요.`,
				);
				return false;
			}
		}

		return true;
	};

	const handleSubmit = async (values: MarketFormSubmitValues) => {
		if (!(await saveInfo(values))) return;

		try {
			if (!(await saveImages(values))) return;

			toast.success("상품 정보를 수정했어요");
			router.push(`/market/${marketId}`);
			router.refresh();
		} finally {
			// 상품 정보는 이미 바뀌었으므로, 이후 단계가 실패했어도 채팅방에 보이는 상품 정보 캐시는 새로 받게 한다
			void queryClient.invalidateQueries({ queryKey: chatRoomsQueryKey });
			void queryClient.invalidateQueries({
				queryKey: marketInfoQueryOptions(marketId).queryKey,
			});
		}
	};

	return (
		<MarketForm
			mode="edit"
			initialValues={initialValues}
			existingImages={existingImages}
			groups={groups}
			onSubmit={handleSubmit}
		/>
	);
}
