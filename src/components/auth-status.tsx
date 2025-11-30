import * as stylex from "@stylexjs/stylex";
import Link from "next/link";

import { globalTokens as $, spacing, text } from "@/app/global-tokens.stylex";
import { getUser, signOut } from "@/lib/auth/actions";

const DARK = "@media (prefers-color-scheme: dark)";

export async function AuthStatus() {
	const user = await getUser();

	if (!user) {
		return (
			<div {...stylex.props(styles.container)}>
				<Link href="/login" {...stylex.props(styles.loginButton)}>
					로그인
				</Link>
			</div>
		);
	}

	return (
		<div {...stylex.props(styles.container)}>
			<span {...stylex.props(styles.userName)}>
				{user.email ?? user.user_metadata?.name ?? "사용자"}
			</span>
			{user.user_metadata?.avatar_url && (
				<img
					src={user.user_metadata.avatar_url}
					alt="Profile"
					{...stylex.props(styles.avatar)}
				/>
			)}
			<form action={signOut}>
				<button type="submit" {...stylex.props(styles.logoutButton)}>
					로그아웃
				</button>
			</form>
		</div>
	);
}

const styles = stylex.create({
	container: {
		display: "flex",
		gap: spacing.md,
		alignItems: "center",
	},
	userName: {
		fontSize: text.sm,
		fontFamily: $.fontSans,
		color: {
			default: "#374151",
			[DARK]: "#d1d5db",
		},
	},
	avatar: {
		width: "32px",
		height: "32px",
		borderRadius: "50%",
		objectFit: "cover",
	},
	loginButton: {
		paddingBlock: spacing.xs,
		paddingInline: spacing.md,
		fontSize: text.sm,
		fontFamily: $.fontSans,
		fontWeight: 500,
		backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
		color: "#ffffff",
		borderRadius: "8px",
		textDecoration: "none",
		transition: "all 0.2s ease",
		boxShadow: {
			default: "0 2px 8px rgba(102, 126, 234, 0.3)",
			":hover": "0 4px 12px rgba(102, 126, 234, 0.5)",
		},
		transform: {
			default: "translateY(0)",
			":hover": "translateY(-1px)",
		},
	},
	logoutButton: {
		paddingBlock: spacing.xs,
		paddingInline: spacing.md,
		fontSize: text.sm,
		fontFamily: $.fontSans,
		fontWeight: 500,
		backgroundColor: {
			default: "#6b7280",
			":hover": "#4b5563",
		},
		color: "#ffffff",
		borderWidth: 0,
		borderStyle: "none",
		borderRadius: "8px",
		cursor: "pointer",
		transition: "all 0.2s ease",
		transform: {
			default: "translateY(0)",
			":hover": "translateY(-1px)",
		},
	},
});
