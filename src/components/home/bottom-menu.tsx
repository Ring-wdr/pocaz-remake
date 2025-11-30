"use client";

import * as stylex from "@stylexjs/stylex";
import { Home, MessageCircleHeart, Smile, Store, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

import { colors, fontSize, size } from "@/app/global-tokens.stylex";

interface MenuItem {
	id: number;
	title: string;
	icon: ComponentType<{ size?: number }>;
	to: string;
}

const btnList: MenuItem[] = [
	{ id: 0, title: "HOME", icon: Home, to: "/" },
	{ id: 1, title: "MARKET", icon: Store, to: "/market" },
	{ id: 2, title: "CHAT", icon: MessageCircleHeart, to: "/chat/list" },
	{ id: 3, title: "FREEZONE", icon: Smile, to: "/community" },
	{ id: 4, title: "MY PAGE", icon: User, to: "/mypage" },
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
	menuIcon: {
		display: "block",
		marginLeft: "auto",
		marginRight: "auto",
		marginBottom: "2px",
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
					return (
						<li key={btn.id} {...stylex.props(styles.menuItem)}>
							<Link
								href={btn.to}
								{...stylex.props(
									styles.menuLink,
									isActive && styles.menuLinkActive,
								)}
							>
								<IconComponent size={24} {...stylex.props(styles.menuIcon)} />
								<p {...stylex.props(styles.menuTitle)}>{btn.title}</p>
							</Link>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
