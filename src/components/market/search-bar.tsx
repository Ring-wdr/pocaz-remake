"use client";

import * as stylex from "@stylexjs/stylex";
import { Search, XCircle } from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";

import { colors, fontSize, iconSize, lineHeight, radius, spacing } from "@/app/global-tokens.stylex";

const styles = stylex.create({
	container: {
		marginBottom: spacing.sm,
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
	},
	searchIcon: {
		fontSize: iconSize.md,
		color: colors.textPlaceholder,
	},
	input: {
		flex: 1,
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
		padding: spacing.xxxs,
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
		color: colors.textPlaceholder,
		fontSize: iconSize.sm,
		lineHeight: lineHeight.tight,
	},
});

interface SearchBarProps {
	initialValue?: string;
	onSearch?: (query: string) => void;
}

export default function SearchBar({ initialValue = "", onSearch }: SearchBarProps) {
	const [query, setQuery] = useState(initialValue);

	useEffect(() => {
		setQuery(initialValue);
	}, [initialValue]);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setQuery(value);
		onSearch?.(value);
	};

	const handleClear = () => {
		setQuery("");
		onSearch?.("");
	};

	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.inputWrap)}>
				<Search size={18} {...stylex.props(styles.searchIcon)} />
				<input
					type="text"
					placeholder="아티스트, 앨범, 포카 이름 검색"
					value={query}
					onChange={handleChange}
					{...stylex.props(styles.input)}
				/>
				{query && (
					<button
						type="button"
						onClick={handleClear}
						{...stylex.props(styles.clearButton)}
					>
						<XCircle size={16} />
					</button>
				)}
			</div>
		</div>
	);
}
