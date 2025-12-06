import type { Meta, StoryObj } from "@storybook/nextjs";
import { Heart, Send, Trash2 } from "lucide-react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
	title: "UI/Button",
	component: Button,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["primary", "secondary", "ghost", "danger", "outline"],
		},
		size: {
			control: "select",
			options: ["sm", "md", "lg"],
		},
		fullWidth: { control: "boolean" },
		iconOnly: { control: "boolean" },
		disabled: { control: "boolean" },
	},
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
	args: {
		variant: "primary",
		children: "저장하기",
	},
};

export const Secondary: Story = {
	args: {
		variant: "secondary",
		children: "취소",
	},
};

export const Ghost: Story = {
	args: {
		variant: "ghost",
		children: "더보기",
	},
};

export const Danger: Story = {
	args: {
		variant: "danger",
		children: "삭제",
	},
};

export const Outline: Story = {
	args: {
		variant: "outline",
		children: "편집",
	},
};

export const Small: Story = {
	args: {
		size: "sm",
		children: "Small",
	},
};

export const Medium: Story = {
	args: {
		size: "md",
		children: "Medium",
	},
};

export const Large: Story = {
	args: {
		size: "lg",
		children: "Large",
	},
};

export const FullWidth: Story = {
	args: {
		fullWidth: true,
		children: "전체 너비 버튼",
	},
	decorators: [
		(Story) => (
			<div style={{ width: "300px" }}>
				<Story />
			</div>
		),
	],
};

export const WithIcon: Story = {
	args: {
		children: (
			<>
				<Heart size={16} />
				좋아요
			</>
		),
	},
};

export const IconOnly: Story = {
	args: {
		iconOnly: true,
		variant: "ghost",
		children: <Trash2 size={18} />,
		"aria-label": "삭제",
	},
};

export const Disabled: Story = {
	args: {
		disabled: true,
		children: "비활성화",
	},
};

export const AllVariants: Story = {
	render: () => (
		<div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
			<Button variant="primary">Primary</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="danger">Danger</Button>
			<Button variant="outline">Outline</Button>
		</div>
	),
};

export const AllSizes: Story = {
	render: () => (
		<div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
			<Button size="sm">Small</Button>
			<Button size="md">Medium</Button>
			<Button size="lg">Large</Button>
		</div>
	),
};
