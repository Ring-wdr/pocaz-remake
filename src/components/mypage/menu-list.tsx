"use client";

import * as stylex from "@stylexjs/stylex";
import Link from "next/link";

const menuItems = [
	{
		id: "account",
		title: "계정 관리",
		items: [
			{ id: 1, icon: "ri-settings-line", label: "설정", href: "/mypage/settings" },
			{
				id: 2,
				icon: "ri-notification-line",
				label: "알림 설정",
				href: "/mypage/notifications",
			},
			{
				id: 3,
				icon: "ri-shield-check-line",
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
				icon: "ri-shopping-bag-line",
				label: "판매 내역",
				href: "/mypage/sales",
			},
			{
				id: 5,
				icon: "ri-shopping-cart-line",
				label: "구매 내역",
				href: "/mypage/purchases",
			},
			{ id: 6, icon: "ri-heart-line", label: "찜 목록", href: "/mypage/wishlist" },
		],
	},
	{
		id: "support",
		title: "고객지원",
		items: [
			{
				id: 7,
				icon: "ri-question-line",
				label: "자주 묻는 질문",
				href: "/support/faq",
			},
			{
				id: 8,
				icon: "ri-customer-service-line",
				label: "1:1 문의",
				href: "/support/inquiry",
			},
			{
				id: 9,
				icon: "ri-file-text-line",
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
		color: "#6b7280",
		margin: 0,
		marginBottom: "12px",
		paddingLeft: "4px",
	},
	list: {
		backgroundColor: "#f9fafb",
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
		color: "#111827",
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: "#e5e7eb",
	},
	itemLast: {
		borderBottomWidth: 0,
	},
	icon: {
		fontSize: "20px",
		color: "#6b7280",
	},
	label: {
		flex: 1,
		fontSize: "14px",
		fontWeight: 500,
	},
	arrow: {
		fontSize: "18px",
		color: "#9ca3af",
	},
	logoutButton: {
		width: "100%",
		paddingTop: "14px",
		paddingBottom: "14px",
		fontSize: "14px",
		fontWeight: 500,
		color: "#dc2626",
		backgroundColor: "#fef2f2",
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
						{section.items.map((item, index) => (
							<Link
								key={item.id}
								href={item.href}
								{...stylex.props(
									styles.item,
									index === section.items.length - 1 && styles.itemLast,
								)}
							>
								<i className={item.icon} {...stylex.props(styles.icon)} />
								<span {...stylex.props(styles.label)}>{item.label}</span>
								<i
									className="ri-arrow-right-s-line"
									{...stylex.props(styles.arrow)}
								/>
							</Link>
						))}
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
