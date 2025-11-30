"use client";

import * as stylex from "@stylexjs/stylex";
import { ArrowLeft, Camera, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { colors, fontSize, fontWeight, radius, spacing } from "@/app/global-tokens.stylex";
import { Footer } from "@/components/home";

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
	saveButton: {
		paddingTop: spacing.xxs,
		paddingBottom: spacing.xxs,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.accentPrimary,
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
	},
	saveButtonDisabled: {
		color: colors.textPlaceholder,
		cursor: "not-allowed",
	},
	content: {
		flex: 1,
		paddingTop: spacing.lg,
		paddingBottom: spacing.md,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
	},
	avatarSection: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		marginBottom: spacing.lg,
	},
	avatarWrap: {
		position: "relative",
		marginBottom: spacing.xs,
	},
	avatar: {
		width: "100px",
		height: "100px",
		borderRadius: "50px",
		objectFit: "cover",
		backgroundColor: colors.bgTertiary,
	},
	avatarPlaceholder: {
		width: "100px",
		height: "100px",
		borderRadius: "50px",
		backgroundColor: colors.bgTertiary,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: colors.textPlaceholder,
	},
	cameraButton: {
		position: "absolute",
		bottom: 0,
		right: 0,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "32px",
		height: "32px",
		backgroundColor: colors.bgInverse,
		borderWidth: 0,
		borderRadius: "16px",
		color: colors.textInverse,
		cursor: "pointer",
	},
	avatarHint: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
		margin: 0,
	},
	form: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.md,
	},
	formGroup: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xxs,
	},
	label: {
		fontSize: fontSize.sm,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
	},
	input: {
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		fontSize: fontSize.md,
		color: colors.textSecondary,
		backgroundColor: colors.bgSecondary,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		borderRadius: radius.md,
		outline: "none",
	},
	inputDisabled: {
		color: colors.textMuted,
		cursor: "not-allowed",
	},
	inputHint: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
		margin: 0,
	},
	textarea: {
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		fontSize: fontSize.md,
		color: colors.textSecondary,
		backgroundColor: colors.bgSecondary,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		borderRadius: radius.md,
		outline: "none",
		resize: "vertical",
		minHeight: "80px",
		fontFamily: "inherit",
	},
	charCount: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
		textAlign: "right",
	},
});

export default function EditProfilePage() {
	const [nickname, setNickname] = useState("사용자");
	const [bio, setBio] = useState("");
	const [isChanged, setIsChanged] = useState(false);

	const handleNicknameChange = (value: string) => {
		setNickname(value);
		setIsChanged(true);
	};

	const handleBioChange = (value: string) => {
		setBio(value);
		setIsChanged(true);
	};

	const handleSave = () => {
		if (!isChanged) return;
		// TODO: Implement profile update
		console.log({ nickname, bio });
		alert("프로필이 수정되었습니다.");
	};

	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<Link href="/mypage" {...stylex.props(styles.backButton)}>
					<ArrowLeft size={20} />
				</Link>
				<h1 {...stylex.props(styles.headerTitle)}>프로필 수정</h1>
				<button
					type="button"
					onClick={handleSave}
					disabled={!isChanged}
					{...stylex.props(
						styles.saveButton,
						!isChanged && styles.saveButtonDisabled,
					)}
				>
					저장
				</button>
			</header>

			<div {...stylex.props(styles.content)}>
				<div {...stylex.props(styles.avatarSection)}>
					<div {...stylex.props(styles.avatarWrap)}>
						<div {...stylex.props(styles.avatarPlaceholder)}>
							<User size={40} />
						</div>
						<button type="button" {...stylex.props(styles.cameraButton)}>
							<Camera size={16} />
						</button>
					</div>
					<p {...stylex.props(styles.avatarHint)}>프로필 사진 변경</p>
				</div>

				<div {...stylex.props(styles.form)}>
					<div {...stylex.props(styles.formGroup)}>
						<label htmlFor="email" {...stylex.props(styles.label)}>
							이메일
						</label>
						<input
							id="email"
							type="email"
							value="user@example.com"
							disabled
							{...stylex.props(styles.input, styles.inputDisabled)}
						/>
						<p {...stylex.props(styles.inputHint)}>
							이메일은 변경할 수 없습니다
						</p>
					</div>

					<div {...stylex.props(styles.formGroup)}>
						<label htmlFor="nickname" {...stylex.props(styles.label)}>
							닉네임
						</label>
						<input
							id="nickname"
							type="text"
							value={nickname}
							onChange={(e) => handleNicknameChange(e.target.value)}
							placeholder="닉네임을 입력해 주세요"
							maxLength={20}
							{...stylex.props(styles.input)}
						/>
						<p {...stylex.props(styles.inputHint)}>2-20자 이내로 입력해 주세요</p>
					</div>

					<div {...stylex.props(styles.formGroup)}>
						<label htmlFor="bio" {...stylex.props(styles.label)}>
							자기소개
						</label>
						<textarea
							id="bio"
							value={bio}
							onChange={(e) => handleBioChange(e.target.value)}
							placeholder="자기소개를 입력해 주세요"
							maxLength={200}
							{...stylex.props(styles.textarea)}
						/>
						<span {...stylex.props(styles.charCount)}>{bio.length}/200</span>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	);
}
