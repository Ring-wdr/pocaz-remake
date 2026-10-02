import { overlay } from "overlay-kit";
import { ReviewBottomSheet } from "./review-bottom-sheet";

export interface OpenReviewSheetOptions {
	/** 후기를 남길 거래의 id */
	transactionId: string;
	/** 후기를 받는 거래 상대의 닉네임. 모르면 생략한다 */
	partnerNickname?: string;
}

/**
 * 후기 작성 바텀시트를 overlay-kit으로 호출한다.
 * 채팅방 상단 배너처럼 z-index가 있는 영역 안에서 직접 그리면 시트가 하단 탭 뒤에 깔리므로,
 * 앱 루트의 OverlayProvider에 그린다.
 *
 * @returns 이 거래에 내 후기가 남은 상태가 되면 true(방금 남겼거나 이미 남겨 둔 경우), 남기지 않고 닫으면 false
 *
 * @example
 * const reviewed = await openReviewSheet({ transactionId });
 * if (reviewed) router.refresh();
 */
export async function openReviewSheet(
	options: OpenReviewSheetOptions,
): Promise<boolean> {
	return overlay.openAsync<boolean>(({ isOpen, close, unmount }) => {
		const finish = (reviewed: boolean) => {
			close(reviewed);
			setTimeout(unmount, 200);
		};

		return (
			<ReviewBottomSheet
				isOpen={isOpen}
				transactionId={options.transactionId}
				partnerNickname={options.partnerNickname}
				onReviewed={() => finish(true)}
				onClose={() => finish(false)}
			/>
		);
	});
}
