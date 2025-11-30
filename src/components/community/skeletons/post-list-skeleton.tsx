import * as stylex from "@stylexjs/stylex";

const shimmer = stylex.keyframes({
	"0%": { backgroundPosition: "-200% 0" },
	"100%": { backgroundPosition: "200% 0" },
});

const styles = stylex.create({
	container: {
		marginBottom: "16px",
	},
	item: {
		display: "flex",
		alignItems: "center",
		gap: "12px",
		paddingTop: "16px",
		paddingBottom: "16px",
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: "#e5e7eb",
	},
	thumbnail: {
		width: "64px",
		height: "64px",
		borderRadius: "8px",
		backgroundImage:
			"linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
		flexShrink: 0,
	},
	content: {
		flex: 1,
		minWidth: 0,
	},
	title: {
		height: "20px",
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
	meta: {
		display: "flex",
		gap: "8px",
	},
	metaItem: {
		width: "60px",
		height: "14px",
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

export default function PostListSkeleton() {
	return (
		<div {...stylex.props(styles.container)}>
			{Array.from({ length: 6 }).map((_, index) => (
				<div key={index} {...stylex.props(styles.item)}>
					<div {...stylex.props(styles.thumbnail)} />
					<div {...stylex.props(styles.content)}>
						<div {...stylex.props(styles.title)} />
						<div {...stylex.props(styles.meta)}>
							<div {...stylex.props(styles.metaItem)} />
							<div {...stylex.props(styles.metaItem)} />
							<div {...stylex.props(styles.metaItem)} />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
