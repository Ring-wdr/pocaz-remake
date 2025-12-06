"use client";

import * as stylex from "@stylexjs/stylex";
import { Search, XCircle } from "lucide-react";
import {
	type ChangeEvent,
	type KeyboardEvent,
	useEffect,
	useState,
} from "react";
import {
	colors,
	fontSize,
	iconSize,
	lineHeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";

const styles = stylex.create({
	container: {
		width: "100%",
	},
	inputWrap: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxs,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		backgroundColor: colors.bgTertiary,
		borderRadius: radius.sm,
		transition: "box-shadow 0.15s ease",
	},
	inputWrapFocused: {
		boxShadow: `0 0 0 2px ${colors.accentPrimary}`,
	},
	searchIcon: {
		flexShrink: 0,
		fontSize: iconSize.md,
		color: colors.textPlaceholder,
	},
	input: {
		flex: 1,
		minWidth: 0,
		fontSize: fontSize.md,
		backgroundColor: "transparent",
		borderWidth: 0,
		outline: "none",
		color: colors.textSecondary,
		"::placeholder": {
			color: colors.textPlaceholder,
		},
	},
	clearButton: {
		flexShrink: 0,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		padding: spacing.xxxs,
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
		color: colors.textPlaceholder,
		fontSize: iconSize.sm,
		lineHeight: lineHeight.tight,
		transition: "color 0.15s ease",
		":hover": {
			color: colors.textSecondary,
		},
	},
	// Size variants
	sm: {
		paddingTop: spacing.xxxs,
		paddingBottom: spacing.xxxs,
	},
	md: {
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
	},
	lg: {
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
	},
});

export type SearchBarSize = "sm" | "md" | "lg";

export interface SearchBarProps {
	value?: string;
	defaultValue?: string;
	placeholder?: string;
	size?: SearchBarSize;
	onChange?: (value: string) => void;
	onSearch?: (value: string) => void;
	onClear?: () => void;
	autoFocus?: boolean;
	className?: string;
}

export function SearchBar({
	value: controlledValue,
	defaultValue = "",
	placeholder = "검색어를 입력하세요",
	size = "md",
	onChange,
	onSearch,
	onClear,
	autoFocus = false,
}: SearchBarProps) {
	const isControlled = controlledValue !== undefined;
	const [internalValue, setInternalValue] = useState(defaultValue);
	const [isFocused, setIsFocused] = useState(false);

	const value = isControlled ? controlledValue : internalValue;

	useEffect(() => {
		if (!isControlled) {
			setInternalValue(defaultValue);
		}
	}, [defaultValue, isControlled]);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		if (!isControlled) {
			setInternalValue(newValue);
		}
		onChange?.(newValue);
	};

	const handleClear = () => {
		if (!isControlled) {
			setInternalValue("");
		}
		onChange?.("");
		onClear?.();
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			onSearch?.(value);
		}
		if (e.key === "Escape" && value) {
			handleClear();
		}
	};

	return (
		<div {...stylex.props(styles.container)}>
			<div
				{...stylex.props(
					styles.inputWrap,
					styles[size],
					isFocused && styles.inputWrapFocused,
				)}
			>
				<Search size={18} {...stylex.props(styles.searchIcon)} aria-hidden />
				<input
					type="search"
					placeholder={placeholder}
					value={value}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					autoFocus={autoFocus}
					aria-label={placeholder}
					{...stylex.props(styles.input)}
				/>
				{value && (
					<button
						type="button"
						onClick={handleClear}
						aria-label="검색어 지우기"
						{...stylex.props(styles.clearButton)}
					>
						<XCircle size={16} />
					</button>
				)}
			</div>
		</div>
	);
}
