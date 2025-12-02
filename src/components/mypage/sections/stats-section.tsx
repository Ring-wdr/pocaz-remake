import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { colors, fontSize, fontWeight, radius, spacing } from "@/app/global-tokens.stylex";
import { api } from "@/utils/eden";

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
	errorBox: {
		gridColumn: "1 / -1",
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
		textAlign: "center",
	},
	errorTitle: {
		margin: 0,
		marginBottom: spacing.xxxs,
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
	},
	errorDesc: {
		margin: 0,
		fontSize: fontSize.sm,
		color: colors.textMuted,
	},
});

export default async function StatsSection() {
	const { data, error } = await api.users.me.summary.get();

	if (error || !data) {
		return (
			<div {...stylex.props(styles.container)}>
				<div {...stylex.props(styles.errorBox)}>
					<p {...stylex.props(styles.errorTitle)}>통계를 불러오지 못했습니다</p>
					<p {...stylex.props(styles.errorDesc)}>잠시 후 다시 시도해주세요</p>
				</div>
			</div>
		);
	}

	const stats = {
		posts: data.posts ?? 0,
		likes: data.likes ?? 0,
		trades: data.trades ?? 0,
	};

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
