import * as stylex from "@stylexjs/stylex";
import { Lock, LogIn } from "lucide-react";
import Link from "next/link";
import { colors } from "./global-tokens.stylex";

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.bgPrimary,
		paddingTop: "40px",
		paddingBottom: "40px",
		paddingLeft: "20px",
		paddingRight: "20px",
	},
	iconWrap: {
		width: "80px",
		height: "80px",
		borderRadius: "40px",
		backgroundColor: colors.statusWarningBg,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: "24px",
	},
	icon: {
		fontSize: "40px",
		color: colors.statusWarning,
	},
	title: {
		fontSize: "24px",
		fontWeight: 700,
		color: colors.textSecondary,
		margin: 0,
		marginBottom: "12px",
		textAlign: "center",
	},
	description: {
		fontSize: "14px",
		color: colors.textMuted,
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
		color: colors.textInverse,
		backgroundColor: colors.bgInverse,
		borderRadius: "12px",
		textDecoration: "none",
		transition: "background-color 0.2s ease",
	},
	homeLink: {
		marginTop: "16px",
		fontSize: "14px",
		color: colors.textMuted,
		textDecoration: "none",
	},
});

export default function Unauthorized() {
	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.iconWrap)}>
				<Lock size={40} {...stylex.props(styles.icon)} />
			</div>
			<h1 {...stylex.props(styles.title)}>로그인이 필요합니다</h1>
			<p {...stylex.props(styles.description)}>
				이 페이지를 보려면 로그인이 필요해요.
				<br />
				로그인하고 포카즈의 모든 기능을 이용해보세요!
			</p>
			<Link href="/login" {...stylex.props(styles.loginButton)}>
				<LogIn size={18} />
				로그인하기
			</Link>
			<Link href="/" {...stylex.props(styles.homeLink)}>
				홈으로 돌아가기
			</Link>
		</div>
	);
}
