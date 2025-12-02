import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { Footer } from "@/components/home";
import { createMetadata } from "@/lib/metadata";
import { colors } from "../global-tokens.stylex";
import LoginForm from "./login-form";

export const metadata = createMetadata({
	title: "로그인 | POCAZ",
	description: "Google 계정으로 포카즈 마켓과 커뮤니티를 이용해 보세요.",
	path: "/login",
	ogTitle: "Login",
});

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: colors.bgPrimary,
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
	logoWrap: {
		marginBottom: "32px",
	},
	logo: {
		fontSize: "48px",
		fontWeight: 900,
		fontStyle: "italic",
		color: colors.textPrimary,
		letterSpacing: "-2px",
	},
	title: {
		fontSize: "24px",
		fontWeight: 700,
		color: colors.textSecondary,
		margin: 0,
		marginBottom: "8px",
		textAlign: "center",
	},
	subtitle: {
		fontSize: "14px",
		color: colors.textMuted,
		margin: 0,
		marginBottom: "32px",
		textAlign: "center",
	},
	divider: {
		display: "flex",
		alignItems: "center",
		gap: "16px",
		width: "100%",
		maxWidth: "360px",
		marginTop: "24px",
		marginBottom: "24px",
	},
	dividerLine: {
		flex: 1,
		height: "1px",
		backgroundColor: colors.borderPrimary,
	},
	dividerText: {
		fontSize: "12px",
		color: colors.textPlaceholder,
	},
	guestLink: {
		fontSize: "14px",
		color: colors.textMuted,
		textDecoration: "none",
	},
	terms: {
		marginTop: "32px",
		fontSize: "12px",
		color: colors.textPlaceholder,
		textAlign: "center",
		lineHeight: 1.6,
	},
	termsLink: {
		color: colors.textMuted,
		textDecoration: "underline",
	},
});

export default function LoginPage() {
	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.content)}>
				<div {...stylex.props(styles.logoWrap)}>
					<span {...stylex.props(styles.logo)}>POCAZ.</span>
				</div>
				<h1 {...stylex.props(styles.title)}>로그인</h1>
				<p {...stylex.props(styles.subtitle)}>포카즈에 오신 것을 환영합니다</p>

				<LoginForm />

				<div {...stylex.props(styles.divider)}>
					<div {...stylex.props(styles.dividerLine)} />
					<span {...stylex.props(styles.dividerText)}>또는</span>
					<div {...stylex.props(styles.dividerLine)} />
				</div>

				<Link href="/" {...stylex.props(styles.guestLink)}>
					둘러보기
				</Link>

				<p {...stylex.props(styles.terms)}>
					로그인 시{" "}
					<Link href="/support/terms" {...stylex.props(styles.termsLink)}>
						이용약관
					</Link>{" "}
					및{" "}
					<Link href="/support/privacy" {...stylex.props(styles.termsLink)}>
						개인정보처리방침
					</Link>
					에 동의하게 됩니다.
				</p>
			</div>
			<Footer />
		</div>
	);
}
