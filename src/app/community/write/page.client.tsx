"use client";

import * as stylex from "@stylexjs/stylex";
import {
	AlertCircle,
	ArrowLeft,
	ImagePlus,
	Loader2,
	RefreshCw,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { colors, size } from "@/app/global-tokens.stylex";
import { Button, Input } from "@/components/ui";
import { api } from "@/utils/eden";

const categories = [
	{ id: 1, name: "자유게시판", slug: "free" },
	{ id: 2, name: "포카 자랑", slug: "boast" },
	{ id: 3, name: "정보 공유", slug: "info" },
];

interface ImageFile {
	file: File;
	preview: string;
	status: "pending" | "uploading" | "uploaded" | "failed";
	uploadedUrl?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
	imageOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		borderRadius: "12px",
	},
	retryButton: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: "4px",
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
		color: colors.textInverse,
	},
	retryText: {
		fontSize: "10px",
		color: colors.textInverse,
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
		let oversizedCount = 0;

		Array.from(files).forEach((file) => {
			if (images.length + newImages.length >= 10) return;

			// Check file size
			if (file.size > MAX_FILE_SIZE) {
				oversizedCount++;
				return;
			}

			const preview = URL.createObjectURL(file);
			newImages.push({ file, preview, status: "pending" });
		});

		if (oversizedCount > 0) {
			toast.error(`${oversizedCount}개 파일이 10MB를 초과하여 제외되었습니다`);
		}

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

	const uploadSingleImage = async (
		imageFile: ImageFile,
		index: number,
	): Promise<string | null> => {
		// Update status to uploading
		setImages((prev) =>
			prev.map((img, i) =>
				i === index ? { ...img, status: "uploading" } : img,
			),
		);

		try {
			const { data, error } = await api.storage.upload.files.post({
				bucket: "posts",
				files: [imageFile.file],
			});

			if (error || !data || !("uploaded" in data) || !data.uploaded?.[0]) {
				throw new Error("Upload failed");
			}

			const uploadedUrl = data.uploaded[0].publicUrl;

			// Update status to uploaded
			setImages((prev) =>
				prev.map((img, i) =>
					i === index ? { ...img, status: "uploaded", uploadedUrl } : img,
				),
			);

			return uploadedUrl;
		} catch {
			// Update status to failed
			setImages((prev) =>
				prev.map((img, i) =>
					i === index ? { ...img, status: "failed" } : img,
				),
			);
			return null;
		}
	};

	const handleRetryUpload = async (index: number) => {
		const image = images[index];
		if (!image || image.status !== "failed") return;

		const result = await uploadSingleImage(image, index);
		if (result) {
			toast.success("이미지 업로드 성공");
		} else {
			toast.error("이미지 업로드에 실패했습니다", {
				action: {
					label: "재시도",
					onClick: () => handleRetryUpload(index),
				},
			});
		}
	};

	const uploadAllImages = async (): Promise<string[] | null> => {
		const pendingImages = images.filter((img) => img.status === "pending");
		const alreadyUploaded = images
			.filter((img) => img.status === "uploaded" && img.uploadedUrl)
			.map((img) => img.uploadedUrl as string);

		if (pendingImages.length === 0) {
			return alreadyUploaded;
		}

		const uploadPromises = pendingImages.map((img) => {
			const index = images.indexOf(img);
			return uploadSingleImage(img, index);
		});

		const results = await Promise.all(uploadPromises);
		const failedCount = results.filter((r) => r === null).length;

		if (failedCount > 0) {
			toast.error(`${failedCount}개 이미지 업로드에 실패했습니다`, {
				action: {
					label: "재시도",
					onClick: () => handleSubmit(),
				},
			});
			return null;
		}

		return [...alreadyUploaded, ...(results.filter(Boolean) as string[])];
	};

	const handleSubmit = () => {
		if (isDisabled) return;

		startTransition(async () => {
			// Upload images first
			const imageUrls = await uploadAllImages();
			if (imageUrls === null) {
				return;
			}

			const selectedCategoryData = categories.find(
				(c) => c.id === selectedCategory,
			);
			const fullContent = `${title}\n\n${content}`;

			const { data, error } = await api.posts.post({
				content: fullContent,
				category: selectedCategoryData?.slug as "free" | "boast" | "info",
				imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
			});

			if (error || !data) {
				console.error("Failed to create post:", error);
				toast.error("게시글 작성에 실패했습니다", {
					action: {
						label: "재시도",
						onClick: () => handleSubmit(),
					},
				});
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
									selectedCategory === category.id &&
										styles.categoryButtonActive,
								)}
							>
								{category.name}
							</button>
						))}
					</div>
				</fieldset>

				<div {...stylex.props(styles.formGroup)}>
					<Input
						label="제목"
						required
						placeholder="제목을 입력해주세요"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						maxLength={100}
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
							<span {...stylex.props(styles.uploadText)}>
								{images.length}/10
							</span>
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
								{image.status === "uploading" && (
									<div {...stylex.props(styles.imageOverlay)}>
										<Loader2 size={24} color="white" className="animate-spin" />
									</div>
								)}
								{image.status === "failed" && (
									<div {...stylex.props(styles.imageOverlay)}>
										<button
											type="button"
											onClick={() => handleRetryUpload(index)}
											{...stylex.props(styles.retryButton)}
										>
											<AlertCircle size={20} />
											<RefreshCw size={16} />
											<span {...stylex.props(styles.retryText)}>재시도</span>
										</button>
									</div>
								)}
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
				<Button
					type="button"
					onClick={handleSubmit}
					disabled={isDisabled}
					fullWidth
				>
					{isPending ? (
						<Loader2 size={20} className="animate-spin" />
					) : (
						"등록하기"
					)}
				</Button>
			</div>
		</div>
	);
}
