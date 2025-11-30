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
		color: "#fff",
		backgroundColor: "#000",
		borderRadius: "12px",
		textDecoration: "none",
		transition: "background-color 0.2s ease",
	},
	backLink: {
		marginTop: "16px",
		fontSize: "14px",
		color: "#6b7280",
		textDecoration: "none",
	},
});

export default function Forbidden() {
	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.iconWrap)}>
				<i className="ri-forbid-line" {...stylex.props(styles.icon)} />
			</div>
			<h1 {...stylex.props(styles.title)}>접근 권한이 없습니다</h1>
			<p {...stylex.props(styles.description)}>
				이 페이지에 접근할 권한이 없어요.
				<br />
				필요한 권한이 있는지 확인해주세요.
			</p>
			<Link href="/" {...stylex.props(styles.homeButton)}>
				<i className="ri-home-line" />
				홈으로 돌아가기
			</Link>
			<Link href="/mypage" {...stylex.props(styles.backLink)}>
				마이페이지로 이동
			</Link>
		</div>
	);
}
