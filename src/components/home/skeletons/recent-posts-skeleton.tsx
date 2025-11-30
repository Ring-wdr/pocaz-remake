import * as stylex from "@stylexjs/stylex";

const shimmer = stylex.keyframes({
	"0%": { backgroundPosition: "-200% 0" },
	"100%": { backgroundPosition: "200% 0" },
});

const styles = stylex.create({
	container: {
		marginBottom: "24px",
	},
	titleSkeleton: {
		width: "120px",
		height: "28px",
		marginBottom: "14px",
		borderRadius: "4px",
		backgroundImage: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	list: {
		listStyle: "none",
		margin: 0,
		padding: 0,
	},
	listItem: {
		display: "flex",
		justifyContent: "space-between",
		marginBottom: "6px",
	},
	titleLine: {
		flex: 1,
		height: "18px",
		marginRight: "14px",
		borderRadius: "4px",
		backgroundImage: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	dateLine: {
		width: "80px",
		height: "18px",
		borderRadius: "4px",
		backgroundImage: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
});

export default function RecentPostsSkeleton() {
	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.titleSkeleton)} />
			<ul {...stylex.props(styles.list)}>
				{Array.from({ length: 5 }).map((_, index) => (
					<li key={index} {...stylex.props(styles.listItem)}>
						<div {...stylex.props(styles.titleLine)} />
						<div {...stylex.props(styles.dateLine)} />
					</li>
				))}
			</ul>
		</div>
	);
}
