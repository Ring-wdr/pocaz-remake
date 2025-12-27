"use client";

import { ErrorBoundary } from "@suspensive/react";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import type { ComponentPropsWithoutRef, ComponentRef } from "react";
import { forwardRef } from "react";

export const QueryErrorBoundary = forwardRef<
	ComponentRef<typeof ErrorBoundary>,
	ComponentPropsWithoutRef<typeof ErrorBoundary>
>(({ onReset, ...props }, resetRef) => {
	const { reset } = useQueryErrorResetBoundary();
	return (
		<ErrorBoundary
			{...props}
			onReset={() => {
				onReset?.();
				reset();
			}}
			ref={resetRef}
		/>
	);
});

QueryErrorBoundary.displayName = "QueryErrorBoundary";
