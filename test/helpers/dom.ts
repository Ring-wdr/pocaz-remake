import { afterAll } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

/**
 * 컴포넌트 테스트 파일 최상위에서 호출한다. 이 파일이 끝날 때까지 DOM을 켠다.
 * API 테스트는 Bun 기본 Request/FormData를 써야 하므로 preload로 전역에 켜 두지 않는다.
 * @testing-library/react와 컴포넌트는 이 호출 뒤에 `await import()`로 불러온다
 * (불러오는 순간 document.body를 잡고, 정리 훅도 그때 등록하기 때문).
 *
 * Testing Library 모듈은 프로세스에서 한 번만 로드되므로 `screen`은 처음 로드한 파일의 document에 묶인다.
 * 쿼리는 `render()`가 돌려주는 것을 쓰고, 정리(`cleanup`)도 파일마다 직접 한다.
 */
export function registerDom() {
	const native = {
		setTimeout: globalThis.setTimeout,
		clearTimeout: globalThis.clearTimeout,
		setInterval: globalThis.setInterval,
		clearInterval: globalThis.clearInterval,
		queueMicrotask: globalThis.queueMicrotask,
	};
	GlobalRegistrator.register({ url: "http://localhost/" });
	// happy-dom 창을 닫으면 그 창의 타이머와 마이크로태스크도 멈춘다. React는 이 함수들을 처음 로드될 때 잡아 두므로,
	// 여러 테스트 파일이 DOM을 켰다 껐다 해도 업데이트가 실행되도록 Bun 기본 함수를 그대로 둔다.
	Object.assign(globalThis, native);
	afterAll(async () => {
		// 오버레이의 지연 언마운트(setTimeout) 같은 남은 작업이 DOM을 끈 뒤에 실행되지 않게 한다
		await new Promise((resolve) => setTimeout(resolve, 300));
		await GlobalRegistrator.unregister();
	});
}
