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
		overflowX: "auto",
	},
	tab: {
		width: "70px",
		height: "32px",
		borderRadius: "16px",
		backgroundImage:
			"linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
		flexShrink: 0,
	},
});

export default function FilterTabsSkeleton() {
	return (
		<div {...stylex.props(styles.container)}>
			{Array.from({ length: 5 }).map((_, index) => (
				<div key={index} {...stylex.props(styles.tab)} />
			))}
		</div>
	);
}
