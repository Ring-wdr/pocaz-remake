/**
 * Forbidden page renders on the client to surface feedback and retry options.
 */
"use client";

import * as stylex from "@stylexjs/stylex";
import { Ban, Copy, Home, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
	supportGroup: {
		marginTop: "20px",
		display: "flex",
		gap: "10px",
		flexWrap: "wrap",
		justifyContent: "center",
	},
	secondaryButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: "6px",
		paddingTop: "12px",
		paddingBottom: "12px",
		paddingLeft: "18px",
		paddingRight: "18px",
		fontSize: "14px",
		fontWeight: 600,
		color: colors.textSecondary,
		backgroundColor: colors.bgSecondary,
		borderRadius: "10px",
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		textDecoration: "none",
		cursor: "pointer",
	},
});

export default function Forbidden() {
	const [copied, setCopied] = useState(false);

	const copyDiagnostics = async () => {
		const payload = [
			"context: forbidden",
			`url: ${typeof window !== "undefined" ? window.location.href : "n/a"}`,
			`time: ${new Date().toISOString()}`,
		].join("\n");

		try {
			await navigator.clipboard.writeText(payload);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy diagnostics", err);
		}
	};

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
			<div {...stylex.props(styles.supportGroup)}>
				<button
					type="button"
					onClick={copyDiagnostics}
					{...stylex.props(styles.secondaryButton)}
				>
					<Copy size={16} />
					{copied ? "복사 완료" : "상세 정보 복사"}
				</button>
				<Link href="/support/inquiry" {...stylex.props(styles.secondaryButton)}>
					<MessageCircle size={16} />
					지원 문의
				</Link>
			</div>
		</div>
	);
}
