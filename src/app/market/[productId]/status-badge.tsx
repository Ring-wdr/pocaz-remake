"use client";

import * as stylex from "@stylexjs/stylex";
import StatusChanger from "@/components/market/status-changer";
import {
	type MarketStatus,
	statusLabels,
	statusStyles,
	styles,
} from "./components";

interface StatusBadgeProps {
	marketId: string;
	status: MarketStatus;
	isOwner: boolean;
}

export default function StatusBadge({
	marketId,
	status,
	isOwner,
}: StatusBadgeProps) {
	if (isOwner) {
		return <StatusChanger marketId={marketId} currentStatus={status} />;
	}

	return (
		<span {...stylex.props(styles.statusBadge, styles[statusStyles[status]])}>
			{statusLabels[status]}
		</span>
	);
}
