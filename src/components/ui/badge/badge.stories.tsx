import type { Meta, StoryObj } from "@storybook/nextjs";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
	title: "UI/Badge",
	component: Badge,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["default", "primary", "success", "warning", "error", "info"],
		},
		size: {
			control: "select",
			options: ["sm", "md", "lg"],
		},
		outline: { control: "boolean" },
		dot: { control: "boolean" },
	},
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
	args: {
		variant: "default",
		children: "기본",
	},
};

export const Primary: Story = {
	args: {
		variant: "primary",
		children: "알림",
	},
};

export const Success: Story = {
	args: {
		variant: "success",
		children: "완료",
	},
};

export const Warning: Story = {
	args: {
		variant: "warning",
		children: "주의",
	},
};

export const Error: Story = {
	args: {
		variant: "error",
		children: "에러",
	},
};

export const Info: Story = {
	args: {
		variant: "info",
		children: "정보",
	},
};

export const WithDot: Story = {
	args: {
		variant: "success",
		dot: true,
		children: "온라인",
	},
};

export const Outline: Story = {
	args: {
		variant: "error",
		outline: true,
		children: "품절",
	},
};

export const Small: Story = {
	args: {
		size: "sm",
		children: "Small",
	},
};

export const Large: Story = {
	args: {
		size: "lg",
		children: "Large",
	},
};

export const AllVariants: Story = {
	render: () => (
		<div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
			<Badge variant="default">Default</Badge>
			<Badge variant="primary">Primary</Badge>
			<Badge variant="success">Success</Badge>
			<Badge variant="warning">Warning</Badge>
			<Badge variant="error">Error</Badge>
			<Badge variant="info">Info</Badge>
		</div>
	),
};

export const AllOutline: Story = {
	render: () => (
		<div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
			<Badge variant="default" outline>Default</Badge>
			<Badge variant="primary" outline>Primary</Badge>
			<Badge variant="success" outline>Success</Badge>
			<Badge variant="warning" outline>Warning</Badge>
			<Badge variant="error" outline>Error</Badge>
			<Badge variant="info" outline>Info</Badge>
		</div>
	),
};

export const WithDots: Story = {
	render: () => (
		<div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
			<Badge variant="success" dot>온라인</Badge>
			<Badge variant="error" dot>오프라인</Badge>
			<Badge variant="warning" dot>자리비움</Badge>
		</div>
	),
};
