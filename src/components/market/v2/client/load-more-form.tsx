"use client";

import * as stylex from "@stylexjs/stylex";

import {
	fontSize,
	fontWeight,
	radius,
	spacing,
	colors,
} from "@/app/global-tokens.stylex";

const styles = stylex.create({
	wrap: {
		marginTop: spacing.md,
		display: "flex",
		justifyContent: "center",
	},
	button: {
		minWidth: "160px",
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.textInverse,
		backgroundColor: colors.bgInverse,
		borderWidth: 0,
		borderRadius: radius.sm,
		cursor: "pointer",
	},
	disabled: {
		opacity: 0.6,
		cursor: "not-allowed",
	},
});

type LoadMoreFormProps = {
	onLoadMore: () => void;
	pending: boolean;
	disabled: boolean;
};

export default function LoadMoreForm({
	onLoadMore,
	pending,
	disabled,
}: LoadMoreFormProps) {
	return (
		<div {...stylex.props(styles.wrap)}>
			<button
				type="button"
				onClick={onLoadMore}
				disabled={disabled}
				aria-busy={pending}
				aria-disabled={disabled}
				{...stylex.props(styles.button, disabled && styles.disabled)}
			>
				{pending ? "불러오는 중..." : "더 보기"}
			</button>
		</div>
	);
}
