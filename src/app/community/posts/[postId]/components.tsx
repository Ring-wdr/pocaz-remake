"use client";

import * as stylex from "@stylexjs/stylex";
import { Heart, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
	Button,
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
import { confirmAction } from "@/components/confirm-modal";
import { api } from "@/utils/eden";

const styles = stylex.create({
	statItem: {
		display: "flex",
		alignItems: "center",
		gap: "4px",
		fontSize: fontSize.md,
		color: colors.textMuted,
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
		padding: 0,
	},
	statItemActive: {
		color: colors.statusErrorLight,
	},
	statItemDisabled: {
		cursor: "not-allowed",
		opacity: 0.6,
	},
	moreButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: size.touchTarget,
		height: size.touchTarget,
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
		color: colors.textPrimary,
		position: "relative",
	},
	dropdown: {
		position: "absolute",
		top: "100%",
		right: 0,
		backgroundColor: colors.bgPrimary,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		borderRadius: radius.md,
		boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
		overflow: "hidden",
		zIndex: 10,
		minWidth: 120,
	},
	dropdownItem: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		width: "100%",
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
		fontSize: fontSize.md,
		color: colors.textPrimary,
		textAlign: "left",
		outlineWidth: 0,
	},
	dropdownItemHovered: {
		backgroundColor: colors.bgSecondary,
	},
	dropdownItemFocused: {
		backgroundColor: colors.bgSecondary,
	},
	dropdownItemDanger: {
		color: colors.statusError,
	},
	dropdownItemDangerHovered: {
		backgroundColor: "rgba(220, 38, 38, 0.1)",
	},
	placeholder: {
		width: size.touchTarget,
		height: size.touchTarget,
	},
	menu: {
		outlineWidth: 0,
	},
	popover: {
		backgroundColor: colors.bgPrimary,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		borderRadius: radius.md,
		boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
		overflow: "hidden",
		minWidth: 120,
		outlineWidth: 0,
	},
	moreButtonInner: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: size.touchTarget,
		height: size.touchTarget,
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
		color: colors.textPrimary,
		outlineWidth: 0,
	},
	moreButtonFocusVisible: {
		outlineWidth: 2,
		outlineStyle: "solid",
		outlineColor: colors.accentPrimary,
		outlineOffset: "2px",
		borderRadius: radius.sm,
	},
});

interface LikeButtonProps {
	postId: string;
	initialLiked: boolean;
	initialCount: number;
	isLoggedIn: boolean;
}

export function LikeButton({
	postId,
	initialLiked,
	initialCount,
	isLoggedIn,
}: LikeButtonProps) {
	const router = useRouter();
	const [isLiked, setIsLiked] = useState(initialLiked);
	const [likeCount, setLikeCount] = useState(initialCount);
	const [isPending, startTransition] = useTransition();

	const handleLike = () => {
		if (!isLoggedIn) {
			toast.error("로그인이 필요합니다", {
				action: {
					label: "로그인",
					onClick: () => router.push("/login"),
				},
			});
			return;
		}

		startTransition(async () => {
			const previousLiked = isLiked;
			const previousCount = likeCount;

			// Optimistic update
			setIsLiked(!isLiked);
			setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

			const { data, error } = await api.likes.posts({ postId }).post();

			if (error || !data) {
				// Rollback on error
				setIsLiked(previousLiked);
				setLikeCount(previousCount);
				toast.error("좋아요 처리에 실패했습니다");
				return;
			}

			// Sync with server response
			setIsLiked(data.liked);
			setLikeCount(data.count);
			toast.success(
				data.liked ? "좋아요를 눌렀습니다" : "좋아요를 취소했습니다",
			);
		});
	};

	return (
		<button
			type="button"
			onClick={handleLike}
			disabled={isPending}
			{...stylex.props(
				styles.statItem,
				isLiked && styles.statItemActive,
				isPending && styles.statItemDisabled,
			)}
		>
			<Heart size={18} fill={isLiked ? "currentColor" : "none"} />
			<span>{likeCount}</span>
		</button>
	);
}

interface PostActionsProps {
	postId: string;
	isOwner: boolean;
}

export function PostActions({ postId, isOwner }: PostActionsProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	if (!isOwner) {
		return <div {...stylex.props(styles.placeholder)} />;
	}

	const handleAction = async (key: React.Key) => {
		if (key === "edit") {
			router.push(`/community/posts/${postId}/edit`);
			return;
		}

		if (key === "delete") {
			const confirmed = await confirmAction({
				title: "게시글 삭제",
				description: "정말 삭제하시겠습니까?",
				confirmText: "삭제",
				cancelText: "취소",
			});
			if (!confirmed) return;

			startTransition(async () => {
				const { error } = await api.posts({ id: postId }).delete();

				if (error) {
					toast.error("삭제에 실패했습니다");
					return;
				}

				toast.success("게시글이 삭제되었습니다");
				router.replace("/community");
			});
		}
	};

	return (
		<div {...stylex.props(styles.moreButton)}>
			<MenuTrigger>
				<Button aria-label="게시글 메뉴" isDisabled={isPending}>
					{({ isFocusVisible }) => (
						<span
							{...stylex.props(
								styles.moreButtonInner,
								isFocusVisible && styles.moreButtonFocusVisible,
							)}
						>
							<MoreHorizontal size={24} />
						</span>
					)}
				</Button>
				<Popover {...stylex.props(styles.popover)}>
					<Menu {...stylex.props(styles.menu)} onAction={handleAction}>
						<MenuItem id="edit" textValue="수정">
							{({ isFocused, isHovered }) => (
								<div
									{...stylex.props(
										styles.dropdownItem,
										(isFocused || isHovered) && styles.dropdownItemHovered,
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
										styles.dropdownItem,
										styles.dropdownItemDanger,
										(isFocused || isHovered) &&
											styles.dropdownItemDangerHovered,
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
		</div>
	);
}
