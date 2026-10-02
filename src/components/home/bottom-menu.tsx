"use client";

import * as stylex from "@stylexjs/stylex";
import { Home, MessageCircleHeart, Smile, Store, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

import { colors, fontSize, size } from "@/app/global-tokens.stylex";
import { ChatTabUnreadBadge } from "@/components/chat/chat-unread-badge";

interface MenuItem {
	id: number;
	title: string;
	icon: ComponentType<{ size?: number }>;
	to: string;
	/** 아이콘 오른쪽 위에 겹쳐 그리는 뱃지 */
	badge?: ComponentType;
}

const btnList: MenuItem[] = [
	{ id: 0, title: "홈", icon: Home, to: "/" },
	{ id: 1, title: "마켓", icon: Store, to: "/market" },
	{
		id: 2,
		title: "채팅",
		icon: MessageCircleHeart,
		to: "/chat/list",
		badge: ChatTabUnreadBadge,
	},
	{ id: 3, title: "커뮤니티", icon: Smile, to: "/community" },
	{ id: 4, title: "마이페이지", icon: User, to: "/mypage" },
];

const styles = stylex.create({
	btmMenu: {
		position: "sticky",
		bottom: 0,
		left: 0,
		zIndex: 50,
		boxSizing: "border-box",
		height: size.bottomMenuHeight,
		backgroundColor: colors.bgPrimary,
		borderTopWidth: 1,
		borderTopStyle: "solid",
		borderTopColor: colors.textPlaceholder,
	},
	menuList: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-around",
		height: "100%",
		listStyle: "none",
		margin: 0,
		padding: 0,
	},
	menuItem: {},
	menuLink: {
		display: "block",
		textAlign: "center",
		textDecoration: "none",
		color: colors.textPrimary,
	},
	menuLinkActive: {
		color: colors.brandPrimary,
	},
	// 아이콘과 뱃지를 한 상자에 담아 뱃지가 아이콘 모서리를 기준으로 놓이게 한다
	menuIconBox: {
		position: "relative",
		display: "block",
		width: size.iconButton,
		marginLeft: "auto",
		marginRight: "auto",
		marginBottom: "2px",
	},
	menuIcon: {
		display: "block",
	},
	menuTitle: {
		fontSize: fontSize.sm,
	},
});

export default function BottomMenu() {
	const pathname = usePathname();

	return (
		<div {...stylex.props(styles.btmMenu)}>
			<ul {...stylex.props(styles.menuList)}>
				{btnList.map((btn) => {
					const isActive = pathname === btn.to;
					const IconComponent = btn.icon;
					const BadgeComponent = btn.badge;
					return (
						<li key={btn.id} {...stylex.props(styles.menuItem)}>
							<Link
								href={btn.to}
								{...stylex.props(
									styles.menuLink,
									isActive && styles.menuLinkActive,
								)}
							>
								<span {...stylex.props(styles.menuIconBox)}>
									<IconComponent size={24} {...stylex.props(styles.menuIcon)} />
									{BadgeComponent && <BadgeComponent />}
								</span>
								<p {...stylex.props(styles.menuTitle)}>{btn.title}</p>
							</Link>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
