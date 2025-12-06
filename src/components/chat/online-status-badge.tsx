import * as stylex from "@stylexjs/stylex";
import { colors, fontSize, radius, spacing } from "@/app/global-tokens.stylex";

const styles = stylex.create({
	badge: {
		display: "inline-flex",
		alignItems: "center",
		gap: spacing.xxxs,
		paddingTop: spacing.xxxs,
		paddingBottom: spacing.xxxs,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		fontSize: fontSize.sm,
		borderRadius: radius.sm,
	},
	online: {
		color: colors.statusSuccess,
		backgroundColor: colors.statusSuccessBg,
	},
	offline: {
		color: colors.textMuted,
		backgroundColor: colors.bgTertiary,
	},
});

interface OnlineStatusBadgeProps {
	onlineCount: number;
}

export function OnlineStatusBadge({ onlineCount }: OnlineStatusBadgeProps) {
	const isOnline = onlineCount > 0;

	return (
		<span
			{...stylex.props(styles.badge, isOnline ? styles.online : styles.offline)}
		>
			{isOnline ? `온라인 ${onlineCount}` : "오프라인"}
		</span>
	);
}
