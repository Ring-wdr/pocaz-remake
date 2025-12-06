"use client";

import * as stylex from "@stylexjs/stylex";
import {
	AlertCircle,
	ArrowRight,
	HelpCircle,
	Loader2,
	Shield,
} from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { type SignInState, signInWithGoogle } from "@/lib/auth/actions";
import { Button } from "@/components/ui";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "../global-tokens.stylex";

const spin = stylex.keyframes({
	from: { transform: "rotate(0deg)" },
	to: { transform: "rotate(360deg)" },
});

const styles = stylex.create({
	form: {
		width: "100%",
		maxWidth: "360px",
		display: "flex",
		flexDirection: "column",
		gap: spacing.xs,
	},
	googleIcon: {
		width: "20px",
		height: "20px",
	},
	loader: {
		animationName: spin,
		animationDuration: "0.9s",
		animationTimingFunction: "linear",
		animationIterationCount: "infinite",
	},
	error: {
		display: "flex",
		alignItems: "flex-start",
		gap: spacing.xs,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderRadius: radius.md,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.statusError,
		backgroundColor: colors.statusErrorBg,
		color: colors.statusError,
		fontSize: fontSize.sm,
	},
	helperCard: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xxs,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderRadius: radius.md,
		backgroundColor: colors.bgSecondary,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
	},
	helperTitle: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxxs,
		margin: 0,
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
	},
	helperText: {
		margin: 0,
		color: colors.textMuted,
		fontSize: fontSize.sm,
		lineHeight: 1.6,
	},
	helperLinks: {
		display: "flex",
		gap: spacing.xs,
		flexWrap: "wrap",
	},
	helperLink: {
		display: "inline-flex",
		alignItems: "center",
		gap: spacing.xxxs,
		fontSize: fontSize.sm,
		color: colors.textSecondary,
		textDecoration: "none",
		paddingTop: spacing.xxxs,
		paddingBottom: spacing.xxxs,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		backgroundColor: colors.bgPrimary,
		borderRadius: radius.sm,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderSecondary,
	},
});

const initialState: SignInState = { error: undefined };

export default function LoginForm() {
	const [state, formAction, pending] = useActionState(
		signInWithGoogle,
		initialState,
	);

	return (
		<div {...stylex.props(styles.form)}>
			<form action={formAction}>
				<Button
					type="submit"
					variant="secondary"
					size="md"
					fullWidth
					disabled={pending}
					aria-busy={pending}
				>
					{pending ? (
						<Loader2 size={18} {...stylex.props(styles.loader)} />
					) : (
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
					)}
					{pending ? "로그인 요청 중..." : "Google로 계속하기"}
					{!pending && <ArrowRight size={18} />}
				</Button>
			</form>

			{state?.error && (
				<div role="alert" {...stylex.props(styles.error)}>
					<AlertCircle size={18} />
					<span>{state.error}</span>
				</div>
			)}

			<div {...stylex.props(styles.helperCard)}>
				<p {...stylex.props(styles.helperTitle)}>
					<Shield size={16} />
					브라우저 팁
				</p>
				<p {...stylex.props(styles.helperText)}>
					팝업 차단을 해제하고, 회사/학교 계정으로 로그인할 경우 관리자 정책을
					확인해주세요.
				</p>
				<div {...stylex.props(styles.helperLinks)}>
					<Link href="/support/inquiry" {...stylex.props(styles.helperLink)}>
						<HelpCircle size={14} />
						다른 로그인 방식 요청하기
					</Link>
					<Link href="/auth/auth-error" {...stylex.props(styles.helperLink)}>
						<AlertCircle size={14} />
						로그인 문제 해결 가이드
					</Link>
				</div>
			</div>
		</div>
	);
}
