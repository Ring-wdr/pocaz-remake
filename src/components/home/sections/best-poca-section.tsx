import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { MainPocaItem } from "@/components/home";

import { colors, fontSize, fontWeight, radius, spacing } from "@/app/global-tokens.stylex";
import { api } from "@/utils/eden";
import type { MarketItem } from "@/types/entities";

const MOBILE = "@media (max-width: 767px)" as const;
const TABLET = "@media (max-width: 1023px)" as const;

const styles = stylex.create({
	bestPoca: {
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
		height: {
			default: "350px",
			[TABLET]: "446px",
			[MOBILE]: "302px",
		},
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.bgSecondary,
		color: colors.textMuted,
		fontSize: fontSize.md,
		borderRadius: radius.md,
	},
});

async function getBestPocaItems(): Promise<MarketItem[]> {
	const { data, error } = await api.markets.get({
		query: { limit: "5" },
	});

	if (error || !data) {
		return [];
	}

	return data.items;
}

export default async function BestPocaSection() {
	const items = await getBestPocaItems();

	return (
		<div {...stylex.props(styles.bestPoca)}>
			<div {...stylex.props(styles.subject)}>
				<Link href="/market" {...stylex.props(styles.subjectButton)}>
					BEST 포카
				</Link>
				<h4 {...stylex.props(styles.subjectDesc)}>
					내가 사는 포카〰️ 너를 위해 구매했지! 🍪
				</h4>
			</div>
			{items.length === 0 ? (
				<div {...stylex.props(styles.emptyState)}>
					아직 등록된 상품이 없어요
				</div>
			) : (
				<MainPocaItem items={items} />
			)}
		</div>
	);
}
