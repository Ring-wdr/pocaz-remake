import * as stylex from "@stylexjs/stylex";

const shimmer = stylex.keyframes({
	"0%": { backgroundPosition: "-200% 0" },
	"100%": { backgroundPosition: "200% 0" },
});

const styles = stylex.create({
	container: {
		display: "flex",
		alignItems: "center",
		gap: "16px",
		paddingBottom: "20px",
		marginBottom: "20px",
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: "#e5e7eb",
	},
	avatar: {
		width: "72px",
		height: "72px",
		borderRadius: "36px",
		backgroundImage:
			"linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	info: {
		flex: 1,
	},
	name: {
		width: "120px",
		height: "24px",
		marginBottom: "8px",
		borderRadius: "4px",
		backgroundImage:
			"linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	email: {
		width: "180px",
		height: "16px",
		borderRadius: "4px",
		backgroundImage:
			"linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
});

export default function ProfileSkeleton() {
	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.avatar)} />
			<div {...stylex.props(styles.info)}>
				<div {...stylex.props(styles.name)} />
				<div {...stylex.props(styles.email)} />
			</div>
		</div>
	);
}
