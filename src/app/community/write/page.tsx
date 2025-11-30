"use client";

import * as stylex from "@stylexjs/stylex";
import { ArrowLeft, ImagePlus, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { colors, size } from "@/app/global-tokens.stylex";
import { api } from "@/utils/eden";
import { toast } from "sonner";

const categories = [
	{ id: 1, name: "자유게시판", slug: "free" },
	{ id: 2, name: "포카 자랑", slug: "boast" },
	{ id: 3, name: "정보 공유", slug: "info" },
];

interface ImageFile {
	file: File;
	preview: string;
}

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
		justifyContent: "space-between",
		paddingTop: "16px",
		paddingBottom: "16px",
		paddingLeft: "14px",
		paddingRight: "14px",
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
	},
	backButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "40px",
		height: "40px",
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
		fontSize: "24px",
		color: colors.textPrimary,
	},
	headerTitle: {
		fontSize: "18px",
		fontWeight: 700,
		color: colors.textPrimary,
		margin: 0,
	},
	submitButton: {
		paddingTop: "10px",
		paddingBottom: "10px",
		paddingLeft: "20px",
		paddingRight: "20px",
		fontSize: "15px",
		fontWeight: 600,
		color: colors.textInverse,
		backgroundColor: colors.bgInverse,
		borderWidth: 0,
		borderRadius: "8px",
		cursor: "pointer",
		transition: "opacity 0.2s ease",
	},
	submitButtonDisabled: {
		opacity: 0.5,
		cursor: "not-allowed",
	},
	content: {
		flex: 1,
		paddingTop: "20px",
		paddingBottom: "24px",
		paddingLeft: "14px",
		paddingRight: "14px",
	},
	formGroup: {
		marginBottom: "24px",
	},
	fieldset: {
		marginBottom: "24px",
		borderWidth: 0,
		paddingTop: 0,
		paddingBottom: 0,
		paddingLeft: 0,
		paddingRight: 0,
	},
	label: {
		display: "block",
		fontSize: "14px",
		fontWeight: 600,
		color: colors.textTertiary,
		marginBottom: "8px",
	},
	required: {
		color: colors.statusErrorLight,
		marginLeft: "2px",
	},
	categoryContainer: {
		display: "flex",
		gap: "8px",
		flexWrap: "wrap",
	},
	categoryButton: {
		paddingTop: "10px",
		paddingBottom: "10px",
		paddingLeft: "18px",
		paddingRight: "18px",
		borderRadius: "20px",
		fontSize: "14px",
		fontWeight: 500,
		backgroundColor: colors.bgTertiary,
		color: colors.textMuted,
		borderWidth: 0,
		cursor: "pointer",
		transition: "all 0.2s ease",
	},
	categoryButtonActive: {
		backgroundColor: colors.bgInverse,
		color: colors.textInverse,
	},
	input: {
		width: "100%",
		paddingTop: "14px",
		paddingBottom: "14px",
		paddingLeft: "16px",
		paddingRight: "16px",
		fontSize: "16px",
		color: colors.textPrimary,
		backgroundColor: colors.bgSecondary,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		borderRadius: "12px",
		outline: "none",
		transition: "border-color 0.2s ease",
		"::placeholder": {
			color: colors.textPlaceholder,
		},
	},
	textarea: {
		width: "100%",
		minHeight: "200px",
		paddingTop: "14px",
		paddingBottom: "14px",
		paddingLeft: "16px",
		paddingRight: "16px",
		fontSize: "16px",
		lineHeight: "1.6",
		color: colors.textPrimary,
		backgroundColor: colors.bgSecondary,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		borderRadius: "12px",
		outline: "none",
		resize: "vertical",
		fontFamily: "inherit",
		transition: "border-color 0.2s ease",
		"::placeholder": {
			color: colors.textPlaceholder,
		},
	},
	imageUploadArea: {
		display: "flex",
		alignItems: "center",
		gap: "12px",
		overflowX: "auto",
		paddingBottom: "8px",
	},
	imageUploadButton: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		width: "100px",
		height: "100px",
		backgroundColor: colors.bgSecondary,
		borderWidth: 2,
		borderStyle: "dashed",
		borderColor: colors.borderPrimary,
		borderRadius: "12px",
		cursor: "pointer",
		flexShrink: 0,
		transition: "border-color 0.2s ease",
	},
	uploadIcon: {
		fontSize: "28px",
		color: colors.textPlaceholder,
		marginBottom: "4px",
	},
	uploadText: {
		fontSize: "12px",
		color: colors.textPlaceholder,
	},
	imagePreviewContainer: {
		position: "relative",
		width: "100px",
		height: "100px",
		flexShrink: 0,
	},
	imagePreview: {
		width: "100%",
		height: "100%",
		objectFit: "cover",
		borderRadius: "12px",
	},
	removeImageButton: {
		position: "absolute",
		top: "-8px",
		right: "-8px",
		width: "24px",
		height: "24px",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.bgInverse,
		color: colors.textInverse,
		borderWidth: 0,
		borderRadius: "50%",
		cursor: "pointer",
		fontSize: "14px",
	},
	hiddenInput: {
		display: "none",
	},
	charCount: {
		fontSize: "12px",
		color: colors.textPlaceholder,
		textAlign: "right",
		marginTop: "8px",
	},
	bottomButtonContainer: {
		position: "sticky",
		bottom: size.bottomMenuHeight,
		left: 0,
		right: 0,
		paddingTop: "12px",
		paddingBottom: "12px",
		paddingLeft: "14px",
		paddingRight: "14px",
		backgroundColor: colors.bgPrimary,
		borderTopWidth: 1,
		borderTopStyle: "solid",
		borderTopColor: colors.borderPrimary,
		zIndex: 10,
	},
	bottomButton: {
		width: "100%",
		paddingTop: "16px",
		paddingBottom: "16px",
		fontSize: "16px",
		fontWeight: 600,
		color: colors.textInverse,
		backgroundColor: colors.bgInverse,
		borderWidth: 0,
		borderRadius: "12px",
		cursor: "pointer",
		transition: "opacity 0.2s ease",
	},
	bottomButtonDisabled: {
		opacity: 0.5,
		cursor: "not-allowed",
	},
});

export default function CommunityWritePage() {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [images, setImages] = useState<ImageFile[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const isFormValid =
		selectedCategory !== null && title.trim() && content.trim();
	const isDisabled = !isFormValid || isPending;

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;

		const newImages: ImageFile[] = [];
		Array.from(files).forEach((file) => {
			if (images.length + newImages.length >= 10) return;
			const preview = URL.createObjectURL(file);
			newImages.push({ file, preview });
		});

		setImages((prev) => [...prev, ...newImages]);

		// Reset file input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleRemoveImage = (index: number) => {
		setImages((prev) => {
			const removed = prev[index];
			if (removed) {
				URL.revokeObjectURL(removed.preview);
			}
			return prev.filter((_, i) => i !== index);
		});
	};

	const uploadImages = async (
		imageFiles: ImageFile[],
	): Promise<string[] | null> => {
		if (imageFiles.length === 0) return [];

		const { data, error } = await api.storage.upload.files.post({
			bucket: "posts",
			files: imageFiles.map((img) => img.file),
		});

		if (error || !data || !("uploaded" in data) || !data.uploaded) {
			console.error("Failed to upload images:", error);
			return null;
		}

		return data.uploaded.map((item) => item.publicUrl);
	};

	const handleSubmit = () => {
		if (isDisabled) return;

		startTransition(async () => {
			// Upload images first
			const imageUrls = await uploadImages(images);
			if (imageUrls === null) {
				toast.error("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
				return;
			}

			// Combine title and content for the API (API only has content field)
			const fullContent = `[${categories.find((c) => c.id === selectedCategory)?.name}] ${title}\n\n${content}`;

			const { data, error } = await api.posts.post({
				content: fullContent,
				imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
			});

			if (error || !data) {
				console.error("Failed to create post:", error);
				toast.error("게시글 작성에 실패했습니다. 다시 시도해주세요.");
				return;
			}

			toast.success("게시글이 작성되었습니다");
			router.push(`/community/posts/${data.id}`);
		});
	};

	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<button
					type="button"
					onClick={() => router.back()}
					{...stylex.props(styles.backButton)}
				>
					<ArrowLeft size={24} />
				</button>
				<h1 {...stylex.props(styles.headerTitle)}>글쓰기</h1>
				<div {...stylex.props(styles.backButton)} aria-hidden="true" />
			</header>

			<div {...stylex.props(styles.content)}>
				<fieldset {...stylex.props(styles.fieldset)}>
					<legend {...stylex.props(styles.label)}>
						카테고리
						<span {...stylex.props(styles.required)}>*</span>
					</legend>
					<div {...stylex.props(styles.categoryContainer)}>
						{categories.map((category) => (
							<button
								key={category.id}
								type="button"
								onClick={() => setSelectedCategory(category.id)}
								{...stylex.props(
									styles.categoryButton,
									selectedCategory === category.id && styles.categoryButtonActive
								)}
							>
								{category.name}
							</button>
						))}
					</div>
				</fieldset>

				<div {...stylex.props(styles.formGroup)}>
					<label htmlFor="title" {...stylex.props(styles.label)}>
						제목
						<span {...stylex.props(styles.required)}>*</span>
					</label>
					<input
						id="title"
						type="text"
						placeholder="제목을 입력해주세요"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						maxLength={100}
						{...stylex.props(styles.input)}
					/>
					<div {...stylex.props(styles.charCount)}>{title.length}/100</div>
				</div>

				<div {...stylex.props(styles.formGroup)}>
					<label htmlFor="content" {...stylex.props(styles.label)}>
						내용
						<span {...stylex.props(styles.required)}>*</span>
					</label>
					<textarea
						id="content"
						placeholder="내용을 입력해주세요"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						maxLength={5000}
						{...stylex.props(styles.textarea)}
					/>
					<div {...stylex.props(styles.charCount)}>{content.length}/5000</div>
				</div>

				<fieldset {...stylex.props(styles.fieldset)}>
					<legend {...stylex.props(styles.label)}>이미지 첨부</legend>
					<div {...stylex.props(styles.imageUploadArea)}>
						<label {...stylex.props(styles.imageUploadButton)}>
							<ImagePlus size={28} {...stylex.props(styles.uploadIcon)} />
							<span {...stylex.props(styles.uploadText)}>{images.length}/10</span>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								multiple
								aria-label="이미지 첨부 업로드"
								onChange={handleImageUpload}
								{...stylex.props(styles.hiddenInput)}
							/>
						</label>
						{images.map((image, index) => (
							<div key={index} {...stylex.props(styles.imagePreviewContainer)}>
								<img
									src={image.preview}
									alt={`첨부 이미지 ${index + 1}`}
									{...stylex.props(styles.imagePreview)}
								/>
								<button
									type="button"
									onClick={() => handleRemoveImage(index)}
									{...stylex.props(styles.removeImageButton)}
								>
									<X size={14} />
								</button>
							</div>
						))}
					</div>
				</fieldset>
			</div>

			<div {...stylex.props(styles.bottomButtonContainer)}>
				<button
					type="button"
					onClick={handleSubmit}
					disabled={isDisabled}
					{...stylex.props(
						styles.bottomButton,
						isDisabled && styles.bottomButtonDisabled,
					)}
				>
					{isPending ? <Loader2 size={20} className="animate-spin" /> : "등록하기"}
				</button>
			</div>
		</div>
	);
}
