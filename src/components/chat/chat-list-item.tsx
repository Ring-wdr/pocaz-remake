"use client";

import * as stylex from "@stylexjs/stylex";
import dayjs from "dayjs";
import { Loader2, ShoppingBag, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import type { ChatRoomListItem } from "@/types/entities";

const spinKeyframes = stylex.keyframes({
	"0%": { transform: "rotate(0deg)" },
	"100%": { transform: "rotate(360deg)" },
});

const styles = stylex.create({
	item: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderSecondary,
		textDecoration: "none",
		color: "inherit",
		cursor: "pointer",
		backgroundColor: "transparent",
		borderTopWidth: 0,
		borderLeftWidth: 0,
		borderRightWidth: 0,
		width: "100%",
		textAlign: "left",
	},
	itemLoading: {
		opacity: 0.7,
		cursor: "default",
	},
	avatar: {
		position: "relative",
		width: "52px",
		height: "52px",
		flexShrink: 0,
	},
	avatarImage: {
		width: "100%",
		height: "100%",
		borderRadius: "26px",
		objectFit: "cover",
		backgroundColor: colors.bgTertiary,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	tradingBadge: {
		position: "absolute",
		bottom: "-2px",
		right: "-2px",
		width: "20px",
		height: "20px",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.accentPrimary,
		borderRadius: radius.full,
		borderWidth: 2,
		borderStyle: "solid",
		borderColor: colors.bgPrimary,
	},
	content: {
		flex: 1,
		minWidth: 0,
	},
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: spacing.xxxs,
	},
	nameWrap: {
		display: "flex",
		alignItems: "center",
		gap: "6px",
	},
	name: {
		fontSize: "15px",
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
		margin: 0,
	},
	memberCount: {
		fontSize: "11px",
		color: colors.textMuted,
		backgroundColor: colors.bgTertiary,
		paddingTop: "2px",
		paddingBottom: "2px",
		paddingLeft: "6px",
		paddingRight: "6px",
		borderRadius: radius.xs,
	},
	time: {
		fontSize: fontSize.sm,
		color: colors.textPlaceholder,
	},
	messageWrap: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxs,
	},
	message: {
		flex: 1,
		fontSize: fontSize.md,
		color: colors.textMuted,
		margin: 0,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	loadingOverlay: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "24px",
		height: "24px",
		flexShrink: 0,
	},
	spinner: {
		animationName: spinKeyframes,
		animationDuration: "1s",
		animationIterationCount: "infinite",
		animationTimingFunction: "linear",
		color: colors.accentPrimary,
	},
});

function formatTime(dateStr: string): string {
	const date = dayjs(dateStr);
	const now = dayjs();

	if (date.isSame(now, "day")) {
		return date.format("HH:mm");
	}
	if (date.isSame(now.subtract(1, "day"), "day")) {
		return "어제";
	}
	if (date.isSame(now, "year")) {
		return date.format("MM.DD");
	}
	return date.format("YY.MM.DD");
}

interface ChatListItemProps {
	room: ChatRoomListItem;
}

export function ChatListItem({ room }: ChatListItemProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [isNavigating, setIsNavigating] = useState(false);

	const displayMember = room.members[0];
	const roomName = room.name || displayMember?.nickname || "채팅방";
	const isTrading = !!room.market;
	const isLoading = isPending || isNavigating;

	const formatLastMessage = (content: string | null | undefined) => {
		if (!content) return "대화를 시작해보세요";
		if (content.startsWith("image:")) return "[사진]";
		return content;
	};

	const handleClick = () => {
		if (isLoading) return;
		setIsNavigating(true);
		startTransition(() => {
			router.push(`/chat/${room.id}`);
		});
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={isLoading}
			{...stylex.props(styles.item, isLoading && styles.itemLoading)}
		>
			<div {...stylex.props(styles.avatar)}>
				{displayMember?.profileImage ? (
					<img
						src={displayMember.profileImage}
						alt={roomName}
						{...stylex.props(styles.avatarImage)}
					/>
				) : (
					<div {...stylex.props(styles.avatarImage)}>
						<User size={24} />
					</div>
				)}
				{isTrading && (
					<div {...stylex.props(styles.tradingBadge)}>
						<ShoppingBag size={10} color="white" />
					</div>
				)}
			</div>
			<div {...stylex.props(styles.content)}>
				<div {...stylex.props(styles.header)}>
					<div {...stylex.props(styles.nameWrap)}>
						<h3 {...stylex.props(styles.name)}>{roomName}</h3>
						{room.members.length > 2 && (
							<span {...stylex.props(styles.memberCount)}>
								{room.members.length}명
							</span>
						)}
					</div>
					{room.lastMessage && (
						<span {...stylex.props(styles.time)}>
							{formatTime(room.lastMessage.createdAt)}
						</span>
					)}
				</div>
				<div {...stylex.props(styles.messageWrap)}>
					<p {...stylex.props(styles.message)}>
						{formatLastMessage(room.lastMessage?.content)}
					</p>
				</div>
			</div>
			{isLoading && (
				<div {...stylex.props(styles.loadingOverlay)}>
					<Loader2 size={20} {...stylex.props(styles.spinner)} />
				</div>
			)}
		</button>
	);
}
