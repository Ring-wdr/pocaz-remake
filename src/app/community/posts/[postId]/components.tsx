"use client";

import * as stylex from "@stylexjs/stylex";
import { Heart, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
	},
	dropdownItemDanger: {
		color: colors.statusError,
	},
	placeholder: {
		width: size.touchTarget,
		height: size.touchTarget,
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
			toast.success(data.liked ? "좋아요를 눌렀습니다" : "좋아요를 취소했습니다");
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
	const [isOpen, setIsOpen] = useState(false);
	const [isPending, startTransition] = useTransition();

	if (!isOwner) {
		return <div {...stylex.props(styles.placeholder)} />;
	}

	const handleEdit = () => {
		setIsOpen(false);
		router.push(`/community/posts/${postId}/edit`);
	};

	const handleDelete = () => {
		if (!confirm("정말 삭제하시겠습니까?")) {
			setIsOpen(false);
			return;
		}

		startTransition(async () => {
			const { error } = await api.posts({ id: postId }).delete();

			if (error) {
				toast.error("삭제에 실패했습니다");
				return;
			}

			toast.success("게시글이 삭제되었습니다");
			router.replace("/community");
		});
	};

	return (
		<div {...stylex.props(styles.moreButton)}>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				disabled={isPending}
				{...stylex.props(styles.moreButton)}
			>
				<MoreHorizontal size={24} />
			</button>
			{isOpen && (
				<div {...stylex.props(styles.dropdown)}>
					<button
						type="button"
						onClick={handleEdit}
						{...stylex.props(styles.dropdownItem)}
					>
						<Pencil size={16} />
						수정
					</button>
					<button
						type="button"
						onClick={handleDelete}
						disabled={isPending}
						{...stylex.props(styles.dropdownItem, styles.dropdownItemDanger)}
					>
						<Trash2 size={16} />
						삭제
					</button>
				</div>
			)}
		</div>
	);
}
