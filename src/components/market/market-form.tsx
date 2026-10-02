"use client";

import * as stylex from "@stylexjs/stylex";
import { ArrowLeft, Camera, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
	type ChangeEvent,
	useEffect,
	useRef,
	useState,
	useTransition,
} from "react";
import { toast } from "sonner";

import {
	colors,
	fontSize,
	fontWeight,
	iconSize,
	lineHeight,
	radius,
	size,
	spacing,
} from "@/app/global-tokens.stylex";
import { marketConditionOptions } from "@/components/market/market-condition";
import { Button, Input } from "@/components/ui";
import type { ArtistCatalogGroup, MarketCondition } from "@/types/entities";

const MAX_IMAGE_COUNT = 10;
const MAX_FILE_SIZE_MB = 20;

/** 폼이 채우고 돌려주는 상품 정보 */
export interface MarketFormValues {
	title: string;
	description: string;
	/** 원 단위 가격. 가격을 비워 두었으면(가격협의) null */
	price: number | null;
	/** 아직 고르지 않았으면 null. 저장하려면 하나를 골라야 한다 */
	condition: MarketCondition | null;
	isNegotiable: boolean;
	/** 태그한 그룹. 태그하지 않았으면 null */
	groupId: string | null;
	/** 태그한 멤버. 그룹만 태그했거나 태그하지 않았으면 null */
	artistId: string | null;
}

/** 이미 올라가 있는 상품 이미지 */
export interface ExistingMarketImage {
	id: string;
	imageUrl: string;
}

/** 검증을 통과해 저장을 맡길 때 넘기는 값 */
export interface MarketFormSubmitValues
	extends Omit<MarketFormValues, "condition"> {
	condition: MarketCondition;
	/** 새로 고른 이미지 파일. 고른 순서 그대로이고 기존 이미지 뒤에 붙는다 */
	newFiles: File[];
	/** 삭제하기로 표시한 기존 이미지의 id */
	removedImageIds: string[];
}

export interface MarketFormProps {
	mode: "create" | "edit";
	/** 폼을 처음 채울 값. 마운트할 때 한 번만 읽는다. 등록에서는 생략하면 빈 폼이다 */
	initialValues?: MarketFormValues;
	/** 수정할 상품에 이미 올라가 있는 이미지. 등록에서는 생략한다 */
	existingImages?: ExistingMarketImage[];
	/** 아티스트 태그로 고를 수 있는 그룹과 그 멤버. 비어 있으면(카탈로그가 없거나 불러오지 못함) 아티스트 영역을 그리지 않는다 */
	groups?: ArtistCatalogGroup[];
	/**
	 * 저장을 맡는 함수. 업로드·API 호출·이동은 호출하는 쪽이 하고, 실패하면 토스트로 알린 뒤 돌아오면 된다.
	 * 끝날 때까지 저장 버튼은 잠기고 스피너가 돈다.
	 */
	onSubmit: (values: MarketFormSubmitValues) => Promise<void>;
}

const emptyValues: MarketFormValues = {
	title: "",
	description: "",
	price: null,
	condition: null,
	isNegotiable: false,
	groupId: null,
	artistId: null,
};

/** 새로 고른 이미지 파일과 그 미리보기 */
type SelectedImage = {
	file: File;
	preview: string;
};

/** 가격 입력칸에 보여 줄 문자열. 천 단위로 쉼표를 찍고, 값이 없으면 빈 칸 */
function formatPriceInput(value: number | null): string {
	return value === null ? "" : value.toLocaleString("ko-KR");
}

const copyByMode = {
	create: { title: "상품 등록", submit: "등록하기" },
	edit: { title: "상품 수정", submit: "저장하기" },
} as const;

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
		width: size.touchTarget,
		height: size.touchTarget,
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
		fontSize: fontSize.xl,
		color: colors.textPrimary,
	},
	headerTitle: {
		fontSize: fontSize.lg,
		fontWeight: fontWeight.bold,
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
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
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
		width: size.thumbnail,
		height: size.thumbnail,
		backgroundColor: colors.bgSecondary,
		borderWidth: 2,
		borderStyle: "dashed",
		borderColor: colors.borderPrimary,
		borderRadius: radius.md,
		cursor: "pointer",
		flexShrink: 0,
		transition: "border-color 0.2s ease",
	},
	uploadIcon: {
		fontSize: iconSize.xl,
		color: colors.textPlaceholder,
		marginBottom: "4px",
	},
	uploadText: {
		fontSize: fontSize.sm,
		color: colors.textPlaceholder,
	},
	imagePreviewContainer: {
		position: "relative",
		width: size.thumbnail,
		height: size.thumbnail,
		flexShrink: 0,
	},
	imagePreview: {
		width: "100%",
		height: "100%",
		objectFit: "cover",
		borderRadius: radius.md,
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
		fontSize: fontSize.xs,
		fontWeight: fontWeight.semibold,
		borderRadius: radius.xs,
	},
	removeImageButton: {
		position: "absolute",
		top: "-8px",
		right: "-8px",
		width: size.iconButton,
		height: size.iconButton,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.bgInverse,
		color: colors.textInverse,
		borderWidth: 0,
		borderRadius: radius.full,
		cursor: "pointer",
		fontSize: fontSize.md,
	},
	hiddenInput: {
		display: "none",
	},
	priceSuffix: {
		position: "absolute",
		right: "16px",
		top: "50%",
		transform: "translateY(-50%)",
		fontSize: fontSize.base,
		fontWeight: fontWeight.medium,
		color: colors.textMuted,
	},
	// 그룹을 고르면 멤버 select가 그 아래에 나타난다
	artistSelects: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xs,
	},
	select: {
		width: "100%",
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		fontSize: fontSize.md,
		color: colors.textPrimary,
		backgroundColor: colors.bgPrimary,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		borderRadius: radius.sm,
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
		borderRadius: radius.lg,
		fontSize: fontSize.md,
		fontWeight: fontWeight.medium,
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
		fontSize: fontSize.base,
		lineHeight: lineHeight.relaxed,
		color: colors.textPrimary,
		backgroundColor: colors.bgSecondary,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		borderRadius: radius.md,
		outline: "none",
		resize: "vertical",
		fontFamily: "inherit",
		transition: "border-color 0.2s ease",
		"::placeholder": {
			color: colors.textPlaceholder,
		},
	},
	charCount: {
		fontSize: fontSize.sm,
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
		fontSize: fontSize.md,
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

interface ImagePreviewProps {
	src: string;
	/** 기존·새 이미지를 이어 붙인 목록에서의 위치. 0번이 대표 이미지다 */
	index: number;
	onRemove: () => void;
}

function ImagePreview({ src, index, onRemove }: ImagePreviewProps) {
	return (
		<div {...stylex.props(styles.imagePreviewContainer)}>
			<img
				src={src}
				alt={`상품 이미지 ${index + 1}`}
				{...stylex.props(styles.imagePreview)}
			/>
			{index === 0 && (
				<span {...stylex.props(styles.mainImageBadge)}>대표</span>
			)}
			<button
				aria-label="이미지 삭제"
				type="button"
				onClick={onRemove}
				{...stylex.props(styles.removeImageButton)}
			>
				<X size={14} />
			</button>
		</div>
	);
}

/**
 * 상품 등록·수정이 함께 쓰는 폼. 헤더, 이미지·상품명·가격·상태·설명 입력, 하단 고정 저장 버튼과 검증을 담고 있다.
 * 저장 과정(업로드, API 호출, 화면 이동)은 `onSubmit`을 넘겨 받은 쪽이 맡는다.
 *
 * 이미지는 "기존 이미지"(수정 모드에서 삭제 표시만 할 수 있다)와 "새 파일"(미리보기)로 나눠 들고 있다.
 * 둘을 이어 붙인 목록의 첫 이미지가 대표이고, 남은 이미지가 한 장도 없으면 저장할 수 없다.
 */
export function MarketForm({
	mode,
	initialValues = emptyValues,
	existingImages = [],
	groups = [],
	onSubmit,
}: MarketFormProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [newImages, setNewImages] = useState<SelectedImage[]>([]);
	const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
	const [title, setTitle] = useState(initialValues.title);
	const [price, setPrice] = useState(formatPriceInput(initialValues.price));
	const [condition, setCondition] = useState<MarketCondition | null>(
		initialValues.condition,
	);
	const [description, setDescription] = useState(initialValues.description);
	const [isNegotiable, setIsNegotiable] = useState(initialValues.isNegotiable);
	const [groupId, setGroupId] = useState(initialValues.groupId);
	const [artistId, setArtistId] = useState(() => {
		// 카탈로그가 바뀌어 멤버가 그 그룹 소속이 아니게 된 옛 태그는 고를 수 없는 값이라 비우고 시작한다.
		// 그룹을 목록에서 찾을 수 없으면(카탈로그를 불러오지 못함) 저장된 태그를 그대로 둔다
		const group = groups.find((item) => item.id === initialValues.groupId);
		const isStale =
			group !== undefined &&
			!group.artists.some((artist) => artist.id === initialValues.artistId);
		return isStale ? null : initialValues.artistId;
	});
	// 미리보기용 object URL. 지울 때 바로 해제하고, 남은 것은 폼이 사라질 때 한꺼번에 해제한다
	const previewUrls = useRef(new Set<string>());

	useEffect(() => {
		const urls = previewUrls.current;
		return () => {
			for (const url of urls) {
				URL.revokeObjectURL(url);
			}
			urls.clear();
		};
	}, []);

	const copy = copyByMode[mode];
	// 삭제 표시한 기존 이미지는 목록에서 빠지고, 대표 뱃지는 남은 첫 이미지로 옮겨 간다
	const keptImages = existingImages.filter(
		(image) => !removedImageIds.includes(image.id),
	);
	const imageCount = keptImages.length + newImages.length;
	const selectedGroup = groups.find((group) => group.id === groupId) ?? null;

	const hasImages = imageCount > 0;
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
	const isDisabled = !isFormValid || isPending;

	const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files) return;

		const remainingSlots = MAX_IMAGE_COUNT - imageCount;
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

			const preview = URL.createObjectURL(file);
			previewUrls.current.add(preview);
			validImages.push({ file, preview });
		});

		if (errors.length > 0) {
			toast.error(errors[0]);
		}

		if (validImages.length > 0) {
			setNewImages((prev) => [...prev, ...validImages]);
		}

		event.target.value = "";
	};

	const handleRemoveExistingImage = (imageId: string) => {
		setRemovedImageIds((prev) => [...prev, imageId]);
	};

	const handleRemoveNewImage = (index: number) => {
		const target = newImages[index];
		if (target) {
			URL.revokeObjectURL(target.preview);
			previewUrls.current.delete(target.preview);
		}
		setNewImages((prev) => prev.filter((_, i) => i !== index));
	};

	const handleGroupChange = (nextGroupId: string) => {
		setGroupId(nextGroupId === "" ? null : nextGroupId);
		// 멤버는 그룹에 딸려 있으므로 그룹을 바꾸면 멤버 선택은 풀린다
		setArtistId(null);
	};

	const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/[^0-9]/g, "");
		if (value === "") {
			setPrice("");
			return;
		}
		setPrice(formatPriceInput(Number.parseInt(value, 10)));
	};

	const handleSubmit = () => {
		if (isDisabled || condition === null) return;

		const values: MarketFormSubmitValues = {
			title: title.trim(),
			description: description.trim(),
			price: hasPrice ? Number.parseInt(price.replace(/,/g, ""), 10) : null,
			condition,
			isNegotiable,
			groupId,
			artistId,
			newFiles: newImages.map((image) => image.file),
			removedImageIds,
		};

		startTransition(async () => {
			try {
				await onSubmit(values);
			} catch (error) {
				// 호출한 쪽이 실패를 알리지 못한 경우에도 입력한 내용은 지우지 않는다
				console.error("Market form submit failed", error);
				toast.error("처리 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.");
			}
		});
	};

	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<button
					aria-label="뒤로 가기"
					type="button"
					onClick={() => router.back()}
					{...stylex.props(styles.backButton)}
				>
					<ArrowLeft size={24} />
				</button>
				<h1 {...stylex.props(styles.headerTitle)}>{copy.title}</h1>
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
								{imageCount}/{MAX_IMAGE_COUNT}
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
						{keptImages.map((image, index) => (
							<ImagePreview
								key={image.id}
								src={image.imageUrl}
								index={index}
								onRemove={() => handleRemoveExistingImage(image.id)}
							/>
						))}
						{newImages.map((image, index) => (
							<ImagePreview
								key={image.preview}
								src={image.preview}
								index={keptImages.length + index}
								onRemove={() => handleRemoveNewImage(index)}
							/>
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

				{groups.length > 0 && (
					<fieldset {...stylex.props(styles.fieldset)}>
						<legend {...stylex.props(styles.label)}>아티스트(선택)</legend>
						<div {...stylex.props(styles.artistSelects)}>
							<select
								aria-label="그룹"
								value={groupId ?? ""}
								onChange={(e) => handleGroupChange(e.target.value)}
								{...stylex.props(styles.select)}
							>
								<option value="">선택 안 함</option>
								{groups.map((group) => (
									<option key={group.id} value={group.id}>
										{group.name}
									</option>
								))}
							</select>
							{selectedGroup && (
								<select
									aria-label="멤버"
									value={artistId ?? ""}
									onChange={(e) => setArtistId(e.target.value || null)}
									{...stylex.props(styles.select)}
								>
									<option value="">그룹 전체</option>
									{selectedGroup.artists.map((artist) => (
										<option key={artist.id} value={artist.id}>
											{artist.name}
										</option>
									))}
								</select>
							)}
						</div>
					</fieldset>
				)}

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
						{marketConditionOptions.map((item) => (
							<button
								key={item.id}
								type="button"
								aria-pressed={condition === item.id}
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
					aria-label={copy.submit}
					aria-busy={isPending}
					fullWidth
				>
					{isPending ? (
						<Loader2 size={20} {...stylex.props(styles.spinner)} />
					) : (
						copy.submit
					)}
				</Button>
			</div>
		</div>
	);
}
