"use client";

import * as stylex from "@stylexjs/stylex";
import { ArrowLeft, Camera, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useState, useTransition } from "react";
import { toast } from "sonner";

import { colors, size } from "@/app/global-tokens.stylex";
import { Button, Input } from "@/components/ui";
import { api } from "@/utils/eden";

const conditions = [
	{ id: "new", name: "새 상품" },
	{ id: "like-new", name: "거의 새것" },
	{ id: "good", name: "사용감 적음" },
	{ id: "used", name: "사용감 있음" },
];

const MAX_IMAGE_COUNT = 10;
const MAX_FILE_SIZE_MB = 20;

type SelectedImage = {
	file: File;
	preview: string;
};

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: colors.bgPrimary,
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
	mainImageBadge: {
		position: "absolute",
		bottom: "4px",
		left: "4px",
		paddingTop: "2px",
		paddingBottom: "2px",
		paddingLeft: "6px",
		paddingRight: "6px",
		backgroundColor: colors.bgInverse,
		color: colors.textInverse,
		fontSize: "10px",
		fontWeight: 600,
		borderRadius: "4px",
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
	priceSuffix: {
		position: "absolute",
		right: "16px",
		top: "50%",
		transform: "translateY(-50%)",
		fontSize: "16px",
		fontWeight: 500,
		color: colors.textMuted,
	},
	conditionContainer: {
		display: "flex",
		gap: "8px",
		flexWrap: "wrap",
	},
	conditionButton: {
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
	conditionButtonActive: {
		backgroundColor: colors.bgInverse,
		color: colors.textInverse,
	},
	textarea: {
		width: "100%",
		minHeight: "160px",
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
	charCount: {
		fontSize: "12px",
		color: colors.textPlaceholder,
		textAlign: "right",
		marginTop: "8px",
	},
	negotiableContainer: {
		display: "flex",
		alignItems: "center",
		gap: "10px",
		marginTop: "12px",
	},
	checkbox: {
		width: "20px",
		height: "20px",
		accentColor: colors.bgInverse,
		cursor: "pointer",
	},
	checkboxLabel: {
		fontSize: "14px",
		color: colors.textTertiary,
		cursor: "pointer",
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

export default function MarketRegisterPage() {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [images, setImages] = useState<SelectedImage[]>([]);
	const [title, setTitle] = useState("");
	const [price, setPrice] = useState("");
	const [condition, setCondition] = useState<string | null>(null);
	const [description, setDescription] = useState("");
	const [isNegotiable, setIsNegotiable] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

	const hasImages = images.length > 0;
	const hasTitle = title.trim().length > 0;
	const hasDescription = description.trim().length > 0;
	const hasCondition = condition !== null;
	const hasPrice = price.trim().length > 0;

	const isFormValid =
		hasImages &&
		hasTitle &&
		hasCondition &&
		hasDescription &&
		(hasPrice || isNegotiable);
	const isDisabled = !isFormValid || isPending || isUploading;

	const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files) return;

		const remainingSlots = MAX_IMAGE_COUNT - images.length;
		if (remainingSlots <= 0) {
			toast.error(`이미지는 최대 ${MAX_IMAGE_COUNT}개까지 업로드할 수 있어요.`);
			event.target.value = "";
			return;
		}

		const selectedFiles = Array.from(files).slice(0, remainingSlots);
		const validImages: SelectedImage[] = [];
		const errors: string[] = [];

		selectedFiles.forEach((file) => {
			if (!file.type.startsWith("image/")) {
				errors.push("이미지 파일만 업로드할 수 있어요.");
				return;
			}

			if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
				errors.push(
					`${file.name} 파일이 너무 큽니다. 최대 ${MAX_FILE_SIZE_MB}MB까지 업로드할 수 있어요.`,
				);
				return;
			}

			validImages.push({
				file,
				preview: URL.createObjectURL(file),
			});
		});

		if (errors.length > 0) {
			toast.error(errors[0]);
		}

		if (validImages.length > 0) {
			setImages((prev) => [...prev, ...validImages]);
		}

		event.target.value = "";
	};

	const handleRemoveImage = (index: number) => {
		const target = images[index];
		if (target) {
			URL.revokeObjectURL(target.preview);
		}
		setImages((prev) => prev.filter((_, i) => i !== index));
	};

	const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/[^0-9]/g, "");
		if (value === "") {
			setPrice("");
			return;
		}
		const numValue = parseInt(value, 10);
		setPrice(numValue.toLocaleString());
	};

	const handleSubmit = () => {
		if (isDisabled) return;

		startTransition(async () => {
			let uploadedUrls: string[] = [];
			setIsUploading(true);

			try {
				const uploadResult = await api.storage.upload.files.post({
					bucket: "markets",
					files: images.map((image) => image.file),
				});

				if (
					uploadResult.error ||
					!uploadResult.data ||
					!("uploaded" in uploadResult.data) ||
					!uploadResult.data.uploaded
				) {
					toast.error("이미지 업로드에 실패했습니다. 다시 시도해 주세요.");
					return;
				}

				const hasErrors =
					Array.isArray(uploadResult.data.errors) &&
					uploadResult.data.errors.length > 0;

				if (hasErrors) {
					toast.error(
						"일부 이미지 업로드에 실패했습니다. 파일을 확인해 주세요.",
					);
					return;
				}

				uploadedUrls = uploadResult.data.uploaded
					.sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
					.map((item) => item.publicUrl);
			} catch (error) {
				console.error("Image upload failed", error);
				toast.error("이미지 업로드 중 오류가 발생했습니다.");
				return;
			} finally {
				setIsUploading(false);
			}

			if (uploadedUrls.length === 0) {
				toast.error("업로드된 이미지가 없습니다.");
				return;
			}

			const priceNumber = price.trim()
				? Number.parseInt(price.replace(/,/g, ""), 10)
				: undefined;
			const conditionLabel =
				conditions.find((c) => c.id === condition)?.name ?? "상태 미입력";
			const metaLines = [
				`상태: ${conditionLabel}`,
				`가격 협상: ${isNegotiable ? "가능" : "불가"}`,
			];
			const fullDescription = `${description.trim()}\n\n---\n${metaLines.join(" · ")}`;

			const { error } = await api.markets.post({
				title: title.trim(),
				description: fullDescription,
				price: priceNumber,
				imageUrls: uploadedUrls,
			});

			if (error) {
				console.error("Failed to create market item:", error);
				toast.error("상품 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.");
				return;
			}

			toast.success("상품을 등록했습니다.");
			images.forEach((image) => {
				URL.revokeObjectURL(image.preview);
			});
			router.push("/market");
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
				<h1 {...stylex.props(styles.headerTitle)}>상품 등록</h1>
				<div {...stylex.props(styles.backButton)} aria-hidden="true" />
			</header>

			<div {...stylex.props(styles.content)}>
				<fieldset {...stylex.props(styles.fieldset)}>
					<legend {...stylex.props(styles.label)}>
						상품 이미지
						<span {...stylex.props(styles.required)}>*</span>
					</legend>
					<div {...stylex.props(styles.imageUploadArea)}>
						<label {...stylex.props(styles.imageUploadButton)}>
							<Camera size={28} {...stylex.props(styles.uploadIcon)} />
							<span {...stylex.props(styles.uploadText)}>
								{images.length}/{MAX_IMAGE_COUNT}
							</span>
							<input
								type="file"
								accept="image/*"
								multiple
								aria-label="상품 이미지 업로드"
								onChange={handleImageUpload}
								{...stylex.props(styles.hiddenInput)}
							/>
						</label>
						{images.map((image, index) => (
							<div
								key={image.preview}
								{...stylex.props(styles.imagePreviewContainer)}
							>
								<img
									src={image.preview}
									alt={`상품 이미지 ${index + 1}`}
									{...stylex.props(styles.imagePreview)}
								/>
								{index === 0 && (
									<span {...stylex.props(styles.mainImageBadge)}>대표</span>
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

				<div {...stylex.props(styles.formGroup)}>
					<Input
						label="상품명"
						required
						placeholder="상품명을 입력해주세요"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						maxLength={50}
					/>
					<div {...stylex.props(styles.charCount)}>{title.length}/50</div>
				</div>

				<div {...stylex.props(styles.formGroup)}>
					<Input
						label="가격"
						required
						type="text"
						inputMode="numeric"
						placeholder="가격을 입력해주세요"
						value={price}
						onChange={handlePriceChange}
						rightIcon={<span {...stylex.props(styles.priceSuffix)}>원</span>}
					/>
					<div {...stylex.props(styles.negotiableContainer)}>
						<input
							type="checkbox"
							id="negotiable"
							checked={isNegotiable}
							onChange={(e) => setIsNegotiable(e.target.checked)}
							{...stylex.props(styles.checkbox)}
						/>
						<label htmlFor="negotiable" {...stylex.props(styles.checkboxLabel)}>
							가격 협상 가능
						</label>
					</div>
				</div>

				<fieldset {...stylex.props(styles.fieldset)}>
					<legend {...stylex.props(styles.label)}>
						상품 상태
						<span {...stylex.props(styles.required)}>*</span>
					</legend>
					<div {...stylex.props(styles.conditionContainer)}>
						{conditions.map((item) => (
							<button
								key={item.id}
								type="button"
								onClick={() => setCondition(item.id)}
								{...stylex.props(
									styles.conditionButton,
									condition === item.id && styles.conditionButtonActive,
								)}
							>
								{item.name}
							</button>
						))}
					</div>
				</fieldset>

				<div {...stylex.props(styles.formGroup)}>
					<label htmlFor="description" {...stylex.props(styles.label)}>
						상품 설명
						<span {...stylex.props(styles.required)}>*</span>
					</label>
					<textarea
						id="description"
						placeholder={
							"상품에 대한 상세 설명을 입력해주세요\n(포카 그룹, 멤버, 앨범명, 상태 등)"
						}
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						maxLength={2000}
						{...stylex.props(styles.textarea)}
					/>
					<div {...stylex.props(styles.charCount)}>
						{description.length}/2000
					</div>
				</div>
			</div>

			<div {...stylex.props(styles.bottomButtonContainer)}>
				<Button
					type="button"
					onClick={handleSubmit}
					disabled={isDisabled}
					fullWidth
				>
					{isPending || isUploading ? (
						<Loader2 size={20} className="animate-spin" />
					) : (
						"등록하기"
					)}
				</Button>
			</div>
		</div>
	);
}
