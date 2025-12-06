"use client";

import * as stylex from "@stylexjs/stylex";
import { Camera, Check, Loader2, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
	type ChangeEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
	useTransition,
} from "react";
import { toast } from "sonner";

import {
	colors,
	fontSize,
	spacing,
} from "@/app/global-tokens.stylex";
import { Button, Input } from "@/components/ui";
import { api } from "@/utils/eden";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const spin = stylex.keyframes({
	"0%": { transform: "rotate(0deg)" },
	"100%": { transform: "rotate(360deg)" },
});

const styles = stylex.create({
	spinner: {
		animationName: spin,
		animationDuration: "1s",
		animationTimingFunction: "linear",
		animationIterationCount: "infinite",
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
	cameraButtonDisabled: {
		opacity: 0.6,
		cursor: "not-allowed",
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
	headerActions: {
		display: "flex",
		justifyContent: "flex-end",
		marginBottom: spacing.sm,
	},
});

interface EditProfileFormProps {
	initialEmail: string;
	initialNickname: string;
	initialAvatar: string | null;
}

type NicknameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

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
	const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>("idle");
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const isChanged = nickname !== initialNickname || avatarUrl !== initialAvatar;
	const isNicknameValid =
		nicknameStatus === "available" ||
		(nickname === initialNickname && nicknameStatus === "idle");
	const canSave = isChanged && isNicknameValid && !isSaving && !isUploading;

	const checkNickname = useCallback(
		async (value: string) => {
			if (value === initialNickname) {
				setNicknameStatus("idle");
				return;
			}

			if (value.length < 2 || value.length > 20) {
				setNicknameStatus("invalid");
				return;
			}

			setNicknameStatus("checking");

			try {
				const { data, error } = await api.users.me["check-nickname"].get({
					query: { nickname: value },
				});

				if (error || !data) {
					setNicknameStatus("invalid");
					return;
				}

				setNicknameStatus(data.available ? "available" : "taken");
			} catch {
				setNicknameStatus("invalid");
			}
		},
		[initialNickname],
	);

	const handleNicknameChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setNickname(value);

		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		if (value === initialNickname) {
			setNicknameStatus("idle");
			return;
		}

		if (value.length < 2) {
			setNicknameStatus("invalid");
			return;
		}

		debounceRef.current = setTimeout(() => {
			checkNickname(value);
		}, 500);
	};

	useEffect(() => {
		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, []);

	const validateFile = (file: File): string | null => {
		if (!ALLOWED_FILE_TYPES.includes(file.type)) {
			return "JPG, PNG, GIF, WebP 형식만 업로드할 수 있습니다.";
		}
		if (file.size > MAX_FILE_SIZE) {
			return "파일 크기는 5MB 이하만 가능합니다.";
		}
		return null;
	};

	const handleUpload = async (file: File) => {
		const validationError = validateFile(file);
		if (validationError) {
			toast.error(validationError);
			return;
		}

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
		toast.success("프로필 사진이 업로드되었습니다.");
	};

	const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		try {
			await handleUpload(file);
		} catch (error) {
			console.error(error);
			toast.error("이미지 업로드에 실패했습니다.");
		} finally {
			event.target.value = "";
		}
	};

	const handleSave = () => {
		if (!canSave) return;

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

	const getNicknameHint = () => {
		switch (nicknameStatus) {
			case "checking":
				return "닉네임 확인 중...";
			case "available":
				return "사용 가능한 닉네임입니다.";
			case "taken":
				return "이미 사용 중인 닉네임입니다.";
			case "invalid":
				return "2-20자 이내로 입력해 주세요";
			default:
				return "2-20자 이내로 입력해 주세요";
		}
	};

	const getNicknameIcon = () => {
		switch (nicknameStatus) {
			case "checking":
				return (
					<Loader2
						size={16}
						color={colors.textMuted}
						{...stylex.props(styles.spinner)}
					/>
				);
			case "available":
				return <Check size={16} color={colors.statusSuccess} />;
			case "taken":
			case "invalid":
				return <X size={16} color={colors.statusError} />;
			default:
				return null;
		}
	};

	const nicknameHint = getNicknameHint();
	const hasNicknameError =
		nicknameStatus === "taken" || nicknameStatus === "invalid";

	return (
		<>
			<div {...stylex.props(styles.headerActions)}>
				<Button
					variant="ghost"
					onClick={handleSave}
					disabled={!canSave}
					size="sm"
				>
					{isSaving && (
						<Loader2 size={16} {...stylex.props(styles.spinner)} />
					)}
					{isSaving ? "저장 중..." : "저장"}
				</Button>
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
						{...stylex.props(
							styles.cameraButton,
							isUploading && styles.cameraButtonDisabled,
						)}
					>
						{isUploading ? (
							<Loader2 size={16} {...stylex.props(styles.spinner)} />
						) : (
							<Camera size={16} />
						)}
					</button>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/jpeg,image/png,image/gif,image/webp"
						onChange={handleFileChange}
						hidden
					/>
				</div>
				<p {...stylex.props(styles.avatarHint)}>
					JPG, PNG, GIF, WebP (최대 5MB)
				</p>
			</div>

			<div {...stylex.props(styles.form)}>
				<Input
					label="이메일"
					value={initialEmail}
					disabled
					helperText="이메일은 변경할 수 없습니다"
					readOnly
				/>

				<Input
					label="닉네임"
					value={nickname}
					onChange={handleNicknameChange}
					placeholder="닉네임을 입력해 주세요"
					maxLength={20}
					required
					rightIcon={getNicknameIcon()}
					error={hasNicknameError ? nicknameHint : undefined}
					helperText={!hasNicknameError ? nicknameHint : undefined}
				/>
			</div>
		</>
	);
}
