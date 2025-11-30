import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { Footer } from "@/components/home";
import { signInWithGoogle } from "@/lib/auth/actions";

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
	logoWrap: {
		marginBottom: "32px",
	},
	logo: {
		fontSize: "48px",
		fontWeight: 900,
		fontStyle: "italic",
		color: "#000",
		letterSpacing: "-2px",
	},
	title: {
		fontSize: "24px",
		fontWeight: 700,
		color: "#111827",
		margin: 0,
		marginBottom: "8px",
		textAlign: "center",
	},
	subtitle: {
		fontSize: "14px",
		color: "#6b7280",
		margin: 0,
		marginBottom: "32px",
		textAlign: "center",
	},
	form: {
		width: "100%",
		maxWidth: "320px",
	},
	googleButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: "12px",
		width: "100%",
		paddingTop: "12px",
		paddingBottom: "12px",
		paddingLeft: "16px",
		paddingRight: "16px",
		fontSize: "14px",
		fontWeight: 500,
		color: "#1f1f1f",
		backgroundColor: "#fff",
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "#dadce0",
		borderRadius: "8px",
		cursor: "pointer",
		transition: "background-color 0.2s ease, box-shadow 0.2s ease",
		":hover": {
			backgroundColor: "#f8fafc",
			boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
		},
	},
	googleIcon: {
		width: "20px",
		height: "20px",
	},
	divider: {
		display: "flex",
		alignItems: "center",
		gap: "16px",
		width: "100%",
		maxWidth: "320px",
		marginTop: "24px",
		marginBottom: "24px",
	},
	dividerLine: {
		flex: 1,
		height: "1px",
		backgroundColor: "#e5e7eb",
	},
	dividerText: {
		fontSize: "12px",
		color: "#9ca3af",
	},
	guestLink: {
		fontSize: "14px",
		color: "#6b7280",
		textDecoration: "none",
	},
	terms: {
		marginTop: "32px",
		fontSize: "12px",
		color: "#9ca3af",
		textAlign: "center",
		lineHeight: 1.6,
	},
	termsLink: {
		color: "#6b7280",
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

				<form action={signInWithGoogle} {...stylex.props(styles.form)}>
					<button type="submit" {...stylex.props(styles.googleButton)}>
						<svg
							{...stylex.props(styles.googleIcon)}
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
							aria-hidden="true"
						>
							<path
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								fill="#4285F4"
							/>
							<path
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								fill="#34A853"
							/>
							<path
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								fill="#FBBC05"
							/>
							<path
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								fill="#EA4335"
							/>
						</svg>
						Google로 계속하기
					</button>
				</form>

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
