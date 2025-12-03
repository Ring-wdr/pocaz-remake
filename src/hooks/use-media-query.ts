"use client";

import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string, defaultValue = false) {
	const getMediaQueryList = () =>
		typeof window === "undefined" ? null : window.matchMedia(query);

	const subscribe = (callback: () => void) => {
		const mediaQueryList = getMediaQueryList();
		if (!mediaQueryList) return () => {};

		mediaQueryList.addEventListener("change", callback);
		return () => mediaQueryList.removeEventListener("change", callback);
	};

	const getSnapshot = () => {
		const mediaQueryList = getMediaQueryList();
		return mediaQueryList ? mediaQueryList.matches : defaultValue;
	};

	return useSyncExternalStore(subscribe, getSnapshot, () => defaultValue);
}
