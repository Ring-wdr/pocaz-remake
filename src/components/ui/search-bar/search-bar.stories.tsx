import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import { SearchBar } from "./search-bar";

const meta: Meta<typeof SearchBar> = {
	title: "UI/SearchBar",
	component: SearchBar,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["sm", "md", "lg"],
		},
	},
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

export const Default: Story = {
	args: {
		placeholder: "검색어를 입력하세요",
	},
};

export const Small: Story = {
	args: {
		size: "sm",
		placeholder: "검색",
	},
};

export const Large: Story = {
	args: {
		size: "lg",
		placeholder: "상품명, 그룹명으로 검색",
	},
};

export const WithDefaultValue: Story = {
	args: {
		defaultValue: "포토카드",
		placeholder: "검색어를 입력하세요",
	},
};

export const Controlled: Story = {
	render: () => {
		const [value, setValue] = useState("");
		const [searchedValue, setSearchedValue] = useState("");

		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 16, width: 300 }}>
				<SearchBar
					value={value}
					onChange={setValue}
					onSearch={setSearchedValue}
					placeholder="검색어를 입력하세요"
				/>
				<div style={{ fontSize: 14, color: "#666" }}>
					<p>현재 입력값: {value || "(없음)"}</p>
					<p>마지막 검색어: {searchedValue || "(없음)"}</p>
				</div>
			</div>
		);
	},
};

export const AllSizes: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 16, width: 300 }}>
			<SearchBar size="sm" placeholder="Small" />
			<SearchBar size="md" placeholder="Medium" />
			<SearchBar size="lg" placeholder="Large" />
		</div>
	),
};
