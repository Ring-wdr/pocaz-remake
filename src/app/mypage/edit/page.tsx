import * as stylex from "@stylexjs/stylex";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import { Footer } from "@/components/home";
import { createMetadata } from "@/lib/metadata";
import { api } from "@/utils/eden";
import EditProfileForm from "./profile-form";

export const metadata = createMetadata({
	title: "프로필 수정 | POCAZ",
	description: "닉네임과 프로필 이미지를 변경하세요.",
	path: "/mypage/edit",
	ogTitle: "Edit Profile",
});

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: colors.bgPrimary,
	},
	header: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
	},
	backButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "36px",
		height: "36px",
		color: colors.textSecondary,
		backgroundColor: "transparent",
		borderWidth: 0,
		borderRadius: radius.sm,
		cursor: "pointer",
		textDecoration: "none",
	},
	headerTitle: {
		flex: 1,
		fontSize: fontSize.lg,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
		margin: 0,
	},
	content: {
		flex: 1,
		paddingTop: spacing.lg,
		paddingBottom: spacing.md,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
	},
});

export default async function EditProfilePage() {
	const { data: profile, error } = await api.users.me.get();

	if (error || !profile) {
		notFound();
	}

	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<Link href="/mypage" {...stylex.props(styles.backButton)}>
					<ArrowLeft size={20} />
				</Link>
				<h1 {...stylex.props(styles.headerTitle)}>프로필 수정</h1>
			</header>

			<div {...stylex.props(styles.content)}>
				<EditProfileForm
					initialEmail={profile.email ?? ""}
					initialNickname={profile.nickname}
					initialAvatar={profile.profileImage}
				/>
			</div>

			<Footer />
		</div>
	);
}
