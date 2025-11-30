import * as stylex from "@stylexjs/stylex";
import { Ban, Home } from "lucide-react";
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
	homeButton: {
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
	backLink: {
		marginTop: "16px",
		fontSize: "14px",
		color: colors.textMuted,
		textDecoration: "none",
	},
});

export default function Forbidden() {
	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.iconWrap)}>
				<Ban size={40} {...stylex.props(styles.icon)} />
			</div>
			<h1 {...stylex.props(styles.title)}>접근 권한이 없습니다</h1>
			<p {...stylex.props(styles.description)}>
				이 페이지에 접근할 권한이 없어요.
				<br />
				필요한 권한이 있는지 확인해주세요.
			</p>
			<Link href="/" {...stylex.props(styles.homeButton)}>
				<Home size={18} />
				홈으로 돌아가기
			</Link>
			<Link href="/mypage" {...stylex.props(styles.backLink)}>
				마이페이지로 이동
			</Link>
		</div>
	);
}
