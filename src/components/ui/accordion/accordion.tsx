"use client";

import * as stylex from "@stylexjs/stylex";
import { ChevronDown } from "lucide-react";
import {
	createContext,
	type HTMLAttributes,
	type ReactNode,
	useContext,
	useState,
} from "react";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";

const REDUCED_MOTION = "@media (prefers-reduced-motion: reduce)" as const;

const styles = stylex.create({
	root: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xs,
	},
	item: {
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
		overflow: "hidden",
	},
	itemBordered: {
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
	},
	trigger: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		width: "100%",
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.md,
		paddingRight: spacing.md,
		fontSize: fontSize.md,
		fontWeight: fontWeight.medium,
		color: colors.textSecondary,
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
		textAlign: "left",
		transition: "background-color 0.15s ease",
		":hover": {
			backgroundColor: colors.bgTertiary,
		},
		":focus-visible": {
			outlineWidth: 2,
			outlineStyle: "solid",
			outlineColor: colors.accentPrimary,
			outlineOffset: "-2px",
		},
	},
	triggerSm: {
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		fontSize: fontSize.sm,
	},
	triggerLg: {
		paddingTop: spacing.md,
		paddingBottom: spacing.md,
		paddingLeft: spacing.lg,
		paddingRight: spacing.lg,
		fontSize: fontSize.base,
	},
	icon: {
		color: colors.textMuted,
		transition: {
			default: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
			[REDUCED_MOTION]: "none",
		},
		flexShrink: 0,
	},
	iconOpen: {
		transform: "rotate(180deg)",
	},
	// Content wrapper with grid animation
	contentWrapper: {
		display: "grid",
		gridTemplateRows: "0fr",
		transition: {
			default: "grid-template-rows 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
			[REDUCED_MOTION]: "none",
		},
	},
	contentWrapperOpen: {
		gridTemplateRows: "1fr",
	},
	contentInner: {
		overflow: "hidden",
	},
	content: {
		paddingTop: 0,
		paddingBottom: spacing.md,
		paddingLeft: spacing.md,
		paddingRight: spacing.md,
		fontSize: fontSize.md,
		color: colors.textMuted,
		lineHeight: 1.6,
		borderTopWidth: 1,
		borderTopStyle: "solid",
		borderTopColor: colors.borderPrimary,
	},
	contentSm: {
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		fontSize: fontSize.sm,
	},
	contentLg: {
		paddingBottom: spacing.lg,
		paddingLeft: spacing.lg,
		paddingRight: spacing.lg,
		fontSize: fontSize.base,
	},
});

export type AccordionSize = "sm" | "md" | "lg";

// Context for accordion state
interface AccordionItemContextValue {
	isOpen: boolean;
	toggle: () => void;
	size: AccordionSize;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(
	null,
);

function useAccordionItem() {
	const context = useContext(AccordionItemContext);
	if (!context) {
		throw new Error("Accordion components must be used within AccordionItem");
	}
	return context;
}

// Root
export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
}

export function Accordion({ children, ...props }: AccordionProps) {
	return (
		<div {...stylex.props(styles.root)} {...props}>
			{children}
		</div>
	);
}

// Item
export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
	defaultOpen?: boolean;
	size?: AccordionSize;
	bordered?: boolean;
}

export function AccordionItem({
	children,
	defaultOpen = false,
	size = "md",
	bordered = false,
	...props
}: AccordionItemProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<AccordionItemContext.Provider
			value={{ isOpen, toggle: () => setIsOpen((prev) => !prev), size }}
		>
			<div
				{...stylex.props(styles.item, bordered && styles.itemBordered)}
				{...props}
			>
				{children}
			</div>
		</AccordionItemContext.Provider>
	);
}

// Trigger
export interface AccordionTriggerProps
	extends HTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
	hideIcon?: boolean;
}

const sizeStyles = {
	sm: styles.triggerSm,
	md: null,
	lg: styles.triggerLg,
} as const;

const iconSizes = {
	sm: 16,
	md: 18,
	lg: 20,
} as const;

export function AccordionTrigger({
	children,
	hideIcon = false,
	...props
}: AccordionTriggerProps) {
	const { isOpen, toggle, size } = useAccordionItem();
	const sizeStyle = sizeStyles[size];
	const iconSize = iconSizes[size];

	return (
		<button
			type="button"
			onClick={toggle}
			aria-expanded={isOpen}
			{...stylex.props(styles.trigger, sizeStyle)}
			{...props}
		>
			<span>{children}</span>
			{!hideIcon && (
				<ChevronDown
					size={iconSize}
					{...stylex.props(styles.icon, isOpen && styles.iconOpen)}
				/>
			)}
		</button>
	);
}

// Content
export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
}

export function AccordionContent({
	children,
	...props
}: AccordionContentProps) {
	const { isOpen, size } = useAccordionItem();

	const sizeStyle = {
		sm: styles.contentSm,
		md: null,
		lg: styles.contentLg,
	}[size];

	return (
		<div
			{...stylex.props(
				styles.contentWrapper,
				isOpen && styles.contentWrapperOpen,
			)}
		>
			<div {...stylex.props(styles.contentInner)}>
				<div {...stylex.props(styles.content, sizeStyle)} {...props}>
					{children}
				</div>
			</div>
		</div>
	);
}
