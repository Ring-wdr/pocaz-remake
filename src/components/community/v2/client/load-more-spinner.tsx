"use client";

import * as stylex from "@stylexjs/stylex";

import { colors } from "@/app/global-tokens.stylex";

const spin = stylex.keyframes({
	to: {
		transform: "rotate(360deg)",
	},
});

const styles = stylex.create({
	spinner: {
		display: "inline-block",
		width: "16px",
		height: "16px",
		borderWidth: "2px",
		borderStyle: "solid",
		borderColor: colors.borderSecondary,
		borderTopColor: colors.textPlaceholder,
		borderRadius: "50%",
		animationName: spin,
		animationDuration: "0.8s",
		animationTimingFunction: "linear",
		animationIterationCount: "infinite",
	},
});

type LoadMoreSpinnerProps = {
	size?: number;
};

export default function LoadMoreSpinner({ size = 16 }: LoadMoreSpinnerProps) {
	return (
		<span
			aria-hidden
			{...stylex.props(styles.spinner)}
			style={{ width: size, height: size, borderWidth: size / 8 }}
		/>
	);
}
