"use client";

import * as stylex from "@stylexjs/stylex";
import { Camera, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import { api } from "@/utils/eden";

const styles = stylex.create({
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
	headerActions: {
		display: "flex",
		justifyContent: "flex-end",
		marginBottom: spacing.sm,
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
});

interface EditProfileFormProps {
	initialEmail: string;
	initialNickname: string;
	initialAvatar: string | null;
}

export default function EditProfileForm({
	initialEmail,
	initialNickname,
	initialAvatar,
}: EditProfileFormProps) {
	const router = useRouter();
	const [nickname, setNickname] = useState(initialNickname);
	const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatar);
	const [isSaving, startSaving] = useTransition();
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const isChanged = nickname !== initialNickname || avatarUrl !== initialAvatar;

	const handleUpload = async (file: File) => {
		setIsUploading(true);
		const { data, error } = await api.storage.upload.file.post({
			bucket: "avatars",
			file,
		});

		if (error || !data?.uploaded?.[0]?.publicUrl) {
			setIsUploading(false);
			const { value } = error || {};
			let errMsg = "이미지 업로드에 실패했습니다.";
			if (value) {
				if ("error" in value) {
					errMsg = value.error;
				} else if (value.message) {
					errMsg = value.message;
				}
			}
			toast.error(errMsg);
			return;
		}

		setAvatarUrl(data.uploaded[0].publicUrl);
		setIsUploading(false);
	};

	const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		try {
			await handleUpload(file);
			toast.success("프로필 사진이 업로드되었습니다.");
		} catch (error) {
			console.error(error);
			toast.error("이미지 업로드에 실패했습니다.");
		} finally {
			event.target.value = "";
		}
	};

	const handleSave = () => {
		if (!isChanged || !nickname.trim()) return;

		startSaving(async () => {
			const { error } = await api.users.me.put({
				nickname: nickname.trim(),
				profileImage: avatarUrl,
			});

			if (error) {
				toast.error("프로필 업데이트에 실패했습니다.");
				return;
			}

			toast.success("프로필이 수정되었습니다.");
			router.refresh();
		});
	};

	return (
		<>
			<div {...stylex.props(styles.headerActions)}>
				<button
					type="button"
					onClick={handleSave}
					disabled={!isChanged || isSaving}
					{...stylex.props(
						styles.saveButton,
						(!isChanged || isSaving) && styles.saveButtonDisabled,
					)}
				>
					저장
				</button>
			</div>
			<div {...stylex.props(styles.avatarSection)}>
				<div {...stylex.props(styles.avatarWrap)}>
					{avatarUrl ? (
						<img
							src={avatarUrl}
							alt="프로필"
							{...stylex.props(styles.avatar)}
						/>
					) : (
						<div {...stylex.props(styles.avatarPlaceholder)}>
							<User size={40} />
						</div>
					)}
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						disabled={isUploading}
						{...stylex.props(styles.cameraButton)}
					>
						<Camera size={16} />
					</button>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						onChange={handleFileChange}
						hidden
					/>
				</div>
				<p {...stylex.props(styles.avatarHint)}>
					최대 20MB의 이미지 파일을 업로드할 수 있습니다.
				</p>
			</div>

			<div {...stylex.props(styles.form)}>
				<div {...stylex.props(styles.formGroup)}>
					<label htmlFor="email" {...stylex.props(styles.label)}>
						이메일
					</label>
					<input
						id="email"
						type="email"
						value={initialEmail}
						disabled
						{...stylex.props(styles.input, styles.inputDisabled)}
					/>
					<p {...stylex.props(styles.inputHint)}>이메일은 변경할 수 없습니다</p>
				</div>

				<div {...stylex.props(styles.formGroup)}>
					<label htmlFor="nickname" {...stylex.props(styles.label)}>
						닉네임
					</label>
					<input
						id="nickname"
						type="text"
						value={nickname}
						onChange={(e) => setNickname(e.target.value)}
						placeholder="닉네임을 입력해 주세요"
						maxLength={20}
						{...stylex.props(styles.input)}
					/>
					<p {...stylex.props(styles.inputHint)}>2-20자 이내로 입력해 주세요</p>
				</div>
			</div>
		</>
	);
}
