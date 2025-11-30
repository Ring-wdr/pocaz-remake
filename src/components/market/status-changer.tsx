"use client";

import * as stylex from "@stylexjs/stylex";
import { Check, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import { api } from "@/utils/eden";

type MarketStatus = "available" | "reserved" | "sold";

const statusLabels: Map<MarketStatus, string> = new Map([
	["available", "판매중"],
	["reserved", "예약중"],
	["sold", "판매완료"],
]);

const styles = stylex.create({
	container: {
		position: "absolute",
		top: spacing.xs,
		left: spacing.xs,
	},
	trigger: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxxs,
		paddingTop: spacing.xxxs,
		paddingBottom: spacing.xxxs,
		paddingLeft: spacing.xxs,
		paddingRight: spacing.xxs,
		borderRadius: radius.xs,
		fontSize: "12px",
		fontWeight: fontWeight.semibold,
		color: colors.textInverse,
		borderWidth: 0,
		cursor: "pointer",
	},
	statusAvailable: {
		backgroundColor: colors.accentPrimary,
	},
	statusReserved: {
		backgroundColor: colors.purple,
	},
	statusSold: {
		backgroundColor: colors.textMuted,
	},
	dropdown: {
		position: "absolute",
		top: "calc(100% + 4px)",
		left: 0,
		minWidth: "120px",
		backgroundColor: colors.bgSecondary,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		borderRadius: radius.sm,
		boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
		zIndex: 100,
		overflow: "hidden",
	},
	option: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		width: "100%",
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		fontSize: fontSize.sm,
		color: colors.textSecondary,
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
		textAlign: "left",
		":hover": {
			backgroundColor: colors.bgTertiary,
		},
	},
	optionActive: {
		color: colors.accentPrimary,
		fontWeight: fontWeight.semibold,
	},
	optionDisabled: {
		opacity: 0.5,
		cursor: "not-allowed",
	},
});

const statusStyles: Record<MarketStatus, keyof typeof styles> = {
	available: "statusAvailable",
	reserved: "statusReserved",
	sold: "statusSold",
};

interface StatusChangerProps {
	marketId: string;
	currentStatus: MarketStatus;
}

export default function StatusChanger({
	marketId,
	currentStatus,
}: StatusChangerProps) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [isPending, startTransition] = useTransition();

	const handleStatusChange = (newStatus: MarketStatus) => {
		if (newStatus === currentStatus || isPending) return;

		startTransition(async () => {
			const { error } = await api.markets({ id: marketId }).put({
				status: newStatus,
			});

			if (error) {
				alert("상태 변경에 실패했습니다.");
				return;
			}

			setIsOpen(false);
			router.refresh();
		});
	};

	return (
		<div {...stylex.props(styles.container)}>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				disabled={isPending}
				{...stylex.props(styles.trigger, styles[statusStyles[currentStatus]])}
			>
				{statusLabels.get(currentStatus)}
				<ChevronDown size={14} />
			</button>

			{isOpen && (
				<div {...stylex.props(styles.dropdown)}>
					{Array.from(statusLabels.keys()).map((status) => (
						<button
							key={status}
							type="button"
							onClick={() => handleStatusChange(status)}
							disabled={isPending}
							{...stylex.props(
								styles.option,
								status === currentStatus && styles.optionActive,
								isPending && styles.optionDisabled,
							)}
						>
							{statusLabels.get(status)}
							{status === currentStatus && <Check size={16} />}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
