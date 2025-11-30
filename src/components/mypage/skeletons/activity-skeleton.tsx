import * as stylex from "@stylexjs/stylex";
import { colors } from "@/app/global-tokens.stylex";

const shimmer = stylex.keyframes({
	"0%": { backgroundPosition: "-200% 0" },
	"100%": { backgroundPosition: "200% 0" },
});

const styles = stylex.create({
	container: {
		marginBottom: "24px",
	},
	title: {
		width: "100px",
		height: "20px",
		marginBottom: "16px",
		borderRadius: "4px",
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	list: {},
	item: {
		display: "flex",
		alignItems: "center",
		gap: "12px",
		paddingTop: "12px",
		paddingBottom: "12px",
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.bgTertiary,
	},
	thumbnail: {
		width: "48px",
		height: "48px",
		borderRadius: "8px",
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
		flexShrink: 0,
	},
	content: {
		flex: 1,
	},
	contentTitle: {
		height: "16px",
		marginBottom: "6px",
		borderRadius: "4px",
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	meta: {
		width: "80px",
		height: "12px",
		borderRadius: "4px",
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
});

export default function ActivitySkeleton() {
	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.title)} />
			<div {...stylex.props(styles.list)}>
				{Array.from({ length: 4 }).map((_, index) => (
					<div key={index} {...stylex.props(styles.item)}>
						<div {...stylex.props(styles.thumbnail)} />
						<div {...stylex.props(styles.content)}>
							<div {...stylex.props(styles.contentTitle)} />
							<div {...stylex.props(styles.meta)} />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
