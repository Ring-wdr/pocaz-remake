import * as stylex from "@stylexjs/stylex";
import type { MarketSummary } from "@/types/entities";

import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";

const styles = stylex.create({
	marketInfo: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		marginBottom: spacing.sm,
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.sm,
	},
	marketImage: {
		width: "48px",
		height: "48px",
		borderRadius: radius.xs,
		objectFit: "cover",
		backgroundColor: colors.bgTertiary,
	},
	marketDetails: {
		flex: 1,
		minWidth: 0,
	},
	marketTitle: {
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
		margin: 0,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	marketPrice: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
		margin: 0,
	},
});

interface MarketInfoSectionProps {
	marketInfo: MarketSummary;
}

export function MarketInfoSection({ marketInfo }: MarketInfoSectionProps) {
	return (
		<div {...stylex.props(styles.marketInfo)}>
			{marketInfo.thumbnail && (
				<img
					src={marketInfo.thumbnail}
					alt={marketInfo.title}
					{...stylex.props(styles.marketImage)}
				/>
			)}
			<div {...stylex.props(styles.marketDetails)}>
				<p {...stylex.props(styles.marketTitle)}>{marketInfo.title}</p>
				<p {...stylex.props(styles.marketPrice)}>
					{marketInfo.price
						? `${marketInfo.price.toLocaleString()}원`
						: "가격협의"}
				</p>
			</div>
		</div>
	);
}
