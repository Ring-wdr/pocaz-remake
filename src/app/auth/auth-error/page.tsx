import * as stylex from "@stylexjs/stylex";
import { AlertTriangle, CheckCircle2, HelpCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/home";
import { createMetadata } from "@/lib/metadata";
import { colors } from "../../global-tokens.stylex";

export const metadata = createMetadata({
	title: "로그인 오류 | POCAZ",
	description: "로그인 도중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
	path: "/auth/auth-error",
	ogTitle: "Auth Error",
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
	iconWrap: {
		width: "80px",
		height: "80px",
		borderRadius: "40px",
		backgroundColor: colors.statusErrorBg,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: "24px",
	},
	icon: {
		fontSize: "40px",
		color: colors.statusError,
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
		color: colors.textInverse,
		backgroundColor: colors.bgInverse,
		borderRadius: "12px",
		textDecoration: "none",
		transition: "background-color 0.2s ease",
	},
	guideList: {
		listStyle: "none",
		padding: 0,
		margin: 0,
		display: "flex",
		flexDirection: "column",
		gap: "10px",
		width: "100%",
		maxWidth: "360px",
		marginBottom: "24px",
	},
	guideItem: {
		display: "flex",
		alignItems: "flex-start",
		gap: "10px",
		color: colors.textSecondary,
		fontSize: "14px",
		lineHeight: 1.6,
	},
	guideIcon: {
		marginTop: "2px",
		color: colors.brandPrimary,
	},
	guideLink: {
		display: "flex",
		alignItems: "center",
		gap: "6px",
		marginTop: "12px",
		fontSize: "14px",
		color: colors.textMuted,
		textDecoration: "none",
	},
	homeLink: {
		marginTop: "16px",
		fontSize: "14px",
		color: colors.textMuted,
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
				<ul {...stylex.props(styles.guideList)}>
					<li {...stylex.props(styles.guideItem)}>
						<CheckCircle2 size={18} {...stylex.props(styles.guideIcon)} />
						<span>브라우저 팝업 차단을 해제한 뒤 창이 열리는지 확인해주세요.</span>
					</li>
					<li {...stylex.props(styles.guideItem)}>
						<CheckCircle2 size={18} {...stylex.props(styles.guideIcon)} />
						<span>회사/학교 계정이면 관리자 정책으로 차단될 수 있어요. 개인 계정이나 다른 브라우저/시크릿 모드에서 다시 시도해보세요.</span>
					</li>
					<li {...stylex.props(styles.guideItem)}>
						<CheckCircle2 size={18} {...stylex.props(styles.guideIcon)} />
						<span>VPN·광고차단 확장을 끄거나 네트워크를 변경한 후 다시 시도해주세요.</span>
					</li>
				</ul>
				<Link href="/login" {...stylex.props(styles.retryButton)}>
					<RefreshCw size={18} />
					다시 시도하기
				</Link>
				<Link href="/support/inquiry" {...stylex.props(styles.guideLink)}>
					<HelpCircle size={16} />
					문의하기 (다른 로그인 방법 요청)
				</Link>
				<Link href="/" {...stylex.props(styles.homeLink)}>
					홈으로 돌아가기
				</Link>
			</div>
			<Footer />
		</div>
	);
}
