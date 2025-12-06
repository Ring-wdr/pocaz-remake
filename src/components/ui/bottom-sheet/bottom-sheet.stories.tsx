"use client";

import type { Meta, StoryObj } from "@storybook/nextjs";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { colors, fontSize, fontWeight } from "@/app/global-tokens.stylex";
import { Button } from "../button";
import { BottomSheet } from "./bottom-sheet";

const meta: Meta<typeof BottomSheet> = {
	title: "UI/BottomSheet",
	component: BottomSheet,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["sm", "md", "lg"],
		},
		showHandle: { control: "boolean" },
		showCloseButton: { control: "boolean" },
		closeOnOverlayClick: { control: "boolean" },
		closeOnEscape: { control: "boolean" },
		noPadding: { control: "boolean" },
	},
};

export default meta;
type Story = StoryObj<typeof BottomSheet>;

const itemStyle = stylex.create({
	item: {
		padding: "16px 20px",
		textAlign: "left",
		borderWidth: 0,
		borderStyle: "none",
		borderColor: "transparent",
		backgroundColor: "transparent",
		color: colors.textPrimary,
		cursor: "pointer",
		fontSize: fontSize.md,
		fontWeight: fontWeight.medium,
	},
});

function BottomSheetDemo({
	size = "md",
	title,
	showHandle = true,
	showCloseButton = false,
}: {
	size?: "sm" | "md" | "lg" | "full";
	title?: string;
	showHandle?: boolean;
	showCloseButton?: boolean;
}) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setIsOpen(true)}>바텀시트 열기</Button>
			<BottomSheet
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				size={size}
				title={title}
				showHandle={showHandle}
				showCloseButton={showCloseButton}
			>
				<p>바텀시트 내용입니다.</p>
				<p style={{ marginTop: 16 }}>
					원하는 컨텐츠를 여기에 넣을 수 있습니다.
				</p>
			</BottomSheet>
		</>
	);
}

export const Default: Story = {
	render: () => <BottomSheetDemo />,
};

export const WithTitle: Story = {
	render: () => <BottomSheetDemo title="메뉴 선택" showCloseButton />,
};

export const Small: Story = {
	render: () => <BottomSheetDemo size="sm" title="작은 시트" />,
};

export const Large: Story = {
	render: () => <BottomSheetDemo size="lg" title="큰 시트" />,
};

export const WithFooter: Story = {
	render: () => {
		const [isOpen, setIsOpen] = useState(false);

		return (
			<>
				<Button onClick={() => setIsOpen(true)}>바텀시트 열기</Button>
				<BottomSheet
					isOpen={isOpen}
					onClose={() => setIsOpen(false)}
					title="확인"
					showCloseButton
					footer={
						<div style={{ display: "flex", gap: 8 }}>
							<Button
								variant="secondary"
								fullWidth
								onClick={() => setIsOpen(false)}
							>
								취소
							</Button>
							<Button fullWidth onClick={() => setIsOpen(false)}>
								확인
							</Button>
						</div>
					}
				>
					<p>이 작업을 진행하시겠습니까?</p>
				</BottomSheet>
			</>
		);
	},
};

export const MenuList: Story = {
	render: () => {
		const [isOpen, setIsOpen] = useState(false);

		return (
			<>
				<Button onClick={() => setIsOpen(true)}>메뉴 열기</Button>
				<BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} noPadding>
					<div style={{ display: "flex", flexDirection: "column" }}>
						{["프로필 보기", "메시지 보내기", "차단하기", "신고하기"].map(
							(item) => (
								<button
									key={item}
									type="button"
									onClick={() => setIsOpen(false)}
									// style={{
									// 	padding: "16px 20px",
									// 	textAlign: "left",
									// 	border: "none",
									// 	background: "transparent",
									// 	color: "inherit",
									// 	cursor: "pointer",
									// 	fontSize: 16,
									// }}
									{...stylex.props(itemStyle.item)}
								>
									{item}
								</button>
							),
						)}
					</div>
				</BottomSheet>
			</>
		);
	},
};
