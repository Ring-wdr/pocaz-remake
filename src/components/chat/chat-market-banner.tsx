"use client";

import * as stylex from "@stylexjs/stylex";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	size,
	spacing,
} from "@/app/global-tokens.stylex";
import { getMarketStatusLabel } from "@/components/market/market-status";
import { openReviewSheet } from "@/components/review/open-review-sheet";
import { Button, confirmAction } from "@/components/ui";
import {
	chatRoomsQueryKey,
	marketInfoQueryOptions,
} from "@/lib/queries/markets";
import type {
	ChatMarketInfo,
	ChatMarketTransaction,
	ChatMember,
} from "@/types/entities";
import { api } from "@/utils/eden";

const styles = stylex.create({
	banner: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxs,
		paddingTop: spacing.xxs,
		paddingBottom: spacing.xxs,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		backgroundColor: colors.bgPrimary,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
	},
	// 상품 상세로 가는 링크. 버튼은 중첩된 인터랙티브 요소가 되지 않도록 링크 밖 형제 요소에 둔다
	link: {
		flex: 1,
		minWidth: 0,
		display: "flex",
		alignItems: "center",
		gap: spacing.xxs,
		textDecoration: "none",
		color: "inherit",
	},
	image: {
		flexShrink: 0,
		width: size.touchTarget,
		height: size.touchTarget,
		borderRadius: radius.sm,
		objectFit: "cover",
		backgroundColor: colors.bgTertiary,
	},
	info: {
		flex: 1,
		minWidth: 0,
	},
	title: {
		fontSize: fontSize.sm,
		fontWeight: fontWeight.medium,
		color: colors.textSecondary,
		margin: 0,
		marginBottom: spacing.xxxs,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	price: {
		fontSize: fontSize.md,
		fontWeight: fontWeight.bold,
		color: colors.textPrimary,
		margin: 0,
	},
	status: {
		flexShrink: 0,
		whiteSpace: "nowrap",
		fontSize: fontSize.sm,
		fontWeight: fontWeight.semibold,
		color: colors.accentPrimary,
		backgroundColor: colors.accentPrimaryBg,
		paddingTop: spacing.xxxs,
		paddingBottom: spacing.xxxs,
		paddingLeft: spacing.xxs,
		paddingRight: spacing.xxs,
		borderRadius: radius.xs,
	},
	statusCompleted: {
		color: colors.statusSuccess,
		backgroundColor: colors.statusSuccessBg,
	},
	// 링크 오른쪽 자리. 거래 완료·후기 남기기 버튼이 들어간다
	action: {
		flexShrink: 0,
	},
	reviewDone: {
		whiteSpace: "nowrap",
		fontSize: fontSize.sm,
		color: colors.textMuted,
	},
});

const COMPLETE_TRADE_FAILED_MESSAGE =
	"거래 완료에 실패했습니다. 잠시 후 다시 시도해 주세요";

/** 거래 완료 API 실패 상태 코드별 안내 문구. 서버 메시지는 영어라서 쓰지 않는다 */
function getCompleteTradeErrorMessage(status: number): string {
	switch (status) {
		case 409:
			return "이미 거래가 완료된 상품이에요";
		case 400:
			return "거래를 완료할 수 없어요. 상대가 이 상품 채팅방의 참여자인지 확인해 주세요";
		default:
			return COMPLETE_TRADE_FAILED_MESSAGE;
	}
}

/** 완료된 거래에서 내 거래 상대의 id. 내가 구매자가 아니면 구매자가 상대다 */
function getCounterpartId(
	transaction: ChatMarketTransaction,
	currentUserId: string,
): string {
	return transaction.buyerId === currentUserId
		? transaction.sellerId
		: transaction.buyerId;
}

interface ChatMarketBannerProps {
	market: ChatMarketInfo;
	currentUserId: string;
	/** 거래 상대(나를 뺀 다른 멤버). 상대가 방을 나갔다면 null */
	partner: Pick<ChatMember, "id" | "nickname"> | null;
}

/**
 * 채팅방 상단의 상품 배너.
 * 상품 주인에게는 상대를 구매자로 정해 거래를 완료하는 버튼을 보여 주고,
 * 거래가 완료된 상품에는 상태 라벨 대신 "거래 완료" 뱃지를 보여 준다.
 * 완료된 거래의 구매자와 판매자에게는 후기를 남기는 버튼을, 이미 남겼다면 "후기 작성 완료"를 보여 준다.
 */
export function ChatMarketBanner({
	market,
	currentUserId,
	partner,
}: ChatMarketBannerProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [isPending, startTransition] = useTransition();
	// router.refresh()로 거래가 담긴 market이 내려오기 전에 버튼이 다시 눌리지 않도록 완료 직후를 기억한다
	const [completedLocally, setCompletedLocally] = useState(false);

	// router.refresh()로 myReviewed가 바뀐 market이 내려오기 전에 버튼이 다시 눌리지 않도록 방금 남긴 후기를 기억한다
	const [reviewedLocally, setReviewedLocally] = useState(false);

	const transaction = market.transaction;
	const isTradeCompleted = transaction !== null || completedLocally;
	const canCompleteTrade =
		market.userId === currentUserId &&
		partner !== null &&
		!isTradeCompleted &&
		market.status !== "sold";

	// 같은 상품의 다른 채팅방(거래하지 않은 사람과의 방)에서도 완료된 거래가 내려오므로, 당사자인지 확인한다
	const isTradeParty =
		transaction !== null &&
		(transaction.buyerId === currentUserId ||
			transaction.sellerId === currentUserId);
	const hasReviewed = transaction?.myReviewed === true || reviewedLocally;
	// 후기는 거래 상대가 받는다. 이 방의 상대가 거래 상대일 때만 안내 문구에 이름을 쓴다
	const counterpartNickname =
		transaction !== null &&
		partner?.id === getCounterpartId(transaction, currentUserId)
			? partner.nickname
			: undefined;

	/** 서버에서 내려오는 상품·거래 정보와 채팅방 목록, 상품 정보 캐시를 새로 받는다 */
	const refreshTradeData = () => {
		router.refresh();
		void queryClient.invalidateQueries({ queryKey: chatRoomsQueryKey });
		void queryClient.invalidateQueries({
			queryKey: marketInfoQueryOptions(market.id).queryKey,
		});
	};

	const handleCompleteTrade = async () => {
		if (!partner || isPending) return;

		const confirmed = await confirmAction({
			title: "거래 완료",
			description: `${partner.nickname}님과 거래를 완료할까요? 상품이 판매완료로 바뀌고 양쪽 거래 내역에 남아요.`,
			confirmText: "거래 완료",
			cancelText: "취소",
		});
		if (!confirmed) return;

		startTransition(async () => {
			try {
				const { error } = await api
					.markets({ id: market.id })
					.complete.post({ buyerId: partner.id });

				if (error) {
					toast.error(getCompleteTradeErrorMessage(error.status));
					// 다른 곳에서 이미 완료한 거래라면 화면도 서버 상태에 맞춘다
					if (error.status === 409) {
						refreshTradeData();
					}
					return;
				}

				setCompletedLocally(true);
				toast.success("거래를 완료했어요. 거래 내역에서 확인할 수 있어요.");
				refreshTradeData();
			} catch (err) {
				console.error("Complete trade error:", err);
				toast.error(COMPLETE_TRADE_FAILED_MESSAGE);
			}
		});
	};

	const handleWriteReview = async () => {
		if (transaction === null) return;

		const reviewed = await openReviewSheet({
			transactionId: transaction.id,
			partnerNickname: counterpartNickname,
		});
		if (!reviewed) return;

		setReviewedLocally(true);
		router.refresh();
	};

	return (
		<div {...stylex.props(styles.banner)}>
			<Link href={`/market/${market.id}`} {...stylex.props(styles.link)}>
				{market.thumbnail && (
					<img
						src={market.thumbnail}
						alt={market.title}
						{...stylex.props(styles.image)}
					/>
				)}
				<div {...stylex.props(styles.info)}>
					<p {...stylex.props(styles.title)}>{market.title}</p>
					<p {...stylex.props(styles.price)}>
						{market.price ? `${market.price.toLocaleString()}원` : "가격협의"}
					</p>
				</div>
				{isTradeCompleted ? (
					<span {...stylex.props(styles.status, styles.statusCompleted)}>
						거래 완료
					</span>
				) : (
					<span {...stylex.props(styles.status)}>
						{getMarketStatusLabel(market.status)}
					</span>
				)}
			</Link>
			{canCompleteTrade && (
				<div {...stylex.props(styles.action)}>
					<Button
						type="button"
						size="sm"
						disabled={isPending}
						onClick={handleCompleteTrade}
					>
						거래 완료
					</Button>
				</div>
			)}
			{isTradeParty && (
				<div {...stylex.props(styles.action)}>
					{hasReviewed ? (
						<span {...stylex.props(styles.reviewDone)}>후기 작성 완료</span>
					) : (
						<Button type="button" size="sm" onClick={handleWriteReview}>
							후기 남기기
						</Button>
					)}
				</div>
			)}
		</div>
	);
}
