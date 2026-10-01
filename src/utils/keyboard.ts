import type { KeyboardEvent } from "react";

/**
 * 입력창의 keydown이 "Enter로 보내기"인지 판단한다. Shift+Enter와 한글 조합 중의 Enter는 제외한다.
 * 크롬은 조합을 끝내는 Enter에서 keydown을 두 번(isComposing true → false) 보내서, 이 확인이 없으면 두 번 전송된다.
 */
export function isSubmitEnter(e: KeyboardEvent) {
	return e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing;
}
