import * as stylex from "@stylexjs/stylex";
import Link from "next/link";

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#fff",
		paddingTop: "40px",
		paddingBottom: "40px",
		paddingLeft: "20px",
		paddingRight: "20px",
	},
	iconWrap: {
		width: "80px",
		height: "80px",
		borderRadius: "40px",
		backgroundColor: "#fef3c7",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: "24px",
	},
	icon: {
		fontSize: "40px",
		color: "#d97706",
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
	loginButton: {
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

export default function Unauthorized() {
	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.iconWrap)}>
				<i className="ri-lock-line" {...stylex.props(styles.icon)} />
			</div>
			<h1 {...stylex.props(styles.title)}>로그인이 필요합니다</h1>
			<p {...stylex.props(styles.description)}>
				이 페이지를 보려면 로그인이 필요해요.
				<br />
				로그인하고 포카즈의 모든 기능을 이용해보세요!
			</p>
			<Link href="/login" {...stylex.props(styles.loginButton)}>
				<i className="ri-login-box-line" />
				로그인하기
			</Link>
			<Link href="/" {...stylex.props(styles.homeLink)}>
				홈으로 돌아가기
			</Link>
		</div>
	);
}
