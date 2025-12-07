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
import { useControlledState } from "@/hooks/use-controlled-state";

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
		paddingTop: 0,
		paddingBottom: 0,
		paddingLeft: 0,
		paddingRight: 0,
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
		color: colors.textSecondary,
		fontSize: iconSize.sm,
		lineHeight: lineHeight.tight,
		transition: "opacity 0.15s ease",
		":hover": {
			opacity: 0.8,
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
	const [value, setValue] = useControlledState(
		controlledValue,
		defaultValue,
		onChange,
	);
	const [isFocused, setIsFocused] = useState(false);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setValue(newValue);
	};

	const handleClear = () => {
		setValue("");
		onClear?.();
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			onSearch?.(value);
		}
		if (e.key === "Escape" && value) {
			handleClear();
			e.currentTarget.blur();
			setIsFocused(false);
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
					type="url"
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
				{value && onClear && (
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
