"use client";

import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { colors, fontSize, fontWeight, radius, spacing } from "@/app/global-tokens.stylex";

const categories = [
	{ id: 0, name: "전체", slug: "" },
	{ id: 1, name: "자유게시판", slug: "free" },
	{ id: 2, name: "포카 자랑", slug: "boast" },
	{ id: 3, name: "정보 공유", slug: "info" },
];

const styles = stylex.create({
	container: {
		display: "flex",
		gap: spacing.xxs,
		marginBottom: spacing.sm,
		paddingBottom: spacing.xs,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
		overflowX: "auto",
	},
	tab: {
		paddingTop: spacing.xxs,
		paddingBottom: spacing.xxs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderRadius: radius.lg,
		fontSize: fontSize.md,
		fontWeight: fontWeight.medium,
		textDecoration: "none",
		whiteSpace: "nowrap",
		backgroundColor: colors.bgTertiary,
		color: colors.textMuted,
		transition: "all 0.2s ease",
	},
	tabActive: {
		backgroundColor: colors.bgInverse,
		color: colors.textInverse,
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
