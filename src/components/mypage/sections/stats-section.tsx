import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { colors, fontSize, fontWeight, radius, spacing } from "@/app/global-tokens.stylex";

const styles = stylex.create({
	container: {
		display: "grid",
		gridTemplateColumns: "repeat(3, 1fr)",
		gap: spacing.xs,
		marginBottom: spacing.md,
	},
	item: {
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
		textAlign: "center",
		textDecoration: "none",
		color: "inherit",
		transition: "background-color 0.2s ease",
	},
	number: {
		fontSize: fontSize.xl,
		fontWeight: fontWeight.bold,
		color: colors.textSecondary,
		margin: 0,
		marginBottom: spacing.xxxs,
	},
	label: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
		margin: 0,
	},
});

interface StatsSectionProps {
	stats: {
		posts: number;
		likes: number;
		trades: number;
	};
}

export function StatsSection({ stats }: StatsSectionProps) {
	return (
		<div {...stylex.props(styles.container)}>
			<Link href="/mypage/posts" {...stylex.props(styles.item)}>
				<p {...stylex.props(styles.number)}>{stats.posts}</p>
				<p {...stylex.props(styles.label)}>게시글</p>
			</Link>
			<Link href="/mypage/likes" {...stylex.props(styles.item)}>
				<p {...stylex.props(styles.number)}>{stats.likes}</p>
				<p {...stylex.props(styles.label)}>좋아요</p>
			</Link>
			<Link href="/mypage/trades" {...stylex.props(styles.item)}>
				<p {...stylex.props(styles.number)}>{stats.trades}</p>
				<p {...stylex.props(styles.label)}>거래</p>
			</Link>
		</div>
	);
}
