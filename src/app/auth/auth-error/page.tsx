import * as stylex from "@stylexjs/stylex";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/home";

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: "#fff",
	},
	content: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		paddingTop: "40px",
		paddingBottom: "40px",
		paddingLeft: "20px",
		paddingRight: "20px",
	},
	iconWrap: {
		width: "80px",
		height: "80px",
		borderRadius: "40px",
		backgroundColor: "#fee2e2",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: "24px",
	},
	icon: {
		fontSize: "40px",
		color: "#dc2626",
	},
	title: {
		fontSize: "24px",
		fontWeight: 700,
		color: "#111827",
		margin: 0,
		marginBottom: "12px",
		textAlign: "center",
	},
	description: {
		fontSize: "14px",
		color: "#6b7280",
		margin: 0,
		marginBottom: "32px",
		textAlign: "center",
		lineHeight: 1.6,
	},
	retryButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: "8px",
		width: "100%",
		maxWidth: "320px",
		paddingTop: "14px",
		paddingBottom: "14px",
		paddingLeft: "24px",
		paddingRight: "24px",
		fontSize: "15px",
		fontWeight: 600,
		color: "#fff",
		backgroundColor: "#000",
		borderRadius: "12px",
		textDecoration: "none",
		transition: "background-color 0.2s ease",
	},
	homeLink: {
		marginTop: "16px",
		fontSize: "14px",
		color: "#6b7280",
		textDecoration: "none",
	},
});

export default function AuthErrorPage() {
	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.content)}>
				<div {...stylex.props(styles.iconWrap)}>
					<AlertTriangle size={40} {...stylex.props(styles.icon)} />
				</div>
				<h1 {...stylex.props(styles.title)}>로그인 오류</h1>
				<p {...stylex.props(styles.description)}>
					로그인 중 문제가 발생했어요.
					<br />
					잠시 후 다시 시도해주세요.
				</p>
				<Link href="/login" {...stylex.props(styles.retryButton)}>
					<RefreshCw size={18} />
					다시 시도하기
				</Link>
				<Link href="/" {...stylex.props(styles.homeLink)}>
					홈으로 돌아가기
				</Link>
			</div>
			<Footer />
		</div>
	);
}
