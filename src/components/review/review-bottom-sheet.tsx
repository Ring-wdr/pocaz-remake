"use client";

import * as stylex from "@stylexjs/stylex";
import { Star } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
	colors,
	fontSize,
	fontWeight,
	lineHeight,
	radius,
	size,
	spacing,
} from "@/app/global-tokens.stylex";
import { BottomSheet, Button } from "@/components/ui";
import { api } from "@/utils/eden";

// 서버(POST /api/transactions/:id/reviews)가 받는 길이와 같은 값
const CONTENT_MAX_LENGTH = 300;

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

/** 고른 별점(1~5)에 붙는 한마디. 인덱스는 별점 - 1 */
const RATING_HINTS = [
	"별로예요",
	"아쉬워요",
	"보통이에요",
	"좋아요",
	"최고예요",
] as const;

const REVIEW_FAILED_MESSAGE =
	"후기를 남기지 못했어요. 잠시 후 다시 시도해 주세요";

/** 후기 API 실패 상태 코드별 안내 문구. 서버 메시지는 영어라서 쓰지 않는다 */
function getReviewErrorMessage(status: number): string {
	switch (status) {
		case 409:
			return "이미 후기를 남긴 거래예요";
		case 403:
			return "이 거래의 후기는 남길 수 없어요";
		case 404:
			return "거래를 찾을 수 없어요";
		default:
			return REVIEW_FAILED_MESSAGE;
	}
}

const styles = stylex.create({
	body: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.sm,
	},
	guide: {
		margin: 0,
		fontSize: fontSize.md,
		lineHeight: lineHeight.normal,
		color: colors.textTertiary,
		textAlign: "center",
	},
	rating: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: spacing.xxs,
	},
	// fieldset의 기본 테두리·여백을 없앤 별 버튼 묶음
	stars: {
		display: "flex",
		justifyContent: "center",
		gap: spacing.xxs,
		minWidth: 0,
		margin: 0,
		padding: 0,
		borderWidth: 0,
	},
	srOnly: {
		position: "absolute",
		width: "1px",
		height: "1px",
		padding: 0,
		margin: "-1px",
		overflow: "hidden",
		clip: "rect(0, 0, 0, 0)",
		whiteSpace: "nowrap",
		borderWidth: 0,
	},
	starButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: size.touchTarget,
		height: size.touchTarget,
		padding: 0,
		backgroundColor: "transparent",
		borderWidth: 0,
		borderRadius: radius.sm,
		color: colors.textPlaceholder,
		cursor: "pointer",
		":focus-visible": {
			outlineWidth: 2,
			outlineStyle: "solid",
			outlineColor: colors.accentPrimary,
			outlineOffset: 2,
		},
		":disabled": {
			cursor: "not-allowed",
			opacity: 0.5,
		},
	},
	starActive: {
		color: colors.statusWarning,
	},
	ratingHint: {
		margin: 0,
		fontSize: fontSize.md,
		fontWeight: fontWeight.medium,
		color: colors.textMuted,
	},
	field: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xxs,
	},
	textarea: {
		width: "100%",
		boxSizing: "border-box",
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		// 16px 미만이면 iOS가 입력창에 포커스할 때 화면을 확대한다
		fontSize: fontSize.base,
		lineHeight: lineHeight.relaxed,
		fontFamily: "inherit",
		color: colors.textPrimary,
		backgroundColor: colors.bgSecondary,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		borderRadius: radius.sm,
		resize: "none",
		"::placeholder": {
			color: colors.textPlaceholder,
		},
		":focus": {
			outlineWidth: 0,
			borderColor: colors.accentPrimary,
		},
	},
	counter: {
		margin: 0,
		fontSize: fontSize.sm,
		color: colors.textMuted,
		textAlign: "right",
	},
});

export interface ReviewBottomSheetProps {
	isOpen: boolean;
	onClose: () => void;
	/** 후기를 남길 거래의 id */
	transactionId: string;
	/** 후기를 받는 거래 상대의 닉네임. 안내 문구에 쓰고, 모르면 생략한다 */
	partnerNickname?: string;
	/**
	 * 이 거래에 내 후기가 남은 상태가 되면 호출한다. 방금 남긴 경우와 이미 남겨 둔 거래(409)가 모두 해당한다.
	 * 이때 시트를 닫는 일은 호출한 쪽이 한다.
	 */
	onReviewed?: () => void;
}

/**
 * 거래 후기 작성 바텀시트. 별점(필수)과 짧은 내용(선택)을 받아 후기를 남긴다.
 * 성공과 실패 안내 토스트까지 이 컴포넌트가 띄우고, 화면 갱신은 onReviewed를 받은 쪽이 한다.
 */
export function ReviewBottomSheet({
	isOpen,
	onClose,
	transactionId,
	partnerNickname,
	onReviewed,
}: ReviewBottomSheetProps) {
	const [rating, setRating] = useState(0);
	const [content, setContent] = useState("");
	const [isPending, startTransition] = useTransition();

	const hasDraft = rating > 0 || content.length > 0;

	// 요청이 가는 동안에는 닫지 않는다. 닫아도 요청은 끝까지 가므로, 결과를 모른 채 시트만 사라지게 된다
	const handleClose = () => {
		if (!isPending) onClose();
	};

	const handleSubmit = () => {
		if (rating === 0 || isPending) return;

		startTransition(async () => {
			try {
				const { error } = await api
					.transactions({ id: transactionId })
					.reviews.post({
						rating,
						content: content.trim() || undefined,
					});

				if (error) {
					toast.error(getReviewErrorMessage(error.status));
					// 이미 후기를 남긴 거래라면 화면도 서버 상태에 맞춘다
					if (error.status === 409) {
						onReviewed?.();
					}
					return;
				}

				toast.success("후기를 남겼어요");
				onReviewed?.();
			} catch (err) {
				console.error("Create review error:", err);
				toast.error(REVIEW_FAILED_MESSAGE);
			}
		});
	};

	return (
		<BottomSheet
			isOpen={isOpen}
			onClose={handleClose}
			title="거래 후기"
			size="sm"
			showCloseButton
			// 쓰던 내용이 있으면 바깥을 잘못 눌러도 사라지지 않게 한다
			closeOnOverlayClick={!isPending && !hasDraft}
			closeOnEscape={!isPending}
			footer={
				<Button
					type="button"
					fullWidth
					disabled={rating === 0 || isPending}
					onClick={handleSubmit}
				>
					{isPending ? "등록 중..." : "등록하기"}
				</Button>
			}
		>
			<div {...stylex.props(styles.body)}>
				<p {...stylex.props(styles.guide)}>
					{partnerNickname
						? `${partnerNickname}님과의 거래는 어떠셨나요?`
						: "거래는 어떠셨나요?"}
				</p>

				<div {...stylex.props(styles.rating)}>
					<fieldset {...stylex.props(styles.stars)}>
						<legend {...stylex.props(styles.srOnly)}>별점</legend>
						{STAR_VALUES.map((value) => (
							<button
								key={value}
								type="button"
								aria-label={`별 ${value}개`}
								aria-pressed={rating === value}
								disabled={isPending}
								onClick={() => setRating(value)}
								{...stylex.props(
									styles.starButton,
									value <= rating && styles.starActive,
								)}
							>
								<Star
									size={32}
									fill={value <= rating ? "currentColor" : "none"}
									aria-hidden="true"
								/>
							</button>
						))}
					</fieldset>
					<p {...stylex.props(styles.ratingHint)}>
						{rating > 0 ? RATING_HINTS[rating - 1] : "별점을 선택해 주세요"}
					</p>
				</div>

				<div {...stylex.props(styles.field)}>
					<textarea
						aria-label="후기 내용"
						placeholder="상대에게 남기고 싶은 말을 적어 주세요 (선택)"
						rows={4}
						maxLength={CONTENT_MAX_LENGTH}
						value={content}
						readOnly={isPending}
						onChange={(event) => setContent(event.target.value)}
						{...stylex.props(styles.textarea)}
					/>
					<p {...stylex.props(styles.counter)}>
						{content.length}/{CONTENT_MAX_LENGTH}
					</p>
				</div>
			</div>
		</BottomSheet>
	);
}
