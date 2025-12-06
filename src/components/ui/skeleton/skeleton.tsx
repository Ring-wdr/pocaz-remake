import * as stylex from "@stylexjs/stylex";
import { type HTMLAttributes } from "react";
import { colors, radius } from "@/app/global-tokens.stylex";

const REDUCED_MOTION = "@media (prefers-reduced-motion: reduce)" as const;

const shimmer = stylex.keyframes({
	"0%": { backgroundPosition: "-200% 0" },
	"100%": { backgroundPosition: "200% 0" },
});

const styles = stylex.create({
	base: {
		backgroundColor: colors.skeletonBase,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: {
			default: shimmer,
			[REDUCED_MOTION]: "none",
		},
		animationDuration: {
			default: "1.5s",
			[REDUCED_MOTION]: "0s",
		},
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	// Shapes
	text: {
		borderRadius: radius.xs,
		height: "1em",
	},
	circular: {
		borderRadius: radius.full,
	},
	rectangular: {
		borderRadius: radius.xs,
	},
	rounded: {
		borderRadius: radius.md,
	},
});

export type SkeletonVariant = "text" | "circular" | "rectangular" | "rounded";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
	variant?: SkeletonVariant;
	width?: string | number;
	height?: string | number;
}

export function Skeleton({
	variant = "text",
	width,
	height,
	style,
	...props
}: SkeletonProps) {
	const inlineStyle: React.CSSProperties = {
		...style,
		width: typeof width === "number" ? `${width}px` : width,
		height: typeof height === "number" ? `${height}px` : height,
	};

	return (
		<div
			aria-hidden="true"
			{...stylex.props(styles.base, styles[variant])}
			style={inlineStyle}
			{...props}
		/>
	);
}

// Preset components for common use cases
export interface SkeletonTextProps extends HTMLAttributes<HTMLDivElement> {
	lines?: number;
	lastLineWidth?: string;
}

export function SkeletonText({
	lines = 3,
	lastLineWidth = "60%",
	...props
}: SkeletonTextProps) {
	return (
		<div {...props}>
			{Array.from({ length: lines }).map((_, index) => (
				<Skeleton
					key={index}
					variant="text"
					width={index === lines - 1 ? lastLineWidth : "100%"}
					height={16}
					style={{ marginBottom: index < lines - 1 ? 8 : 0 }}
				/>
			))}
		</div>
	);
}

export interface SkeletonAvatarProps extends HTMLAttributes<HTMLDivElement> {
	size?: number | "sm" | "md" | "lg" | "xl";
}

const avatarSizes: Record<string, number> = {
	sm: 32,
	md: 48,
	lg: 64,
	xl: 80,
};

export function SkeletonAvatar({ size = "md", ...props }: SkeletonAvatarProps) {
	const sizeValue = typeof size === "number" ? size : avatarSizes[size];

	return (
		<Skeleton
			variant="circular"
			width={sizeValue}
			height={sizeValue}
			{...props}
		/>
	);
}

export interface SkeletonCardProps extends HTMLAttributes<HTMLDivElement> {
	imageHeight?: number;
	lines?: number;
}

const cardStyles = stylex.create({
	container: {
		display: "flex",
		flexDirection: "column",
	},
	image: {
		marginBottom: "12px",
	},
	content: {
		display: "flex",
		flexDirection: "column",
		gap: "8px",
	},
});

export function SkeletonCard({
	imageHeight = 150,
	lines = 2,
	...props
}: SkeletonCardProps) {
	return (
		<div {...stylex.props(cardStyles.container)} {...props}>
			<Skeleton
				variant="rounded"
				width="100%"
				height={imageHeight}
				{...stylex.props(cardStyles.image)}
			/>
			<div {...stylex.props(cardStyles.content)}>
				{Array.from({ length: lines }).map((_, index) => (
					<Skeleton
						key={index}
						variant="text"
						width={index === lines - 1 ? "60%" : "100%"}
						height={index === 0 ? 18 : 14}
					/>
				))}
			</div>
		</div>
	);
}
