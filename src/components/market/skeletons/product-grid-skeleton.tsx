import * as stylex from "@stylexjs/stylex";
import { colors } from "@/app/global-tokens.stylex";

const shimmer = stylex.keyframes({
	"0%": { backgroundPosition: "-200% 0" },
	"100%": { backgroundPosition: "200% 0" },
});

const styles = stylex.create({
	grid: {
		display: "grid",
		gridTemplateColumns: "repeat(2, 1fr)",
		gap: "12px",
	},
	item: {
		display: "flex",
		flexDirection: "column",
	},
	image: {
		aspectRatio: "1",
		borderRadius: "8px",
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	info: {
		paddingTop: "8px",
	},
	title: {
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
	price: {
		width: "60px",
		height: "18px",
		borderRadius: "4px",
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
});

export default function ProductGridSkeleton() {
	return (
		<div {...stylex.props(styles.grid)}>
			{Array.from({ length: 8 }).map((_, index) => (
				<div key={index} {...stylex.props(styles.item)}>
					<div {...stylex.props(styles.image)} />
					<div {...stylex.props(styles.info)}>
						<div {...stylex.props(styles.title)} />
						<div {...stylex.props(styles.price)} />
					</div>
				</div>
			))}
		</div>
	);
}
