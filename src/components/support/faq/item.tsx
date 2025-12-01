"use client";

import * as stylex from "@stylexjs/stylex";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";

const styles = stylex.create({
	faqItem: {
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
		overflow: "hidden",
	},
	faqQuestion: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		width: "100%",
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		fontSize: fontSize.md,
		fontWeight: fontWeight.medium,
		color: colors.textSecondary,
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
		textAlign: "left",
	},
	faqIcon: {
		color: colors.textMuted,
		transition: "transform 0.2s ease",
	},
	faqIconOpen: {
		transform: "rotate(180deg)",
	},
	faqAnswer: {
		paddingTop: 0,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		fontSize: fontSize.md,
		color: colors.textMuted,
		lineHeight: 1.6,
		borderTopWidth: 1,
		borderTopStyle: "solid",
		borderTopColor: colors.borderPrimary,
	},
});

interface FAQ {
	id: number;
	question: string;
	answer: string;
}

export function FAQItem({ item }: { item: FAQ }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div {...stylex.props(styles.faqItem)}>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				{...stylex.props(styles.faqQuestion)}
			>
				<span>{item.question}</span>
				<ChevronDown
					size={18}
					{...stylex.props(styles.faqIcon, isOpen && styles.faqIconOpen)}
				/>
			</button>
			{isOpen && <div {...stylex.props(styles.faqAnswer)}>{item.answer}</div>}
		</div>
	);
}
