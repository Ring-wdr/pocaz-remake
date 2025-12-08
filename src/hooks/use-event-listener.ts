import { useEffect, useEffectEvent, useRef } from "react";

export const useEventListener = <TEventKey extends keyof DocumentEventMap>(
	key: TEventKey,
	callback: (event: DocumentEventMap[TEventKey]) => void,
	options?: AddEventListenerOptions,
) => {
	const onEvent = useEffectEvent(callback);
	const optionsRef = useRef(options);
	optionsRef.current = options;

	useEffect(() => {
		document.addEventListener(key, onEvent, optionsRef.current);
		return () => {
			document.removeEventListener(key, onEvent, optionsRef.current);
		};
	}, [key]);
};
