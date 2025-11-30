"use client";

import * as stylex from "@stylexjs/stylex";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import { api } from "@/utils/eden";

const styles = stylex.create({
	actionBar: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderTopWidth: 1,
		borderTopStyle: "solid",
		borderTopColor: colors.borderPrimary,
		backgroundColor: colors.bgPrimary,
	},
	actionButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "44px",
		height: "44px",
		color: colors.textMuted,
		backgroundColor: "transparent",
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		borderRadius: radius.sm,
		cursor: "pointer",
	},
	chatButton: {
		flex: 1,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.xxs,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.textInverse,
		backgroundColor: colors.bgInverse,
		borderWidth: 0,
		borderRadius: radius.sm,
		cursor: "pointer",
		textDecoration: "none",
	},
	chatButtonDisabled: {
		opacity: 0.6,
		cursor: "not-allowed",
	},
});

interface ActionBarProps {
	marketId: string;
	sellerId: string;
	currentUserId: string | null;
	isOwner: boolean;
}

export function ActionBar({
	marketId,
	sellerId,
	currentUserId,
	isOwner,
}: ActionBarProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const handleChatClick = async () => {
		if (!currentUserId) {
			router.push("/login");
			return;
		}

		if (isOwner) {
			// 판매자: 해당 마켓의 채팅방 목록으로 이동
			router.push(`/chat/list?marketId=${marketId}`);
			return;
		}

		// 구매자: 채팅방 생성/조회 후 이동
		setIsLoading(true);
		try {
			const { data, error } = await api.chat.rooms.market.post({
				marketId,
				sellerId,
			});

			if (error || !data) {
				console.error("Failed to create/get chat room:", error);
				return;
			}

			router.push(`/chat/${data.id}`);
		} catch (err) {
			console.error("Chat error:", err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div {...stylex.props(styles.actionBar)}>
			<button type="button" {...stylex.props(styles.actionButton)}>
				<Heart size={20} />
			</button>
			<button type="button" {...stylex.props(styles.actionButton)}>
				<Share2 size={20} />
			</button>
			<button
				type="button"
				onClick={handleChatClick}
				disabled={isLoading}
				{...stylex.props(
					styles.chatButton,
					isLoading && styles.chatButtonDisabled,
				)}
			>
				<MessageCircle size={18} />
				{isLoading ? "로딩..." : isOwner ? "채팅 목록" : "채팅하기"}
			</button>
		</div>
	);
}
