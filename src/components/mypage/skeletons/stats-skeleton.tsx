import * as stylex from "@stylexjs/stylex";
import { colors } from "@/app/global-tokens.stylex";

const shimmer = stylex.keyframes({
	"0%": { backgroundPosition: "-200% 0" },
	"100%": { backgroundPosition: "200% 0" },
});

const styles = stylex.create({
	container: {
		display: "grid",
		gridTemplateColumns: "repeat(3, 1fr)",
		gap: "12px",
		marginBottom: "24px",
	},
	item: {
		paddingTop: "16px",
		paddingBottom: "16px",
		backgroundColor: colors.bgSecondary,
		borderRadius: "12px",
		textAlign: "center",
	},
	number: {
		width: "40px",
		height: "28px",
		margin: "0 auto",
		marginBottom: "4px",
		borderRadius: "4px",
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	label: {
		width: "50px",
		height: "14px",
		margin: "0 auto",
		borderRadius: "4px",
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
});

export default function StatsSkeleton() {
	return (
		<div {...stylex.props(styles.container)}>
			{Array.from({ length: 3 }).map((_, index) => (
				<div key={index} {...stylex.props(styles.item)}>
					<div {...stylex.props(styles.number)} />
					<div {...stylex.props(styles.label)} />
				</div>
			))}
		</div>
	);
}
