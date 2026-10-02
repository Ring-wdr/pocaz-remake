"use client";

import * as stylex from "@stylexjs/stylex";
import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
	Button,
	type Key,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
} from "react-aria-components";
import { toast } from "sonner";

import {
	colors,
	fontSize,
	radius,
	size,
	spacing,
} from "@/app/global-tokens.stylex";
import { confirmAction } from "@/components/ui";
import {
	chatRoomsQueryKey,
	marketInfoQueryOptions,
} from "@/lib/queries/markets";
import { api } from "@/utils/eden";

const styles = stylex.create({
	trigger: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: size.touchTarget,
		height: size.touchTarget,
		color: colors.textSecondary,
		backgroundColor: "transparent",
		borderWidth: 0,
		borderRadius: radius.sm,
		cursor: "pointer",
		":focus-visible": {
			outlineWidth: 2,
			outlineStyle: "solid",
			outlineColor: colors.accentPrimary,
			outlineOffset: "2px",
		},
		":disabled": {
			opacity: 0.5,
			cursor: "not-allowed",
		},
	},
	popover: {
		minWidth: 120,
		backgroundColor: colors.bgPrimary,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		borderRadius: radius.md,
		boxShadow: `0 4px 12px ${colors.shadowLight}`,
		overflow: "hidden",
		outlineWidth: 0,
	},
	menu: {
		outlineWidth: 0,
	},
	item: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		width: "100%",
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		fontSize: fontSize.md,
		color: colors.textPrimary,
		textAlign: "left",
		cursor: "pointer",
	},
	itemHighlighted: {
		backgroundColor: colors.bgSecondary,
	},
	itemDanger: {
		color: colors.statusError,
	},
	itemDangerHighlighted: {
		backgroundColor: colors.statusErrorBg,
	},
});

const DELETE_FAILED_MESSAGE =
	"상품을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.";
const HAS_TRANSACTIONS_MESSAGE =
	"거래 내역이 있는 상품은 삭제할 수 없어요. 판매완료 상태로 남겨 두세요";

/**
 * 삭제 실패 안내 문구. 서버 메시지는 영어라서 쓰지 않는다.
 * 거래 기록이 있는 상품은 거래 내역이 상품을 참조해 지울 수 없어 서버가 409를 돌려준다.
 */
function getDeleteErrorMessage(status: number): string {
	return status === 409 ? HAS_TRANSACTIONS_MESSAGE : DELETE_FAILED_MESSAGE;
}

interface MarketActionsProps {
	marketId: string;
	isOwner: boolean;
}

/**
 * 상품 상세 헤더의 더보기 메뉴(수정, 삭제). 상품 주인에게만 보인다.
 * 삭제는 확인을 받은 뒤 상품을 지우고 마켓 목록으로 돌아간다.
 */
export function MarketActions({ marketId, isOwner }: MarketActionsProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [isPending, startTransition] = useTransition();

	if (!isOwner) {
		return null;
	}

	const handleDelete = async () => {
		const confirmed = await confirmAction({
			title: "상품 삭제",
			description: "정말 삭제하시겠습니까? 채팅방과 찜도 함께 사라집니다.",
			confirmText: "삭제",
			cancelText: "취소",
		});
		if (!confirmed) return;

		startTransition(async () => {
			try {
				const { error } = await api.markets({ id: marketId }).delete();
				if (error) {
					console.error("Failed to delete market item:", error);
					toast.error(getDeleteErrorMessage(error.status));
					return;
				}
			} catch (error) {
				console.error("Failed to delete market item:", error);
				toast.error(DELETE_FAILED_MESSAGE);
				return;
			}

			toast.success("상품을 삭제했어요");
			// 채팅방도 함께 지워지므로 채팅방 목록과 상품 정보 캐시를 정리한다
			void queryClient.invalidateQueries({ queryKey: chatRoomsQueryKey });
			queryClient.removeQueries({
				queryKey: marketInfoQueryOptions(marketId).queryKey,
			});
			router.push("/market");
			router.refresh();
		});
	};

	const handleAction = (key: Key) => {
		if (key === "edit") {
			router.push(`/market/${marketId}/edit`);
			return;
		}

		if (key === "delete") {
			void handleDelete();
		}
	};

	return (
		<MenuTrigger>
			<Button
				aria-label="상품 메뉴"
				isDisabled={isPending}
				{...stylex.props(styles.trigger)}
			>
				<MoreHorizontal size={20} />
			</Button>
			<Popover placement="bottom end" {...stylex.props(styles.popover)}>
				<Menu {...stylex.props(styles.menu)} onAction={handleAction}>
					<MenuItem id="edit" textValue="수정">
						{({ isFocused, isHovered }) => (
							<div
								{...stylex.props(
									styles.item,
									(isFocused || isHovered) && styles.itemHighlighted,
								)}
							>
								<Pencil size={16} />
								수정
							</div>
						)}
					</MenuItem>
					<MenuItem id="delete" textValue="삭제" isDisabled={isPending}>
						{({ isFocused, isHovered }) => (
							<div
								{...stylex.props(
									styles.item,
									styles.itemDanger,
									(isFocused || isHovered) && styles.itemDangerHighlighted,
								)}
							>
								<Trash2 size={16} />
								삭제
							</div>
						)}
					</MenuItem>
				</Menu>
			</Popover>
		</MenuTrigger>
	);
}
