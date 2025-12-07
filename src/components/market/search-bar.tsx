// Re-export from new location for backward compatibility
// TODO: Migrate usages to import from @/components/ui/search-bar
"use client";

import { SearchBar as UISearchBar } from "@/components/ui/search-bar";

interface SearchBarProps {
	value?: string;
	initialValue?: string;
	onChange?: (query: string) => void;
	onSearch?: (query: string) => void;
}

export default function SearchBar({
	value,
	initialValue = "",
	onChange,
	onSearch,
}: SearchBarProps) {
	return (
		<UISearchBar
			value={value}
			defaultValue={initialValue}
			placeholder="아티스트, 앨범, 포카 이름 검색"
			onChange={onChange}
			onSearch={onSearch}
			onClear={() => onChange?.("")}
		/>
	);
}
