import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import * as stylex from "@stylexjs/stylex";
import { colors, fontSize, fontWeight, radius, spacing } from "@/app/global-tokens.stylex";
import { Footer } from "@/components/home";
import { api } from "@/utils/eden";
import { createMetadata } from "@/lib/metadata";
import SalesListClient from "./page.client";

export const metadata = createMetadata({
	title: "판매 내역 | POCAZ",
	description: "등록한 포토카드 판매 기록을 확인하세요.",
	path: "/mypage/sales",
	ogTitle: "Sales",
});

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: colors.bgPrimary,
	},
	header: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
	},
	backButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "36px",
		height: "36px",
		color: colors.textSecondary,
		backgroundColor: "transparent",
		borderWidth: 0,
		borderRadius: radius.sm,
		cursor: "pointer",
		textDecoration: "none",
	},
	headerTitle: {
		flex: 1,
		fontSize: fontSize.lg,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
		margin: 0,
	},
});

export default async function SalesPage() {
	const { data, error } = await api.users.me.sales.get();
	const saleProducts = !error && data ? data.items : [];

	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<Link href="/mypage" {...stylex.props(styles.backButton)}>
					<ArrowLeft size={20} />
				</Link>
				<h1 {...stylex.props(styles.headerTitle)}>판매 내역</h1>
			</header>

			<SalesListClient products={saleProducts} />

			<Footer />
		</div>
	);
}
