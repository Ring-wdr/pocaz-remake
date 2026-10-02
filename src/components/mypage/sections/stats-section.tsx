import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import {
	colors,
	fontSize,
	fontWeight,
	spacing,
} from "@/app/global-tokens.stylex";
import { mypageStyles } from "../mypage-styles.stylex";

const styles = stylex.create({
	container: {
		display: "grid",
		gridTemplateColumns: "repeat(3, 1fr)",
		borderTopWidth: 1,
		borderTopStyle: "solid",
		borderTopColor: colors.borderPrimary,
	},
	item: {
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		textAlign: "center",
		textDecoration: "none",
		color: "inherit",
	},
	divider: {
		borderLeftWidth: 1,
		borderLeftStyle: "solid",
		borderLeftColor: colors.borderPrimary,
	},
	number: {
		margin: 0,
		marginBottom: spacing.xxxs,
		fontSize: fontSize.xl,
		fontWeight: fontWeight.bold,
		color: colors.textSecondary,
	},
	label: {
		margin: 0,
		fontSize: fontSize.sm,
		color: colors.textMuted,
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
	const items = [
		{ href: "/mypage/posts", value: stats.posts, label: "게시글" },
		{ href: "/mypage/likes", value: stats.likes, label: "좋아요" },
		{ href: "/mypage/trades", value: stats.trades, label: "거래" },
	] as const;

	return (
		<div {...stylex.props(styles.container)}>
			{items.map((item, index) => (
				<Link
					key={item.href}
					href={item.href}
					{...stylex.props(
						styles.item,
						index > 0 && styles.divider,
						mypageStyles.interactive,
					)}
				>
					<p {...stylex.props(styles.number)}>{item.value}</p>
					<p {...stylex.props(styles.label)}>{item.label}</p>
				</Link>
			))}
		</div>
	);
}
