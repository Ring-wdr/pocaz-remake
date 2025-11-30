"use client";

import * as stylex from "@stylexjs/stylex";
import { useRouter } from "next/navigation";
import { useState } from "react";

const categories = [
	{ id: 1, name: "자유게시판", slug: "free" },
	{ id: 2, name: "포카 자랑", slug: "boast" },
	{ id: 3, name: "정보 공유", slug: "info" },
];

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: "#fff",
		minHeight: "100vh",
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
		borderBottomColor: "#e5e7eb",
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
		color: "#000",
	},
	headerTitle: {
		fontSize: "18px",
		fontWeight: 700,
		color: "#000",
		margin: 0,
	},
	submitButton: {
		paddingTop: "10px",
		paddingBottom: "10px",
		paddingLeft: "20px",
		paddingRight: "20px",
		fontSize: "15px",
		fontWeight: 600,
		color: "#fff",
		backgroundColor: "#000",
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
		color: "#374151",
		marginBottom: "8px",
	},
	required: {
		color: "#ef4444",
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
		backgroundColor: "#f3f4f6",
		color: "#6b7280",
		borderWidth: 0,
		cursor: "pointer",
		transition: "all 0.2s ease",
	},
	categoryButtonActive: {
		backgroundColor: "#000",
		color: "#fff",
	},
	input: {
		width: "100%",
		paddingTop: "14px",
		paddingBottom: "14px",
		paddingLeft: "16px",
		paddingRight: "16px",
		fontSize: "16px",
		color: "#000",
		backgroundColor: "#f9fafb",
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "#e5e7eb",
		borderRadius: "12px",
		outline: "none",
		transition: "border-color 0.2s ease",
		"::placeholder": {
			color: "#9ca3af",
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
		color: "#000",
		backgroundColor: "#f9fafb",
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "#e5e7eb",
		borderRadius: "12px",
		outline: "none",
		resize: "vertical",
		fontFamily: "inherit",
		transition: "border-color 0.2s ease",
		"::placeholder": {
			color: "#9ca3af",
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
		backgroundColor: "#f9fafb",
		borderWidth: 2,
		borderStyle: "dashed",
		borderColor: "#e5e7eb",
		borderRadius: "12px",
		cursor: "pointer",
		flexShrink: 0,
		transition: "border-color 0.2s ease",
	},
	uploadIcon: {
		fontSize: "28px",
		color: "#9ca3af",
		marginBottom: "4px",
	},
	uploadText: {
		fontSize: "12px",
		color: "#9ca3af",
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
		backgroundColor: "#000",
		color: "#fff",
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
		color: "#9ca3af",
		textAlign: "right",
		marginTop: "8px",
	},
});

export default function CommunityWritePage() {
	const router = useRouter();
	const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [images, setImages] = useState<string[]>([]);

	const isFormValid = selectedCategory !== null && title.trim() && content.trim();

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;

		const newImages: string[] = [];
		Array.from(files).forEach((file) => {
			const reader = new FileReader();
			reader.onload = () => {
				if (typeof reader.result === "string") {
					setImages((prev) => [...prev, reader.result as string]);
				}
			};
			reader.readAsDataURL(file);
		});
	};

	const handleRemoveImage = (index: number) => {
		setImages((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSubmit = async () => {
		if (!isFormValid) return;

		// TODO: API 연동
		console.log({
			category: selectedCategory,
			title,
			content,
			images,
		});

		router.push("/community");
	};

	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<button
					type="button"
					onClick={() => router.back()}
					{...stylex.props(styles.backButton)}
				>
					<i className="ri-arrow-left-line" />
				</button>
				<h1 {...stylex.props(styles.headerTitle)}>글쓰기</h1>
				<button
					type="button"
					onClick={handleSubmit}
					disabled={!isFormValid}
					{...stylex.props(
						styles.submitButton,
						!isFormValid && styles.submitButtonDisabled
					)}
				>
					등록
				</button>
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
							<i className="ri-image-add-line" {...stylex.props(styles.uploadIcon)} />
							<span {...stylex.props(styles.uploadText)}>{images.length}/10</span>
							<input
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
									src={image}
									alt={`첨부 이미지 ${index + 1}`}
									{...stylex.props(styles.imagePreview)}
								/>
								<button
									type="button"
									onClick={() => handleRemoveImage(index)}
									{...stylex.props(styles.removeImageButton)}
								>
									<i className="ri-close-line" />
								</button>
							</div>
						))}
					</div>
				</fieldset>
			</div>
		</div>
	);
}
