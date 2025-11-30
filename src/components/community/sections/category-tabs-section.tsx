"use client";

import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { usePathname } from "next/navigation";

const categories = [
	{ id: 0, name: "전체", slug: "" },
	{ id: 1, name: "자유게시판", slug: "free" },
	{ id: 2, name: "포카 자랑", slug: "boast" },
	{ id: 3, name: "정보 공유", slug: "info" },
];

const styles = stylex.create({
	container: {
		display: "flex",
		gap: "8px",
		marginBottom: "16px",
		paddingBottom: "12px",
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: "#e5e7eb",
		overflowX: "auto",
	},
	tab: {
		paddingTop: "8px",
		paddingBottom: "8px",
		paddingLeft: "16px",
		paddingRight: "16px",
		borderRadius: "18px",
		fontSize: "14px",
		fontWeight: 500,
		textDecoration: "none",
		whiteSpace: "nowrap",
		backgroundColor: "#f3f4f6",
		color: "#6b7280",
		transition: "all 0.2s ease",
	},
	tabActive: {
		backgroundColor: "#000",
		color: "#fff",
	},
});

export default function CategoryTabsSection() {
	const pathname = usePathname();

	return (
		<div {...stylex.props(styles.container)}>
			{categories.map((category) => {
				const href = category.slug
					? `/community/${category.slug}`
					: "/community";
				const isActive =
					pathname === href ||
					(category.slug === "" && pathname === "/community");
				return (
					<Link
						key={category.id}
						href={href}
						{...stylex.props(styles.tab, isActive && styles.tabActive)}
					>
						{category.name}
					</Link>
				);
			})}
		</div>
	);
}
