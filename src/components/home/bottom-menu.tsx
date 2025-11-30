"use client";

import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "remixicon/fonts/remixicon.css";

const btnList = [
	{ id: 0, title: "HOME", icon: "ri-home-3-line", to: "/" },
	{ id: 1, title: "MARKET", icon: "ri-store-line", to: "/market" },
	{ id: 2, title: "CHAT", icon: "ri-chat-heart-line", to: "/chat/list" },
	{ id: 3, title: "FREEZONE", icon: "ri-emotion-happy-line", to: "/community" },
	{ id: 4, title: "MY PAGE", icon: "ri-user-line", to: "/mypage" },
];

const styles = stylex.create({
	btmMenu: {
		position: "sticky",
		bottom: 0,
		left: 0,
		zIndex: 50,
		boxSizing: "border-box",
		height: "56px",
		backgroundColor: "#fff",
		borderTopWidth: 1,
		borderTopStyle: "solid",
		borderTopColor: "#9ca3af",
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
		color: "#000",
	},
	menuLinkActive: {
		color: "#034ac5",
	},
	menuIcon: {
		display: "block",
		fontSize: "24px",
		lineHeight: 1,
	},
	menuTitle: {
		fontSize: "12px",
	},
});

export default function BottomMenu() {
	const pathname = usePathname();

	return (
		<div {...stylex.props(styles.btmMenu)}>
			<ul {...stylex.props(styles.menuList)}>
				{btnList.map((btn) => {
					const isActive = pathname === btn.to;
					return (
						<li key={btn.id} {...stylex.props(styles.menuItem)}>
							<Link
								href={btn.to}
								{...stylex.props(
									styles.menuLink,
									isActive && styles.menuLinkActive,
								)}
							>
								<i
									className={`${btn.icon}`}
									{...stylex.props(styles.menuIcon)}
								/>
								<p {...stylex.props(styles.menuTitle)}>{btn.title}</p>
							</Link>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
