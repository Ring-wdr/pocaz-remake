import * as stylex from "@stylexjs/stylex";
import { User } from "lucide-react";
import type { ImgHTMLAttributes } from "react";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
} from "@/app/global-tokens.stylex";

const styles = stylex.create({
	base: {
		position: "relative",
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
		overflow: "hidden",
		backgroundColor: colors.bgTertiary,
		color: colors.textMuted,
	},
	// Sizes
	sm: {
		width: "32px",
		height: "32px",
	},
	md: {
		width: "48px",
		height: "48px",
	},
	lg: {
		width: "64px",
		height: "64px",
	},
	xl: {
		width: "80px",
		height: "80px",
	},
	// Shapes
	circle: {
		borderRadius: radius.full,
	},
	rounded: {
		borderRadius: radius.md,
	},
	// Image
	image: {
		width: "100%",
		height: "100%",
		objectFit: "cover",
	},
	// Fallback
	fallback: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
		height: "100%",
		fontWeight: fontWeight.medium,
		textTransform: "uppercase",
	},
	fallbackSm: {
		fontSize: fontSize.sm,
	},
	fallbackMd: {
		fontSize: fontSize.md,
	},
	fallbackLg: {
		fontSize: fontSize.lg,
	},
	fallbackXl: {
		fontSize: fontSize.xl,
	},
	// Badge container
	badgeContainer: {
		position: "absolute",
		bottom: "-2px",
		right: "-2px",
	},
});

const iconSizes: Record<AvatarSize, number> = {
	sm: 16,
	md: 24,
	lg: 32,
	xl: 40,
};

export type AvatarSize = "sm" | "md" | "lg" | "xl";
export type AvatarShape = "circle" | "rounded";

export interface AvatarProps
	extends Omit<ImgHTMLAttributes<HTMLImageElement>, "size"> {
	size?: AvatarSize;
	shape?: AvatarShape;
	alt?: string;
	fallback?: string;
	badge?: React.ReactNode;
}

const fallbackSizeStyles = {
	sm: styles.fallbackSm,
	md: styles.fallbackMd,
	lg: styles.fallbackLg,
	xl: styles.fallbackXl,
};

export function Avatar({
	size = "md",
	shape = "circle",
	src,
	alt = "",
	fallback,
	badge,
	...props
}: AvatarProps) {
	return (
		<div {...stylex.props(styles.base, styles[size], styles[shape])}>
			{src && (
				<img src={src} alt={alt} {...stylex.props(styles.image)} {...props} />
			)}
			{fallback && (
				<span {...stylex.props(styles.fallback, fallbackSizeStyles[size])}>
					{fallback.slice(0, 2)}
				</span>
			)}
			{!src && !fallback && <User size={iconSizes[size]} />}
			{badge && <div {...stylex.props(styles.badgeContainer)}>{badge}</div>}
		</div>
	);
}
