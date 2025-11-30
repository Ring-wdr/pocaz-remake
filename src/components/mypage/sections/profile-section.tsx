import * as stylex from "@stylexjs/stylex";
import { User } from "lucide-react";
import Link from "next/link";
import { colors } from "@/app/global-tokens.stylex";

const styles = stylex.create({
	container: {
		display: "flex",
		alignItems: "center",
		gap: "16px",
		paddingBottom: "20px",
		marginBottom: "20px",
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
	},
	avatar: {
		width: "72px",
		height: "72px",
		borderRadius: "36px",
		objectFit: "cover",
		backgroundColor: colors.bgTertiary,
	},
	avatarPlaceholder: {
		width: "72px",
		height: "72px",
		borderRadius: "36px",
		backgroundColor: colors.bgTertiary,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: colors.textPlaceholder,
	},
	info: {
		flex: 1,
	},
	name: {
		fontSize: "20px",
		fontWeight: 700,
		color: colors.textSecondary,
		margin: 0,
		marginBottom: "4px",
	},
	email: {
		fontSize: "14px",
		color: colors.textMuted,
		margin: 0,
	},
	editButton: {
		paddingTop: "8px",
		paddingBottom: "8px",
		paddingLeft: "14px",
		paddingRight: "14px",
		fontSize: "13px",
		fontWeight: 500,
		color: colors.textTertiary,
		backgroundColor: colors.bgTertiary,
		borderRadius: "8px",
		textDecoration: "none",
		transition: "background-color 0.2s ease",
	},
	loginPrompt: {
		textAlign: "center",
		paddingTop: "20px",
		paddingBottom: "20px",
	},
	loginText: {
		fontSize: "14px",
		color: colors.textMuted,
		marginBottom: "12px",
	},
	loginButton: {
		display: "inline-block",
		paddingTop: "10px",
		paddingBottom: "10px",
		paddingLeft: "24px",
		paddingRight: "24px",
		fontSize: "14px",
		fontWeight: 600,
		color: colors.textInverse,
		backgroundColor: colors.bgInverse,
		borderRadius: "8px",
		textDecoration: "none",
	},
});

interface UserProfile {
	id: string;
	name: string;
	email: string;
	avatar?: string;
}

// TODO: Replace with actual API call
async function getUserProfile(): Promise<UserProfile | null> {
	// Simulate delay
	await new Promise((resolve) => setTimeout(resolve, 300));

	// Placeholder data - 로그인 상태 시뮬레이션
	return {
		id: "1",
		name: "포카덕후",
		email: "pocaz@example.com",
		avatar: "https://placehold.co/144x144/dbeafe/2563eb?text=P",
	};

	// 비로그인 상태 시뮬레이션
	// return null;
}

export default async function ProfileSection() {
	const profile = await getUserProfile();

	if (!profile) {
		return (
			<div {...stylex.props(styles.loginPrompt)}>
				<p {...stylex.props(styles.loginText)}>
					로그인하고 포카즈의 모든 기능을 이용해보세요
				</p>
				<Link href="/login" {...stylex.props(styles.loginButton)}>
					로그인
				</Link>
			</div>
		);
	}

	return (
		<div {...stylex.props(styles.container)}>
			{profile.avatar ? (
				<img
					src={profile.avatar}
					alt={profile.name}
					{...stylex.props(styles.avatar)}
				/>
			) : (
				<div {...stylex.props(styles.avatarPlaceholder)}>
					<User size={32} />
				</div>
			)}
			<div {...stylex.props(styles.info)}>
				<h2 {...stylex.props(styles.name)}>{profile.name}</h2>
				<p {...stylex.props(styles.email)}>{profile.email}</p>
			</div>
			<Link href="/mypage/edit" {...stylex.props(styles.editButton)}>
				프로필 수정
			</Link>
		</div>
	);
}
