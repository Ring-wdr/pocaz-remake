import * as stylex from "@stylexjs/stylex";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import { MessageCircleHeart, User } from "lucide-react";
import Link from "next/link";
import { colors, fontSize, fontWeight, radius, spacing } from "@/app/global-tokens.stylex";
import { api } from "@/utils/eden";

dayjs.extend(relativeTime);
dayjs.locale("ko");

const styles = stylex.create({
	container: {},
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
	emptyState: {
		textAlign: "center",
		paddingTop: spacing.xxl,
		paddingBottom: spacing.xxl,
		color: colors.textPlaceholder,
	},
	emptyIcon: {
		fontSize: "56px",
		marginBottom: spacing.sm,
	},
	emptyTitle: {
		fontSize: fontSize.base,
		fontWeight: fontWeight.semibold,
		color: colors.textTertiary,
		margin: 0,
		marginBottom: spacing.xxs,
	},
	emptyText: {
		fontSize: fontSize.md,
		margin: 0,
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

export default async function ChatListSection() {
	const { data, error } = await api.chat.rooms.get();

	if (error || !data) {
		return (
			<div {...stylex.props(styles.emptyState)}>
				<MessageCircleHeart size={56} {...stylex.props(styles.emptyIcon)} />
				<h3 {...stylex.props(styles.emptyTitle)}>채팅방을 불러올 수 없습니다</h3>
				<p {...stylex.props(styles.emptyText)}>
					로그인 후 다시 시도해주세요
				</p>
			</div>
		);
	}

	if (data.rooms.length === 0) {
		return (
			<div {...stylex.props(styles.emptyState)}>
				<MessageCircleHeart size={56} {...stylex.props(styles.emptyIcon)} />
				<h3 {...stylex.props(styles.emptyTitle)}>채팅방이 없습니다</h3>
				<p {...stylex.props(styles.emptyText)}>
					마켓에서 상품을 둘러보고 대화를 시작해보세요
				</p>
			</div>
		);
	}

	return (
		<div {...stylex.props(styles.container)}>
			{data.rooms.map((room) => {
				// Get the first member as display (in 1:1 chat, this would be the other person)
				const displayMember = room.members[0];
				const roomName = room.name || displayMember?.nickname || "채팅방";

				return (
					<Link
						key={room.id}
						href={`/chat/${room.id}`}
						{...stylex.props(styles.item)}
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
									{room.lastMessage?.content || "대화를 시작해보세요"}
								</p>
							</div>
						</div>
					</Link>
				);
			})}
		</div>
	);
}
