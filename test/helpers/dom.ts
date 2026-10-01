import { afterAll } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

/**
 * 컴포넌트 테스트 파일 최상위에서 호출한다. 이 파일이 끝날 때까지 DOM을 켠다.
 * API 테스트는 Bun 기본 Request/FormData를 써야 하므로 preload로 전역에 켜 두지 않는다.
 * @testing-library/react와 컴포넌트는 이 호출 뒤에 `await import()`로 불러온다
 * (불러오는 순간 document.body를 잡고, 정리 훅도 그때 등록하기 때문).
 */
export function registerDom() {
	GlobalRegistrator.register({ url: "http://localhost/" });
	afterAll(async () => {
		// 오버레이의 지연 언마운트(setTimeout) 같은 남은 작업이 DOM을 끈 뒤에 실행되지 않게 한다
		await new Promise((resolve) => setTimeout(resolve, 300));
		await GlobalRegistrator.unregister();
	});
}
