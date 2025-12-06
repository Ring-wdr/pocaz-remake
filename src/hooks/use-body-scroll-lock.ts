"use client";

import { useEffect } from "react";

/**
 * 모달이 열려있을 때 배경 스크롤을 방지하는 훅
 *
 * @param isLocked - 스크롤을 잠글지 여부
 *
 * @example
 * ```tsx
 * function Modal({ isOpen }: { isOpen: boolean }) {
 *   useBodyScrollLock(isOpen);
 *   return isOpen ? <div>Modal Content</div> : null;
 * }
 * ```
 */
export function useBodyScrollLock(isLocked = true) {
	useEffect(() => {
		if (!isLocked) return;

		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = originalOverflow;
		};
	}, [isLocked]);
}
