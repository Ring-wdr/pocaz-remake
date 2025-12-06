// Re-export from new location for backward compatibility
// TODO: Migrate usages to import from @/components/ui/search-bar
"use client";

import { SearchBar as UISearchBar } from "@/components/ui/search-bar";

interface SearchBarProps {
	initialValue?: string;
	onSearch?: (query: string) => void;
}

export default function SearchBar({ initialValue = "", onSearch }: SearchBarProps) {
	return (
		<UISearchBar
			defaultValue={initialValue}
			placeholder="아티스트, 앨범, 포카 이름 검색"
			onChange={onSearch}
		/>
	);
}
