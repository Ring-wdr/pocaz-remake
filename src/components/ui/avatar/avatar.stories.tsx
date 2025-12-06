import type { Meta, StoryObj } from "@storybook/nextjs";
import { Badge } from "../badge";
import { Avatar } from "./avatar";

const meta: Meta<typeof Avatar> = {
	title: "UI/Avatar",
	component: Avatar,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["sm", "md", "lg", "xl"],
		},
		shape: {
			control: "select",
			options: ["circle", "rounded"],
		},
		src: { control: "text" },
		alt: { control: "text" },
		fallback: { control: "text" },
	},
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
	args: {
		size: "md",
	},
};

export const WithImage: Story = {
	args: {
		src: "https://i.pravatar.cc/150?img=1",
		alt: "사용자 프로필",
		size: "md",
	},
};

export const WithFallback: Story = {
	args: {
		fallback: "김철수",
		size: "md",
	},
};

export const Small: Story = {
	args: {
		src: "https://i.pravatar.cc/150?img=2",
		size: "sm",
	},
};

export const Large: Story = {
	args: {
		src: "https://i.pravatar.cc/150?img=3",
		size: "lg",
	},
};

export const ExtraLarge: Story = {
	args: {
		src: "https://i.pravatar.cc/150?img=4",
		size: "xl",
	},
};

export const Rounded: Story = {
	args: {
		src: "https://i.pravatar.cc/150?img=5",
		shape: "rounded",
		size: "lg",
	},
};

export const WithBadge: Story = {
	args: {
		src: "https://i.pravatar.cc/150?img=6",
		size: "lg",
		badge: (
			<Badge variant="success" dot style={{ padding: "4px" }}>
				{" "}
			</Badge>
		),
	},
};

export const AllSizes: Story = {
	render: () => (
		<div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
			<Avatar src="https://i.pravatar.cc/150?img=7" size="sm" />
			<Avatar src="https://i.pravatar.cc/150?img=8" size="md" />
			<Avatar src="https://i.pravatar.cc/150?img=9" size="lg" />
			<Avatar src="https://i.pravatar.cc/150?img=10" size="xl" />
		</div>
	),
};

export const FallbackVariants: Story = {
	render: () => (
		<div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
			<Avatar size="md" />
			<Avatar fallback="AB" size="md" />
			<Avatar fallback="김" size="md" />
			<Avatar fallback="John Doe" size="md" />
		</div>
	),
};
