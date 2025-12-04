"use client";

import * as stylex from "@stylexjs/stylex";
import { Bug, Copy, Home, Mail, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
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
	buttonGroup: {
		display: "flex",
		gap: "12px",
	},
	retryButton: {
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
		borderWidth: 0,
		cursor: "pointer",
		transition: "background-color 0.2s ease",
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
		color: colors.textTertiary,
		backgroundColor: colors.bgTertiary,
		borderRadius: "12px",
		textDecoration: "none",
		transition: "background-color 0.2s ease",
	},
	supportGroup: {
		marginTop: "16px",
		display: "flex",
		gap: "8px",
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
	},
});

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		console.error("Error:", error);
	}, [error]);

	const copyDiagnostics = async () => {
		const payload = [
			`message: ${error.message}`,
			`digest: ${error.digest ?? "n/a"}`,
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
				<Bug size={40} {...stylex.props(styles.icon)} />
			</div>
			<h1 {...stylex.props(styles.title)}>문제가 발생했습니다</h1>
			<p {...stylex.props(styles.description)}>
				일시적인 오류가 발생했어요.
				<br />
				잠시 후 다시 시도해주세요.
			</p>
			<div {...stylex.props(styles.buttonGroup)}>
				<button
					type="button"
					onClick={reset}
					{...stylex.props(styles.retryButton)}
				>
					<RefreshCw size={18} />
					다시 시도
				</button>
				<a href="/" {...stylex.props(styles.homeButton)}>
					<Home size={18} />
					홈으로
				</a>
			</div>
			<div {...stylex.props(styles.supportGroup)}>
				<button
					type="button"
					onClick={copyDiagnostics}
					{...stylex.props(styles.secondaryButton)}
				>
					<Copy size={16} />
					{copied ? "복사 완료" : "오류 정보 복사"}
				</button>
				<a href="/support/inquiry" {...stylex.props(styles.secondaryButton)}>
					<Mail size={16} />
					지원 문의하기
				</a>
			</div>
		</div>
	);
}
