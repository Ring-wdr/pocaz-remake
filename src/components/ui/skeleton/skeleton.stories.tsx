import type { Meta, StoryObj } from "@storybook/nextjs";
import { Skeleton, SkeletonAvatar, SkeletonCard, SkeletonText } from "./skeleton";

const meta: Meta<typeof Skeleton> = {
	title: "UI/Skeleton",
	component: Skeleton,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["text", "circular", "rectangular", "rounded"],
		},
	},
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Text: Story = {
	args: {
		variant: "text",
		width: 200,
		height: 16,
	},
};

export const Circular: Story = {
	args: {
		variant: "circular",
		width: 48,
		height: 48,
	},
};

export const Rectangular: Story = {
	args: {
		variant: "rectangular",
		width: 200,
		height: 100,
	},
};

export const Rounded: Story = {
	args: {
		variant: "rounded",
		width: 200,
		height: 150,
	},
};

export const TextBlock: Story = {
	render: () => <SkeletonText lines={4} style={{ width: "300px" }} />,
	name: "SkeletonText",
};

export const AvatarSizes: Story = {
	render: () => (
		<div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
			<SkeletonAvatar size="sm" />
			<SkeletonAvatar size="md" />
			<SkeletonAvatar size="lg" />
			<SkeletonAvatar size="xl" />
		</div>
	),
	name: "SkeletonAvatar",
};

export const Card: Story = {
	render: () => (
		<div style={{ width: "250px" }}>
			<SkeletonCard imageHeight={180} lines={3} />
		</div>
	),
	name: "SkeletonCard",
};

export const ListItem: Story = {
	render: () => (
		<div style={{ display: "flex", gap: "12px", alignItems: "center", width: "300px" }}>
			<SkeletonAvatar size="md" />
			<div style={{ flex: 1 }}>
				<Skeleton variant="text" width="60%" height={16} style={{ marginBottom: 8 }} />
				<Skeleton variant="text" width="80%" height={14} />
			</div>
		</div>
	),
};

export const ProductCard: Story = {
	render: () => (
		<div style={{ width: "200px" }}>
			<Skeleton variant="rounded" width="100%" height={200} style={{ marginBottom: 12 }} />
			<Skeleton variant="text" width="40%" height={12} style={{ marginBottom: 4 }} />
			<Skeleton variant="text" width="70%" height={16} style={{ marginBottom: 4 }} />
			<Skeleton variant="text" width="50%" height={14} style={{ marginBottom: 8 }} />
			<Skeleton variant="text" width="60%" height={18} />
		</div>
	),
};

export const ChatList: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "350px" }}>
			{[1, 2, 3].map((i) => (
				<div key={i} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
					<SkeletonAvatar size={52} />
					<div style={{ flex: 1 }}>
						<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
							<Skeleton variant="text" width="40%" height={16} />
							<Skeleton variant="text" width="15%" height={12} />
						</div>
						<Skeleton variant="text" width="70%" height={14} />
					</div>
				</div>
			))}
		</div>
	),
};
