"use client";

import * as stylex from "@stylexjs/stylex";
import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner";
import { colors, fontSize, fontWeight, radius, spacing } from "@/app/global-tokens.stylex";

// StyleX styles for custom toast styling
const styles = stylex.create({
	toaster: {
		// Sonner uses CSS variables for theming
	},
});

export type ToastType = "success" | "error" | "warning" | "info" | "default";

export interface ToastOptions {
	description?: string;
	duration?: number;
	action?: {
		label: string;
		onClick: () => void;
	};
	cancel?: {
		label: string;
		onClick?: () => void;
	};
	onDismiss?: () => void;
	onAutoClose?: () => void;
}

/**
 * Toast utility functions wrapping Sonner
 *
 * @example
 * ```tsx
 * import { toast } from "@/components/ui";
 *
 * toast.success("저장되었습니다");
 * toast.error("오류가 발생했습니다", { description: "다시 시도해주세요" });
 * toast.promise(saveData(), {
 *   loading: "저장 중...",
 *   success: "저장 완료!",
 *   error: "저장 실패",
 * });
 * ```
 */
export const toast = {
	/**
	 * Show a default toast
	 */
	default: (message: string, options?: ToastOptions) => {
		return sonnerToast(message, {
			description: options?.description,
			duration: options?.duration,
			action: options?.action,
			cancel: options?.cancel,
			onDismiss: options?.onDismiss,
			onAutoClose: options?.onAutoClose,
		});
	},

	/**
	 * Show a success toast
	 */
	success: (message: string, options?: ToastOptions) => {
		return sonnerToast.success(message, {
			description: options?.description,
			duration: options?.duration,
			action: options?.action,
			cancel: options?.cancel,
			onDismiss: options?.onDismiss,
			onAutoClose: options?.onAutoClose,
		});
	},

	/**
	 * Show an error toast
	 */
	error: (message: string, options?: ToastOptions) => {
		return sonnerToast.error(message, {
			description: options?.description,
			duration: options?.duration ?? 5000,
			action: options?.action,
			cancel: options?.cancel,
			onDismiss: options?.onDismiss,
			onAutoClose: options?.onAutoClose,
		});
	},

	/**
	 * Show a warning toast
	 */
	warning: (message: string, options?: ToastOptions) => {
		return sonnerToast.warning(message, {
			description: options?.description,
			duration: options?.duration,
			action: options?.action,
			cancel: options?.cancel,
			onDismiss: options?.onDismiss,
			onAutoClose: options?.onAutoClose,
		});
	},

	/**
	 * Show an info toast
	 */
	info: (message: string, options?: ToastOptions) => {
		return sonnerToast.info(message, {
			description: options?.description,
			duration: options?.duration,
			action: options?.action,
			cancel: options?.cancel,
			onDismiss: options?.onDismiss,
			onAutoClose: options?.onAutoClose,
		});
	},

	/**
	 * Show a loading toast that can be updated
	 */
	loading: (message: string, options?: ToastOptions) => {
		return sonnerToast.loading(message, {
			description: options?.description,
			duration: options?.duration,
		});
	},

	/**
	 * Show a promise toast that updates based on promise state
	 */
	promise: <T,>(
		promise: Promise<T> | (() => Promise<T>),
		messages: {
			loading: string;
			success: string | ((data: T) => string);
			error: string | ((error: unknown) => string);
		},
	) => {
		return sonnerToast.promise(promise, messages);
	},

	/**
	 * Dismiss a specific toast or all toasts
	 */
	dismiss: (toastId?: string | number) => {
		return sonnerToast.dismiss(toastId);
	},
};

export interface ToasterProps {
	position?:
		| "top-left"
		| "top-center"
		| "top-right"
		| "bottom-left"
		| "bottom-center"
		| "bottom-right";
	expand?: boolean;
	richColors?: boolean;
	closeButton?: boolean;
	duration?: number;
	visibleToasts?: number;
}

/**
 * Toaster component - place this in your root layout
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { Toaster } from "@/components/ui";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <Toaster />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function Toaster({
	position = "top-center",
	expand = false,
	richColors = true,
	closeButton = false,
	duration = 4000,
	visibleToasts = 3,
}: ToasterProps) {
	return (
		<SonnerToaster
			position={position}
			expand={expand}
			richColors={richColors}
			closeButton={closeButton}
			duration={duration}
			visibleToasts={visibleToasts}
			toastOptions={{
				style: {
					borderRadius: "12px",
				},
			}}
		/>
	);
}
