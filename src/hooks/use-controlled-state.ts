import * as React from "react";
import { noop } from "../utils/noop";
import { useCallbackRef } from "./use-callback-ref";

const useEarlyEffect: typeof React.useLayoutEffect =
	typeof document !== "undefined"
		? (React.useInsertionEffect ?? React.useLayoutEffect)
		: noop;

type ControlledState<T> = [T, (value: React.SetStateAction<T>) => void];

export function useControlledState<T>(
	value: Exclude<T, undefined>,
	defaultValue: Exclude<T, undefined> | undefined,
	onChange?: (v: T) => void,
): ControlledState<T>;
export function useControlledState<T>(
	value: Exclude<T, undefined> | undefined,
	defaultValue: Exclude<T, undefined>,
	onChange?: (v: T) => void,
): ControlledState<T>;
export function useControlledState<T>(
	value: T,
	defaultValue: T,
	onChange?: (v: T) => void,
): ControlledState<T> {
	const [stateValue, setStateValue] = React.useState(value || defaultValue);
	const valueRef = React.useRef(stateValue);
	const callbackRef = useCallbackRef(onChange);
	const isControlled = value !== undefined;

	const currentValue = isControlled ? value : stateValue;
	useEarlyEffect(() => {
		valueRef.current = currentValue;
	});

	const setValue = React.useCallback(
		(value: React.SetStateAction<T>) => {
			const newValue =
				value instanceof Function ? value(valueRef.current) : value;
			if (!Object.is(valueRef.current, newValue)) {
				valueRef.current = newValue;
				setStateValue(newValue);
				callbackRef(newValue);
			}
		},
		[callbackRef],
	);

	return [currentValue, setValue];
}
