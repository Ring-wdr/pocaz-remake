"use client";

import * as stylex from "@stylexjs/stylex";
import {
	Bell,
	BellRing,
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
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	size,
	spacing,
} from "@/app/global-tokens.stylex";
import { useSignOut } from "@/lib/hooks/use-sign-out";
import { mypageStyles } from "./mypage-styles.stylex";

interface MenuItem {
	id: number;
	icon: ComponentType<{ size?: number; className?: string }>;
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
			{ id: 10, icon: Bell, label: "알림", href: "/notifications" },
			{ id: 1, icon: Settings, label: "설정", href: "/mypage/settings" },
			{
				id: 2,
				icon: BellRing,
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
	container: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.sm,
	},
	icon: {
		flexShrink: 0,
		color: colors.textMuted,
	},
	label: {
		flex: 1,
		fontSize: fontSize.md,
		fontWeight: fontWeight.medium,
	},
	arrow: {
		flexShrink: 0,
		color: colors.textMuted,
	},
	logoutButton: {
		alignSelf: "center",
		minHeight: size.touchTarget,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		fontSize: fontSize.md,
		fontWeight: fontWeight.medium,
		color: colors.statusError,
		backgroundColor: {
			default: "transparent",
			":hover": colors.statusErrorBgLight,
		},
		borderWidth: 0,
		borderRadius: radius.sm,
		cursor: "pointer",
		transition: "background-color 0.2s ease",
	},
});

export default function MenuList() {
	const signOut = useSignOut();
	return (
		<div {...stylex.props(styles.container)}>
			{menuItems.map((section) => (
				<section key={section.id} {...stylex.props(mypageStyles.section)}>
					<h3
						{...stylex.props(
							mypageStyles.sectionHeader,
							mypageStyles.sectionTitle,
						)}
					>
						{section.title}
					</h3>
					<div {...stylex.props(mypageStyles.card)}>
						{section.items.map((item) => {
							const IconComponent = item.icon;
							return (
								<Link
									key={item.id}
									href={item.href}
									{...stylex.props(mypageStyles.row, mypageStyles.interactive)}
								>
									<IconComponent size={20} {...stylex.props(styles.icon)} />
									<span {...stylex.props(styles.label)}>{item.label}</span>
									<ChevronRight size={18} {...stylex.props(styles.arrow)} />
								</Link>
							);
						})}
					</div>
				</section>
			))}

			<form action={signOut} {...stylex.props(styles.container)}>
				<button type="submit" {...stylex.props(styles.logoutButton)}>
					로그아웃
				</button>
			</form>
		</div>
	);
}
