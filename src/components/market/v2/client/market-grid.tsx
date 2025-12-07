"use client";

import * as stylex from "@stylexjs/stylex";

import { spacing } from "@/app/global-tokens.stylex";
import type { MarketListItem } from "../types";
import MarketGridItem from "./market-grid-item";

const styles = stylex.create({
	grid: {
		display: "grid",
		gridTemplateColumns: "repeat(2, 1fr)",
		gap: spacing.xs,
		listStyleType: "none",
		margin: 0,
		padding: 0,
	},
});

type MarketGridProps = {
	items: MarketListItem[];
	pending: boolean;
};

export default function MarketGrid({ items, pending }: MarketGridProps) {
	return (
		<ul {...stylex.props(styles.grid)} aria-busy={pending}>
			{items.map((item) => (
				<li key={item.id}>
					<MarketGridItem item={item} />
				</li>
			))}
		</ul>
	);
}
