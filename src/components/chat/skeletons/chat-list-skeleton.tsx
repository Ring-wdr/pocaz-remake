import * as stylex from "@stylexjs/stylex";

const shimmer = stylex.keyframes({
	"0%": { backgroundPosition: "-200% 0" },
	"100%": { backgroundPosition: "200% 0" },
});

const styles = stylex.create({
	container: {},
	item: {
		display: "flex",
		alignItems: "center",
		gap: "12px",
		paddingTop: "16px",
		paddingBottom: "16px",
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: "#f3f4f6",
	},
	avatar: {
		width: "52px",
		height: "52px",
		borderRadius: "26px",
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
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: "6px",
	},
	name: {
		width: "80px",
		height: "18px",
		borderRadius: "4px",
		backgroundImage:
			"linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	time: {
		width: "40px",
		height: "12px",
		borderRadius: "4px",
		backgroundImage:
			"linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	message: {
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

export default function ChatListSkeleton() {
	return (
		<div {...stylex.props(styles.container)}>
			{Array.from({ length: 6 }).map((_, index) => (
				<div key={index} {...stylex.props(styles.item)}>
					<div {...stylex.props(styles.avatar)} />
					<div {...stylex.props(styles.content)}>
						<div {...stylex.props(styles.header)}>
							<div {...stylex.props(styles.name)} />
							<div {...stylex.props(styles.time)} />
						</div>
						<div {...stylex.props(styles.message)} />
					</div>
				</div>
			))}
		</div>
	);
}
