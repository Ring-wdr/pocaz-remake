import * as stylex from "@stylexjs/stylex";

import {
	colors,
	fontSize,
	lineHeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";

const shimmer = stylex.keyframes({
	"0%": { backgroundPosition: "-200% 0" },
	"100%": { backgroundPosition: "200% 0" },
});

const styles = stylex.create({
	container: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.sm,
	},
	headerRow: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxs,
		minHeight: "44px",
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderRadius: radius.md,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	filterRow: {
		display: "flex",
		gap: spacing.xxs,
	},
	filterPill: {
		height: `calc(${fontSize.sm} * ${lineHeight.normal} + ${spacing.xxxs} * 2)`,
		borderRadius: radius.md,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	filterPillWide: {
		width: "30%",
	},
	filterPillMedium: {
		width: "24%",
	},
	filterPillNarrow: {
		width: "20%",
	},
	list: {
		display: "flex",
		flexDirection: "column",
	},
	item: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderSecondary,
	},
	avatar: {
		width: "52px",
		height: "52px",
		borderRadius: "26px",
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
		minWidth: 0,
	},
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: spacing.xxxs,
	},
	name: {
		width: "64%",
		height: `calc(${fontSize.md} * ${lineHeight.normal})`,
		borderRadius: radius.xs,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	time: {
		width: "22%",
		height: `calc(${fontSize.sm} * ${lineHeight.normal})`,
		borderRadius: radius.xs,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	message: {
		height: `calc(${fontSize.md} * ${lineHeight.normal})`,
		borderRadius: radius.xs,
		backgroundImage: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 50%, ${colors.skeletonBase} 75%)`,
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
});

interface ChatListSkeletonProps {
	showFilters?: boolean;
}

export default function ChatListSkeleton({
	showFilters = true,
}: ChatListSkeletonProps) {
	return (
		<div {...stylex.props(styles.container)}>
			{showFilters && (
				<>
					<div {...stylex.props(styles.headerRow)} />
					<div {...stylex.props(styles.filterRow)}>
						<div
							{...stylex.props(styles.filterPill, styles.filterPillWide)}
						/>
						<div
							{...stylex.props(styles.filterPill, styles.filterPillMedium)}
						/>
						<div
							{...stylex.props(styles.filterPill, styles.filterPillNarrow)}
						/>
					</div>
				</>
			)}

			<div {...stylex.props(styles.list)}>
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
		</div>
	);
}
