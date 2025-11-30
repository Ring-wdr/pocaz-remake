import * as stylex from "@stylexjs/stylex";
import { Home } from "lucide-react";
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
	errorCode: {
		fontSize: "120px",
		fontWeight: 900,
		fontStyle: "italic",
		color: colors.borderPrimary,
		margin: 0,
		lineHeight: 1,
		letterSpacing: "-4px",
	},
	title: {
		fontSize: "24px",
		fontWeight: 700,
		color: colors.textSecondary,
		margin: 0,
		marginTop: "16px",
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
	buttonGroup: {
		display: "flex",
		gap: "12px",
	},
	homeButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: "8px",
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
	backButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: "8px",
		paddingTop: "14px",
		paddingBottom: "14px",
		paddingLeft: "24px",
		paddingRight: "24px",
		fontSize: "15px",
		fontWeight: 600,
		color: colors.textTertiary,
		backgroundColor: colors.bgTertiary,
		borderRadius: "12px",
		textDecoration: "none",
		transition: "background-color 0.2s ease",
	},
});

export default function NotFound() {
	return (
		<div {...stylex.props(styles.container)}>
			<p {...stylex.props(styles.errorCode)}>404</p>
			<h1 {...stylex.props(styles.title)}>페이지를 찾을 수 없습니다</h1>
			<p {...stylex.props(styles.description)}>
				요청하신 페이지가 존재하지 않거나
				<br />
				이동되었을 수 있어요.
			</p>
			<div {...stylex.props(styles.buttonGroup)}>
				<Link href="/" {...stylex.props(styles.homeButton)}>
					<Home size={18} />
					홈으로
				</Link>
			</div>
		</div>
	);
}
