"use client";

import * as stylex from "@stylexjs/stylex";
import { ArrowLeft, Camera, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { colors } from "@/app/global-tokens.stylex";
import { api } from "@/utils/eden";

const conditions = [
	{ id: "new", name: "새 상품" },
	{ id: "like-new", name: "거의 새것" },
	{ id: "good", name: "사용감 적음" },
	{ id: "used", name: "사용감 있음" },
];

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
	priceInputContainer: {
		position: "relative",
	},
	priceInput: {
		width: "100%",
		paddingTop: "14px",
		paddingBottom: "14px",
		paddingLeft: "16px",
		paddingRight: "40px",
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
});

export default function MarketRegisterPage() {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [images, setImages] = useState<string[]>([]);
	const [title, setTitle] = useState("");
	const [price, setPrice] = useState("");
	const [condition, setCondition] = useState<string | null>(null);
	const [description, setDescription] = useState("");
	const [isNegotiable, setIsNegotiable] = useState(false);

	const isFormValid =
		images.length > 0 &&
		title.trim() &&
		price.trim() &&
		condition !== null &&
		description.trim();
	const isDisabled = !isFormValid || isPending;

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;

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

	const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
			const priceNumber = parseInt(price.replace(/,/g, ""), 10);
			const fullDescription = `[${conditions.find((c) => c.id === condition)?.name}] ${description}${isNegotiable ? "\n\n(가격 협상 가능)" : ""}`;

			const { error } = await api.markets.post({
				title,
				description: fullDescription,
				price: priceNumber,
				imageUrls: images.length > 0 ? images : undefined,
			});

			if (error) {
				console.error("Failed to create market item:", error);
				return;
			}

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
				<button
					type="button"
					onClick={handleSubmit}
					disabled={isDisabled}
					{...stylex.props(
						styles.submitButton,
						isDisabled && styles.submitButtonDisabled
					)}
				>
					{isPending ? <Loader2 size={18} className="animate-spin" /> : "등록"}
				</button>
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
							<span {...stylex.props(styles.uploadText)}>{images.length}/10</span>
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
							<div key={index} {...stylex.props(styles.imagePreviewContainer)}>
								<img
									src={image}
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
					<label htmlFor="title" {...stylex.props(styles.label)}>
						상품명
						<span {...stylex.props(styles.required)}>*</span>
					</label>
					<input
						id="title"
						type="text"
						placeholder="상품명을 입력해주세요"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						maxLength={50}
						{...stylex.props(styles.input)}
					/>
					<div {...stylex.props(styles.charCount)}>{title.length}/50</div>
				</div>

				<div {...stylex.props(styles.formGroup)}>
					<label htmlFor="price" {...stylex.props(styles.label)}>
						가격
						<span {...stylex.props(styles.required)}>*</span>
					</label>
					<div {...stylex.props(styles.priceInputContainer)}>
						<input
							id="price"
							type="text"
							inputMode="numeric"
							placeholder="가격을 입력해주세요"
							value={price}
							onChange={handlePriceChange}
							{...stylex.props(styles.priceInput)}
						/>
						<span {...stylex.props(styles.priceSuffix)}>원</span>
					</div>
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
									condition === item.id && styles.conditionButtonActive
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
						placeholder="상품에 대한 상세 설명을 입력해주세요&#10;(포카 그룹, 멤버, 앨범명, 상태 등)"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						maxLength={2000}
						{...stylex.props(styles.textarea)}
					/>
					<div {...stylex.props(styles.charCount)}>{description.length}/2000</div>
				</div>
			</div>
		</div>
	);
}
