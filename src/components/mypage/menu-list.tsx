"use client";

import * as stylex from "@stylexjs/stylex";
import {
	Bell,
	ChevronRight,
	FileText,
	Headphones,
	Heart,
	HelpCircle,
	Settings,
	ShieldCheck,
	ShoppingBag,
	ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";
import { colors } from "@/app/global-tokens.stylex";

interface MenuItem {
	id: number;
	icon: ComponentType<{ size?: number }>;
	label: string;
	href: string;
}

interface MenuSection {
	id: string;
	title: string;
	items: MenuItem[];
}

const menuItems: MenuSection[] = [
	{
		id: "account",
		title: "계정 관리",
		items: [
			{ id: 1, icon: Settings, label: "설정", href: "/mypage/settings" },
			{
				id: 2,
				icon: Bell,
				label: "알림 설정",
				href: "/mypage/notifications",
			},
			{
				id: 3,
				icon: ShieldCheck,
				label: "보안",
				href: "/mypage/security",
			},
		],
	},
	{
		id: "trading",
		title: "거래 관리",
		items: [
			{
				id: 4,
				icon: ShoppingBag,
				label: "판매 내역",
				href: "/mypage/sales",
			},
			{
				id: 5,
				icon: ShoppingCart,
				label: "구매 내역",
				href: "/mypage/purchases",
			},
			{ id: 6, icon: Heart, label: "찜 목록", href: "/mypage/wishlist" },
		],
	},
	{
		id: "support",
		title: "고객지원",
		items: [
			{
				id: 7,
				icon: HelpCircle,
				label: "자주 묻는 질문",
				href: "/support/faq",
			},
			{
				id: 8,
				icon: Headphones,
				label: "1:1 문의",
				href: "/support/inquiry",
			},
			{
				id: 9,
				icon: FileText,
				label: "이용약관",
				href: "/support/terms",
			},
		],
	},
];

const styles = stylex.create({
	container: {},
	section: {
		marginBottom: "24px",
	},
	sectionTitle: {
		fontSize: "13px",
		fontWeight: 600,
		color: colors.textMuted,
		margin: 0,
		marginBottom: "12px",
		paddingLeft: "4px",
	},
	list: {
		backgroundColor: colors.bgSecondary,
		borderRadius: "12px",
		overflow: "hidden",
	},
	item: {
		display: "flex",
		alignItems: "center",
		gap: "12px",
		paddingTop: "14px",
		paddingBottom: "14px",
		paddingLeft: "16px",
		paddingRight: "16px",
		textDecoration: "none",
		color: colors.textSecondary,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
	},
	itemLast: {
		borderBottomWidth: 0,
	},
	icon: {
		color: colors.textMuted,
	},
	label: {
		flex: 1,
		fontSize: "14px",
		fontWeight: 500,
	},
	arrow: {
		color: colors.textPlaceholder,
	},
	logoutButton: {
		width: "100%",
		paddingTop: "14px",
		paddingBottom: "14px",
		fontSize: "14px",
		fontWeight: 500,
		color: colors.statusError,
		backgroundColor: colors.statusErrorBgLight,
		borderWidth: 0,
		borderRadius: "12px",
		cursor: "pointer",
		transition: "background-color 0.2s ease",
	},
});

export default function MenuList() {
	const handleLogout = () => {
		// TODO: Implement logout
		console.log("Logout clicked");
	};

	return (
		<div {...stylex.props(styles.container)}>
			{menuItems.map((section) => (
				<div key={section.id} {...stylex.props(styles.section)}>
					<h4 {...stylex.props(styles.sectionTitle)}>{section.title}</h4>
					<div {...stylex.props(styles.list)}>
						{section.items.map((item, index) => {
							const IconComponent = item.icon;
							return (
								<Link
									key={item.id}
									href={item.href}
									{...stylex.props(
										styles.item,
										index === section.items.length - 1 && styles.itemLast,
									)}
								>
									<IconComponent size={20} {...stylex.props(styles.icon)} />
									<span {...stylex.props(styles.label)}>{item.label}</span>
									<ChevronRight size={18} {...stylex.props(styles.arrow)} />
								</Link>
							);
						})}
					</div>
				</div>
			))}

			<button
				type="button"
				onClick={handleLogout}
				{...stylex.props(styles.logoutButton)}
			>
				로그아웃
			</button>
		</div>
	);
}
