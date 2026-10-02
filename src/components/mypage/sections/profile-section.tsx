import * as stylex from "@stylexjs/stylex";
import { ChevronRight, User } from "lucide-react";
import Link from "next/link";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	size,
	spacing,
} from "@/app/global-tokens.stylex";
import { mypageStyles } from "../mypage-styles.stylex";

const styles = stylex.create({
	container: {
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		textDecoration: "none",
		color: "inherit",
	},
	avatar: {
		width: size.avatarLg,
		height: size.avatarLg,
		borderRadius: radius.full,
		objectFit: "cover",
		flexShrink: 0,
		backgroundColor: colors.bgTertiary,
	},
	avatarPlaceholder: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: colors.textMuted,
	},
	info: {
		flex: 1,
		minWidth: 0,
	},
	name: {
		margin: 0,
		marginBottom: spacing.xxxs,
		fontSize: fontSize.lg,
		fontWeight: fontWeight.bold,
		color: colors.textSecondary,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	email: {
		margin: 0,
		fontSize: fontSize.md,
		color: colors.textMuted,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	edit: {
		display: "flex",
		alignItems: "center",
		flexShrink: 0,
		fontSize: fontSize.sm,
		fontWeight: fontWeight.medium,
		color: colors.textMuted,
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
		<Link
			href="/mypage/edit"
			{...stylex.props(styles.container, mypageStyles.interactive)}
		>
			{profile.profileImage ? (
				<img
					src={profile.profileImage}
					alt=""
					{...stylex.props(styles.avatar)}
				/>
			) : (
				<div {...stylex.props(styles.avatar, styles.avatarPlaceholder)}>
					<User size={28} aria-hidden />
				</div>
			)}
			<div {...stylex.props(styles.info)}>
				<h2 {...stylex.props(styles.name)}>{profile.nickname}</h2>
				{profile.email && (
					<p {...stylex.props(styles.email)}>{profile.email}</p>
				)}
			</div>
			<span {...stylex.props(styles.edit)}>
				프로필 수정
				<ChevronRight size={16} aria-hidden />
			</span>
		</Link>
	);
}
