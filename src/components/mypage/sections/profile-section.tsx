import * as stylex from "@stylexjs/stylex";
import { User } from "lucide-react";
import Link from "next/link";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";

const styles = stylex.create({
	container: {
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
		paddingBottom: spacing.sm,
		marginBottom: spacing.sm,
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
		fontWeight: fontWeight.bold,
		color: colors.textSecondary,
		margin: 0,
		marginBottom: spacing.xxxs,
	},
	email: {
		fontSize: fontSize.md,
		color: colors.textMuted,
		margin: 0,
	},
	editButton: {
		paddingTop: spacing.xxs,
		paddingBottom: spacing.xxs,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		fontSize: "13px",
		fontWeight: fontWeight.medium,
		color: colors.textTertiary,
		backgroundColor: colors.bgTertiary,
		borderRadius: radius.sm,
		textDecoration: "none",
		transition: "background-color 0.2s ease",
	},
});

interface ProfileSectionProps {
	profile: {
		nickname: string;
		email?: string | null;
		profileImage?: string | null;
	};
}

export function ProfileSection({ profile }: ProfileSectionProps) {
	return (
		<div {...stylex.props(styles.container)}>
			{profile.profileImage ? (
				<img
					src={profile.profileImage}
					alt={profile.nickname}
					{...stylex.props(styles.avatar)}
				/>
			) : (
				<div {...stylex.props(styles.avatarPlaceholder)}>
					<User size={32} />
				</div>
			)}
			<div {...stylex.props(styles.info)}>
				<h2 {...stylex.props(styles.name)}>{profile.nickname}</h2>
				{profile.email && (
					<p {...stylex.props(styles.email)}>{profile.email}</p>
				)}
			</div>
			<Link href="/mypage/edit" {...stylex.props(styles.editButton)}>
				프로필 수정
			</Link>
		</div>
	);
}
