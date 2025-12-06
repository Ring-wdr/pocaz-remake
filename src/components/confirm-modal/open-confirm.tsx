import { overlay } from "overlay-kit";
import { ConfirmModal, type ConfirmModalField } from "./confirm-modal";

export interface OpenConfirmOptions {
	title: string;
	description?: string;
	fields?: ConfirmModalField[];
	confirmText?: string;
	cancelText?: string;
}

/**
 * window.confirm을 대체하는 선언적 confirm 함수
 *
 * @example
 * // 기본 확인 모달
 * const result = await openConfirm({
 *   title: "삭제 확인",
 *   description: "정말 삭제하시겠습니까?",
 * });
 *
 * if (result !== null) {
 *   console.log("확인됨");
 * }
 *
 * @example
 * // 폼 입력이 포함된 모달
 * const result = await openConfirm({
 *   title: "이메일 입력",
 *   description: "알림을 받을 이메일을 입력하세요",
 *   fields: [
 *     { name: "email", label: "이메일", type: "email", required: true },
 *   ],
 * });
 *
 * if (result) {
 *   console.log("입력된 이메일:", result.email);
 * }
 */
export async function openConfirm(
	options: OpenConfirmOptions,
): Promise<Record<string, string> | null> {
	return overlay.openAsync(({ isOpen, close, unmount }) => {
		if (!isOpen) {
			return null;
		}

		const handleConfirm = (data: Record<string, string> | null) => {
			close(data);
			setTimeout(unmount, 200);
		};

		const handleClose = () => {
			close(null);
			setTimeout(unmount, 200);
		};

		return (
			<ConfirmModal
				title={options.title}
				description={options.description}
				fields={options.fields}
				confirmText={options.confirmText}
				cancelText={options.cancelText}
				onConfirm={handleConfirm}
				onClose={handleClose}
			/>
		);
	});
}

/**
 * 간단한 예/아니오 확인 모달
 *
 * @example
 * const confirmed = await confirmAction({
 *   title: "삭제 확인",
 *   description: "정말 삭제하시겠습니까?",
 * });
 *
 * if (confirmed) {
 *   // 삭제 로직 수행
 * }
 */
export async function confirmAction(options: {
	title: string;
	description?: string;
	confirmText?: string;
	cancelText?: string;
}): Promise<boolean> {
	const result = await openConfirm(options);
	return result !== null;
}
