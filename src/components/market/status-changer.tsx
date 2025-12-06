"use client";

import * as stylex from "@stylexjs/stylex";
import { Check, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
	Button,
	ListBox,
	ListBoxItem,
	Popover,
	Select,
	SelectValue,
} from "react-aria-components";
import { toast } from "sonner";
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
		outlineWidth: 0,
	},
	triggerFocusVisible: {
		outlineWidth: 2,
		outlineStyle: "solid",
		outlineColor: colors.accentPrimary,
		outlineOffset: "2px",
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
	popover: {
		minWidth: "120px",
		backgroundColor: colors.bgSecondary,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		borderRadius: radius.sm,
		boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
		overflow: "hidden",
		outlineWidth: 0,
	},
	listBox: {
		outlineWidth: 0,
	},
	option: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		fontSize: fontSize.sm,
		color: colors.textSecondary,
		cursor: "pointer",
		outlineWidth: 0,
	},
	optionHovered: {
		backgroundColor: colors.bgTertiary,
	},
	optionFocused: {
		backgroundColor: colors.bgTertiary,
	},
	optionSelected: {
		color: colors.accentPrimary,
		fontWeight: fontWeight.semibold,
	},
	optionDisabled: {
		opacity: 0.5,
		cursor: "not-allowed",
	},
	selectValue: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxxs,
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
	const [isPending, startTransition] = useTransition();
	const [selectedStatus, setSelectedStatus] =
		useState<MarketStatus>(currentStatus);

	useEffect(() => {
		setSelectedStatus(currentStatus);
	}, [currentStatus]);

	const handleStatusChange = (newStatus: MarketStatus) => {
		if (newStatus === selectedStatus || isPending) return;

		const previousStatus = selectedStatus;
		setSelectedStatus(newStatus);
		startTransition(async () => {
			const { error } = await api.markets({ id: marketId }).put({
				status: newStatus,
			});

			if (error) {
				setSelectedStatus(previousStatus);
				toast.error("상태 변경에 실패했습니다. 다시 시도해 주세요.");
				return;
			}

			toast.success(`${statusLabels.get(newStatus)} 상태로 변경되었습니다.`);
			router.refresh();
		});
	};

	const statusOptions = Array.from(statusLabels.entries());

	return (
		<div {...stylex.props(styles.container)}>
			<Select
				selectedKey={selectedStatus}
				onSelectionChange={(key) => handleStatusChange(key as MarketStatus)}
				isDisabled={isPending}
				aria-label="판매 상태 변경"
			>
				<Button
					{...stylex.props(styles.trigger, styles[statusStyles[selectedStatus]])}
					data-focus-visible-added=""
					style={{
						outlineWidth: undefined,
					}}
				>
					{({ isFocusVisible }) => (
						<span
							{...stylex.props(
								styles.selectValue,
								isFocusVisible && styles.triggerFocusVisible,
							)}
						>
							<SelectValue>
								{statusLabels.get(selectedStatus)}
							</SelectValue>
							<ChevronDown size={14} />
						</span>
					)}
				</Button>
				<Popover {...stylex.props(styles.popover)}>
					<ListBox {...stylex.props(styles.listBox)}>
						{statusOptions.map(([status, label]) => (
							<ListBoxItem
								key={status}
								id={status}
								textValue={label}
							>
								{({ isSelected, isFocused, isHovered, isDisabled }) => (
									<div
										{...stylex.props(
											styles.option,
											isHovered && styles.optionHovered,
											isFocused && styles.optionFocused,
											isSelected && styles.optionSelected,
											isDisabled && styles.optionDisabled,
										)}
									>
										{label}
										{isSelected && <Check size={16} />}
									</div>
								)}
							</ListBoxItem>
						))}
					</ListBox>
				</Popover>
			</Select>
		</div>
	);
}
