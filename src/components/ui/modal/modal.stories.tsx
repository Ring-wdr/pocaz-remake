"use client";

import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import { ConfirmModal, openConfirm, confirmAction } from "./index";
import { Button } from "../button";

const meta: Meta<typeof ConfirmModal> = {
	title: "UI/Modal",
	component: ConfirmModal,
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ConfirmModal>;

function ConfirmModalDemo() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setIsOpen(true)}>모달 열기</Button>
			<ConfirmModal
				isOpen={isOpen}
				title="확인"
				description="이 작업을 진행하시겠습니까?"
				onConfirm={() => {
					console.log("확인됨");
					setIsOpen(false);
				}}
				onClose={() => setIsOpen(false)}
			/>
		</>
	);
}

export const Default: Story = {
	render: () => <ConfirmModalDemo />,
};

export const Danger: Story = {
	render: () => {
		const [isOpen, setIsOpen] = useState(false);

		return (
			<>
				<Button variant="danger" onClick={() => setIsOpen(true)}>
					삭제
				</Button>
				<ConfirmModal
					isOpen={isOpen}
					title="삭제 확인"
					description="정말로 이 항목을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
					confirmText="삭제"
					confirmVariant="danger"
					onConfirm={() => {
						console.log("삭제됨");
						setIsOpen(false);
					}}
					onClose={() => setIsOpen(false)}
				/>
			</>
		);
	},
};

export const WithInputField: Story = {
	render: () => {
		const [isOpen, setIsOpen] = useState(false);

		return (
			<>
				<Button onClick={() => setIsOpen(true)}>채팅방 나가기</Button>
				<ConfirmModal
					isOpen={isOpen}
					title="채팅방 나가기"
					description="정말로 채팅방을 나가시겠습니까?"
					confirmText="나가기"
					confirmVariant="danger"
					fields={[
						{
							name: "reason",
							label: "나가는 이유 (선택)",
							placeholder: "이유를 입력해주세요",
						},
					]}
					onConfirm={(data) => {
						console.log("나가기:", data);
						setIsOpen(false);
					}}
					onClose={() => setIsOpen(false)}
				/>
			</>
		);
	},
};

export const UsingOpenConfirm: Story = {
	render: () => {
		const handleClick = () => {
			openConfirm({
				title: "알림",
				description: "openConfirm 함수로 열린 모달입니다.",
				onConfirm: () => {
					console.log("확인됨");
				},
			});
		};

		return <Button onClick={handleClick}>openConfirm 사용</Button>;
	},
};

export const UsingConfirmAction: Story = {
	render: () => {
		const handleClick = async () => {
			const result = await confirmAction({
				title: "저장 확인",
				description: "변경사항을 저장하시겠습니까?",
				confirmText: "저장",
			});

			if (result.confirmed) {
				console.log("저장됨");
				alert("저장되었습니다!");
			} else {
				console.log("취소됨");
			}
		};

		return <Button onClick={handleClick}>confirmAction 사용 (async/await)</Button>;
	},
};
