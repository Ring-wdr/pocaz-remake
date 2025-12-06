import type { Meta, StoryObj } from "@storybook/nextjs";
import { Mail, Search, Eye } from "lucide-react";
import { Input } from "./input";

const meta: Meta<typeof Input> = {
	title: "UI/Input",
	component: Input,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["sm", "md", "lg"],
		},
		disabled: { control: "boolean" },
	},
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
	args: {
		placeholder: "텍스트를 입력하세요",
	},
};

export const WithLabel: Story = {
	args: {
		label: "이메일",
		placeholder: "example@email.com",
	},
};

export const WithError: Story = {
	args: {
		label: "이메일",
		placeholder: "example@email.com",
		error: "올바른 이메일 형식이 아닙니다",
	},
};

export const WithHelperText: Story = {
	args: {
		label: "비밀번호",
		type: "password",
		helperText: "8자 이상 입력해주세요",
	},
};

export const WithLeftIcon: Story = {
	args: {
		label: "이메일",
		placeholder: "example@email.com",
		leftIcon: <Mail size={18} />,
	},
};

export const WithRightIcon: Story = {
	args: {
		label: "비밀번호",
		type: "password",
		rightIcon: <Eye size={18} />,
	},
};

export const WithBothIcons: Story = {
	args: {
		label: "검색",
		placeholder: "검색어를 입력하세요",
		leftIcon: <Search size={18} />,
	},
};

export const Small: Story = {
	args: {
		size: "sm",
		placeholder: "Small input",
	},
};

export const Large: Story = {
	args: {
		size: "lg",
		placeholder: "Large input",
	},
};

export const Disabled: Story = {
	args: {
		label: "비활성화된 입력",
		value: "수정 불가",
		disabled: true,
	},
};

export const AllSizes: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "300px" }}>
			<Input size="sm" placeholder="Small" />
			<Input size="md" placeholder="Medium" />
			<Input size="lg" placeholder="Large" />
		</div>
	),
};
