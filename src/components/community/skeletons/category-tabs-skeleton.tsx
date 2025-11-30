import * as stylex from "@stylexjs/stylex";

const shimmer = stylex.keyframes({
	"0%": { backgroundPosition: "-200% 0" },
	"100%": { backgroundPosition: "200% 0" },
});

const styles = stylex.create({
	container: {
		display: "flex",
		gap: "8px",
		marginBottom: "16px",
		paddingBottom: "12px",
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: "#e5e7eb",
	},
	tab: {
		width: "80px",
		height: "36px",
		borderRadius: "18px",
		backgroundImage:
			"linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
});

export default function CategoryTabsSkeleton() {
	return (
		<div {...stylex.props(styles.container)}>
			{Array.from({ length: 4 }).map((_, index) => (
				<div key={index} {...stylex.props(styles.tab)} />
			))}
		</div>
	);
}
