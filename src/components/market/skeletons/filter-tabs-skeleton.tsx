import * as stylex from "@stylexjs/stylex";
import { colors } from "@/app/global-tokens.stylex";

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
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
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
