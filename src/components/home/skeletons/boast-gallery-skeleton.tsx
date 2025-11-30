import * as stylex from "@stylexjs/stylex";

const shimmer = stylex.keyframes({
	"0%": { backgroundPosition: "-200% 0" },
	"100%": { backgroundPosition: "200% 0" },
});

const styles = stylex.create({
	container: {
		marginBottom: "24px",
	},
	header: {
		marginBottom: "14px",
	},
	titleSkeleton: {
		width: "80px",
		height: "28px",
		marginBottom: "4px",
		borderRadius: "4px",
		backgroundImage: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	descSkeleton: {
		width: "180px",
		height: "18px",
		borderRadius: "4px",
		backgroundImage: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	grid: {
		display: "grid",
		gridTemplateColumns: "repeat(3, 1fr)",
		gridTemplateRows: "repeat(3, 1fr)",
		margin: 0,
		padding: 0,
	},
	gridItem: {
		height: "144px",
		backgroundImage: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
});

export default function BoastGallerySkeleton() {
	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.header)}>
				<div {...stylex.props(styles.titleSkeleton)} />
				<div {...stylex.props(styles.descSkeleton)} />
			</div>
			<div {...stylex.props(styles.grid)}>
				{Array.from({ length: 9 }).map((_, index) => (
					<div key={index} {...stylex.props(styles.gridItem)} />
				))}
			</div>
		</div>
	);
}
