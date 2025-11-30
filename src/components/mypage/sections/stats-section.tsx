import * as stylex from "@stylexjs/stylex";
import Link from "next/link";

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
		backgroundColor: "#f9fafb",
		borderRadius: "12px",
		textAlign: "center",
		textDecoration: "none",
		color: "inherit",
		transition: "background-color 0.2s ease",
	},
	number: {
		fontSize: "24px",
		fontWeight: 700,
		color: "#111827",
		margin: 0,
		marginBottom: "4px",
	},
	label: {
		fontSize: "12px",
		color: "#6b7280",
		margin: 0,
	},
});

interface UserStats {
	posts: number;
	likes: number;
	trades: number;
}

// TODO: Replace with actual API call
async function getUserStats(): Promise<UserStats> {
	// Simulate delay
	await new Promise((resolve) => setTimeout(resolve, 200));

	// Placeholder data
	return {
		posts: 24,
		likes: 156,
		trades: 8,
	};
}

export default async function StatsSection() {
	const stats = await getUserStats();

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
