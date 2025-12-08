"use client";

import * as stylex from "@stylexjs/stylex";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { colors, radius, size } from "@/app/global-tokens.stylex";
import { api } from "@/utils/eden";

interface ChatImageUploadButtonProps {
	onUploaded: (url: string) => Promise<void>;
	disabled?: boolean;
}

const styles = stylex.create({
	button: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: size.touchTarget,
		height: size.touchTarget,
		backgroundColor: colors.bgTertiary,
		borderRadius: radius.lg,
		borderWidth: 0,
		cursor: "pointer",
		color: colors.textMuted,
		fontSize: "20px",
	},
	hiddenInput: {
		display: "none",
	},
});

export function ChatImageUploadButton({
	onUploaded,
	disabled = false,
}: ChatImageUploadButtonProps) {
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	const handlePickImage = () => {
		if (disabled || isUploading) return;
		fileInputRef.current?.click();
	};

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			toast.error("이미지 파일만 업로드할 수 있어요.");
			event.target.value = "";
			return;
		}

		if (file.size > 20 * 1024 * 1024) {
			toast.error("최대 20MB까지 업로드할 수 있어요.");
			event.target.value = "";
			return;
		}

		setIsUploading(true);
		try {
			const { data, error } = await api.storage.upload.file.post({
				bucket: "images",
				file,
			});

			if (error || !data || !("uploaded" in data) || !data.uploaded?.[0]) {
				toast.error("이미지 업로드에 실패했어요.");
				return;
			}

			const imageUrl = data.uploaded[0].publicUrl;
			await onUploaded(imageUrl);
		} catch (err) {
			console.error("Image upload error:", err);
			toast.error("이미지 업로드에 실패했어요.");
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	return (
		<button
			type="button"
			aria-label="이미지 첨부"
			onClick={handlePickImage}
			disabled={disabled || isUploading}
			{...stylex.props(styles.button)}
		>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleFileChange}
				{...stylex.props(styles.hiddenInput)}
			/>
			<Plus size={20} />
		</button>
	);
}
