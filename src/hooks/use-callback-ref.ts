/** biome-ignore-all lint/suspicious/noExplicitAny: allow unknown callback */
import * as React from "react";

export function useCallbackRef<T extends (...args: any[]) => any>(
	callback: T | undefined,
): T {
	const callbackRef = React.useRef(callback);

	React.useEffect(() => {
		callbackRef.current = callback;
	});

	return React.useMemo<T>(
		() => ((...args) => callbackRef.current?.(...args)) as T,
		[],
	);
}
