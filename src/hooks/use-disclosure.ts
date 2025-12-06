"use client";

import { useCallback, useState } from "react";

export interface UseDisclosureReturn {
	isOpen: boolean;
	open: () => void;
	close: () => void;
	toggle: () => void;
	setIsOpen: (value: boolean) => void;
}

export interface UseDisclosureOptions {
	defaultIsOpen?: boolean;
	onOpen?: () => void;
	onClose?: () => void;
}

/**
 * 모달, 드롭다운, 아코디언 등의 열림/닫힘 상태를 관리하는 훅
 *
 * @param options - 옵션 설정
 * @param options.defaultIsOpen - 초기 열림 상태 (기본값: false)
 * @param options.onOpen - 열릴 때 호출되는 콜백
 * @param options.onClose - 닫힐 때 호출되는 콜백
 * @returns 상태와 제어 함수들
 *
 * @example
 * // 기본 사용
 * const { isOpen, open, close, toggle } = useDisclosure();
 *
 * return (
 *   <>
 *     <button onClick={toggle}>Toggle Modal</button>
 *     {isOpen && <Modal onClose={close} />}
 *   </>
 * );
 *
 * @example
 * // 콜백 사용
 * const { isOpen, open, close } = useDisclosure({
 *   onOpen: () => console.log("Opened"),
 *   onClose: () => console.log("Closed"),
 * });
 */
export function useDisclosure(options: UseDisclosureOptions = {}): UseDisclosureReturn {
	const { defaultIsOpen = false, onOpen, onClose } = options;
	const [isOpen, setIsOpenState] = useState(defaultIsOpen);

	const open = useCallback(() => {
		setIsOpenState(true);
		onOpen?.();
	}, [onOpen]);

	const close = useCallback(() => {
		setIsOpenState(false);
		onClose?.();
	}, [onClose]);

	const toggle = useCallback(() => {
		if (isOpen) {
			close();
		} else {
			open();
		}
	}, [isOpen, open, close]);

	const setIsOpen = useCallback(
		(value: boolean) => {
			if (value) {
				open();
			} else {
				close();
			}
		},
		[open, close],
	);

	return {
		isOpen,
		open,
		close,
		toggle,
		setIsOpen,
	};
}
