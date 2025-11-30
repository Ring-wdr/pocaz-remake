"use client";

import * as stylex from "@stylexjs/stylex";
import { use } from "react";
import StatusChanger from "@/components/market/status-changer";
import { type MarketStatus, statusLabels, statusStyles, styles } from "./components";

interface StatusBadgeProps {
	marketId: string;
	status: MarketStatus;
	ownerUserId: string;
	currentUserPromise: Promise<{ id: string } | null>;
}

export default function StatusBadge({
	marketId,
	status,
	ownerUserId,
	currentUserPromise,
}: StatusBadgeProps) {
	const currentUser = use(currentUserPromise);
	const isOwner = currentUser?.id === ownerUserId;

	if (isOwner) {
		return <StatusChanger marketId={marketId} currentStatus={status} />;
	}

	return (
		<span {...stylex.props(styles.statusBadge, styles[statusStyles[status]])}>
			{statusLabels[status]}
		</span>
	);
}
