import * as stylex from "@stylexjs/stylex";
import {
	colors,
	fontSize,
	lineHeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import { mypageStyles } from "../mypage-styles.stylex";

const shimmer = stylex.keyframes({
	"0%": { backgroundPosition: "-200% 0" },
	"100%": { backgroundPosition: "200% 0" },
});

const styles = stylex.create({
	block: {
		borderRadius: radius.xs,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	title: {
		width: "20%",
		height: `calc(${fontSize.md} * ${lineHeight.normal})`,
	},
	content: {
		flex: 1,
		minWidth: 0,
	},
	contentTitle: {
		width: "72%",
		height: `calc(${fontSize.md} * ${lineHeight.normal})`,
		marginBottom: spacing.xxxs,
	},
	meta: {
		width: "36%",
		height: `calc(${fontSize.sm} * ${lineHeight.normal})`,
	},
	badge: {
		flexShrink: 0,
		width: "44px",
		height: `calc(${fontSize.sm} * ${lineHeight.normal} + ${spacing.xxxs} * 2)`,
	},
});

export default function ActivitySkeleton() {
	return (
		<div {...stylex.props(mypageStyles.section)}>
			<div {...stylex.props(mypageStyles.sectionHeader)}>
				<div {...stylex.props(styles.block, styles.title)} />
			</div>
			<div {...stylex.props(mypageStyles.card)}>
				{Array.from({ length: 4 }).map((_, index) => (
					<div key={index} {...stylex.props(mypageStyles.row)}>
						<div {...stylex.props(styles.content)}>
							<div {...stylex.props(styles.block, styles.contentTitle)} />
							<div {...stylex.props(styles.block, styles.meta)} />
						</div>
						<div {...stylex.props(styles.block, styles.badge)} />
					</div>
				))}
			</div>
		</div>
	);
}
