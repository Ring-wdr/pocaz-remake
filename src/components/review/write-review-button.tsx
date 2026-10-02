"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";
import { openReviewSheet } from "./open-review-sheet";

interface WriteReviewButtonProps {
	/** 후기를 남길 거래의 id */
	transactionId: string;
	/** 후기를 받는 거래 상대의 닉네임 */
	partnerNickname: string;
}

/**
 * 거래 내역·구매 내역 항목의 "후기 쓰기" 버튼. 누르면 후기 작성 바텀시트가 열리고,
 * 후기를 남기면 서버에서 내려오는 목록을 새로 받는다. 이미 후기를 쓴 거래에는 그리지 않는다(호출하는 쪽에서 거른다).
 */
export function WriteReviewButton({
	transactionId,
	partnerNickname,
}: WriteReviewButtonProps) {
	const router = useRouter();
	// router.refresh()로 reviewed가 바뀐 목록이 내려오기 전에 버튼이 다시 눌리지 않도록 방금 남긴 것을 기억한다
	const [reviewedLocally, setReviewedLocally] = useState(false);

	const handleClick = async () => {
		const reviewed = await openReviewSheet({ transactionId, partnerNickname });
		if (!reviewed) return;

		setReviewedLocally(true);
		router.refresh();
	};

	if (reviewedLocally) return null;

	return (
		<Button type="button" size="sm" variant="outline" onClick={handleClick}>
			후기 쓰기
		</Button>
	);
}
