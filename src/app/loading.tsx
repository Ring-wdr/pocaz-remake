import * as stylex from "@stylexjs/stylex";

const spin = stylex.keyframes({
	"0%": { transform: "rotate(0deg)" },
	"100%": { transform: "rotate(360deg)" },
});

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#fff",
		paddingTop: "40px",
		paddingBottom: "40px",
	},
	spinner: {
		width: "48px",
		height: "48px",
		borderWidth: 3,
		borderStyle: "solid",
		borderColor: "#e5e7eb",
		borderTopColor: "#000",
		borderRadius: "24px",
		animationName: spin,
		animationDuration: "0.8s",
		animationTimingFunction: "linear",
		animationIterationCount: "infinite",
	},
	text: {
		marginTop: "16px",
		fontSize: "14px",
		color: "#6b7280",
	},
});

export default function Loading() {
	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.spinner)} />
			<p {...stylex.props(styles.text)}>로딩 중...</p>
		</div>
	);
}
