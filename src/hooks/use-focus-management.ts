"use client";

import { type RefObject, useEffect, useRef } from "react";

interface UseFocusManagementOptions {
	/**
	 * 모달이 열릴 때 포커스할 요소의 ref
	 * 제공하지 않으면 컨테이너 내 첫 번째 포커스 가능한 요소로 이동
	 */
	initialFocusRef?: RefObject<HTMLElement | null>;
	/**
	 * 모달이 닫힐 때 포커스를 복원할지 여부
	 * @default true
	 */
	restoreFocus?: boolean;
}

/**
 * 모달의 포커스 관리를 처리하는 훅
 * - 모달이 열리면 지정된 요소 또는 첫 번째 포커스 가능한 요소로 포커스 이동
 * - 모달이 닫히면 이전에 포커스되어 있던 요소로 복원
 *
 * @param isActive - 포커스 관리가 활성화되었는지 여부
 * @param options - 포커스 관리 옵션
 *
 * @example
 * ```tsx
 * function Modal({ isOpen }: { isOpen: boolean }) {
 *   const titleRef = useRef<HTMLHeadingElement>(null);
 *
 *   useFocusManagement(isOpen, {
 *     initialFocusRef: titleRef,
 *     restoreFocus: true,
 *   });
 *
 *   return isOpen ? <h2 ref={titleRef} tabIndex={-1}>Title</h2> : null;
 * }
 * ```
 */
export function useFocusManagement(
	isActive = true,
	options: UseFocusManagementOptions = {},
) {
	const { initialFocusRef, restoreFocus = true } = options;
	const previousActiveElement = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (!isActive) return;

		// 현재 포커스된 요소 저장
		previousActiveElement.current = document.activeElement as HTMLElement;

		// 초기 포커스 설정
		if (initialFocusRef?.current) {
			initialFocusRef.current.focus();
		}

		return () => {
			// 포커스 복원
			if (restoreFocus && previousActiveElement.current) {
				previousActiveElement.current.focus();
			}
		};
	}, [isActive, initialFocusRef, restoreFocus]);
}
