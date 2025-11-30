"use client";

import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const styles = stylex.create({
	container: {
		marginBottom: "16px",
	},
	inputWrap: {
		display: "flex",
		alignItems: "center",
		gap: "8px",
		paddingTop: "10px",
		paddingBottom: "10px",
		paddingLeft: "12px",
		paddingRight: "12px",
		backgroundColor: "#f3f4f6",
		borderRadius: "8px",
	},
	searchIcon: {
		fontSize: "18px",
		color: "#9ca3af",
	},
	input: {
		flex: 1,
		fontSize: "14px",
		backgroundColor: "transparent",
		borderWidth: 0,
		outline: "none",
		color: "#111827",
		"::placeholder": {
			color: "#9ca3af",
		},
	},
	clearButton: {
		padding: "4px",
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
		color: "#9ca3af",
		fontSize: "16px",
		lineHeight: 1,
	},
});

interface SearchBarProps {
	onSearch?: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
	const [query, setQuery] = useState("");

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
				<i className="ri-search-line" {...stylex.props(styles.searchIcon)} />
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
						<i className="ri-close-circle-fill" />
					</button>
				)}
			</div>
		</div>
	);
}
