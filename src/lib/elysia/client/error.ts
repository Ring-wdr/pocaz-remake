/**
 * Utilities to normalize Eden Treaty error responses while preserving
 * validation errors from the server (these include field-level paths).
 */
export type EdenErrorPayload = {
	status?: number;
	value?: unknown;
	message?: string;
};

export type NormalizedEdenError =
	| {
			kind: "validation";
			status: number;
			value: unknown;
			message: string;
	  }
	| {
			kind: "http";
			status: number;
			message: string;
			value?: unknown;
	  }
	| {
			kind: "network";
			message: string;
	  }
	| {
			kind: "unknown";
			message: string;
	  };

export function normalizeEdenError(
	error?: EdenErrorPayload | null,
): NormalizedEdenError {
	if (!error) {
		return { kind: "unknown", message: "알 수 없는 오류가 발생했습니다." };
	}

	if (error.value && (isValidationError(error.value) || error.status === 422)) {
		return {
			kind: "validation",
			status: error.status ?? 422,
			message: error.message ?? "요청에 실패했습니다.",
			value: error.value,
		};
	}

	if (typeof error.status === "number") {
		return {
			kind: "http",
			status: error.status,
			message: extractMessage(error),
			value: error.value,
		};
	}

	if (error.message) {
		return { kind: "network", message: error.message };
	}

	return { kind: "unknown", message: "요청 처리 중 문제가 발생했습니다." };
}

export function extractMessage(error: EdenErrorPayload) {
	const fromValue =
		typeof error.value === "object" && error.value && "error" in error.value
			? (error.value as { error: string }).error
			: undefined;
	return (
		(fromValue as string | undefined) ?? error.message ?? "요청에 실패했습니다."
	);
}

function isValidationError(value: unknown) {
	if (!value || typeof value !== "object") return false;
	return (
		"value" in value &&
		typeof (value as { type?: string }).type === "string" &&
		(value as { type?: string }).type === "validation"
	);
}
