import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import { MainRecentPocaItem } from "@/components/home";
import type { MarketItem } from "@/types/entities";
import { api } from "@/utils/eden";
import { layoutStyles } from "../layout-constants.stylex";

const styles = stylex.create({
	newPoca: {
		marginBottom: spacing.md,
	},
	subject: {
		marginBottom: spacing.sm,
	},
	subjectButton: {
		fontSize: fontSize.xl,
		fontWeight: fontWeight.extrabold,
		backgroundColor: "transparent",
		borderWidth: 0,
		padding: 0,
		cursor: "pointer",
		color: colors.textPrimary,
		textDecoration: "none",
	},
	subjectDesc: {
		color: colors.textMuted,
		fontSize: fontSize.md,
		cursor: "default",
		margin: 0,
	},
	emptyState: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.bgSecondary,
		color: colors.textMuted,
		fontSize: fontSize.md,
		borderRadius: radius.md,
	},
});

async function getRecentPocaItems(): Promise<MarketItem[]> {
	const { data, error } = await api.markets.get({
		query: { limit: "5" },
		fetch: { next: { revalidate: 120 } },
	});

	if (error || !data) {
		return [];
	}

	return data.items;
}

export default async function RecentPocaSection() {
	const items = await getRecentPocaItems();

	return (
		<div {...stylex.props(styles.newPoca, layoutStyles.pocaSectionMinHeight)}>
			<div {...stylex.props(styles.subject)}>
				<Link href="/market" {...stylex.props(styles.subjectButton)}>
					최근 올라온 포카
				</Link>
				<h4 {...stylex.props(styles.subjectDesc)}>
					어제 컴백한 내 가수가 이 세계 포카?! ✨
				</h4>
			</div>
			{items.length === 0 ? (
				<div {...stylex.props(styles.emptyState, layoutStyles.pocaEmptyHeight)}>
					아직 등록된 상품이 없어요
				</div>
			) : (
				<MainRecentPocaItem items={items} />
			)}
		</div>
	);
}
