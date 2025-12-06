import type { Meta, StoryObj } from "@storybook/nextjs";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "./accordion";

const meta: Meta<typeof Accordion> = {
	title: "UI/Accordion",
	component: Accordion,
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
	render: () => (
		<Accordion style={{ width: "400px" }}>
			<AccordionItem>
				<AccordionTrigger>포카즈는 어떤 서비스인가요?</AccordionTrigger>
				<AccordionContent>
					포카즈는 K-POP 포토카드 거래 및 커뮤니티 플랫폼입니다.
					안전하고 편리한 거래 환경을 제공합니다.
				</AccordionContent>
			</AccordionItem>
			<AccordionItem>
				<AccordionTrigger>거래는 어떻게 진행되나요?</AccordionTrigger>
				<AccordionContent>
					판매자가 상품을 등록하면 구매자가 채팅을 통해 연락하고,
					안전결제 또는 직거래로 거래가 진행됩니다.
				</AccordionContent>
			</AccordionItem>
			<AccordionItem>
				<AccordionTrigger>환불 정책은 어떻게 되나요?</AccordionTrigger>
				<AccordionContent>
					상품 수령 후 7일 이내에 환불 신청이 가능하며,
					상품의 상태에 따라 환불 여부가 결정됩니다.
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	),
};

export const DefaultOpen: Story = {
	render: () => (
		<Accordion style={{ width: "400px" }}>
			<AccordionItem defaultOpen>
				<AccordionTrigger>기본으로 열린 항목</AccordionTrigger>
				<AccordionContent>
					이 항목은 기본적으로 열려 있습니다.
				</AccordionContent>
			</AccordionItem>
			<AccordionItem>
				<AccordionTrigger>닫힌 항목</AccordionTrigger>
				<AccordionContent>
					이 항목은 클릭해서 열어야 합니다.
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	),
};

export const Small: Story = {
	render: () => (
		<Accordion style={{ width: "400px" }}>
			<AccordionItem size="sm">
				<AccordionTrigger>작은 사이즈</AccordionTrigger>
				<AccordionContent>
					작은 사이즈의 아코디언입니다.
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	),
};

export const Large: Story = {
	render: () => (
		<Accordion style={{ width: "400px" }}>
			<AccordionItem size="lg">
				<AccordionTrigger>큰 사이즈</AccordionTrigger>
				<AccordionContent>
					큰 사이즈의 아코디언입니다.
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	),
};

export const Bordered: Story = {
	render: () => (
		<Accordion style={{ width: "400px" }}>
			<AccordionItem bordered>
				<AccordionTrigger>테두리가 있는 항목</AccordionTrigger>
				<AccordionContent>
					bordered 속성으로 테두리를 추가할 수 있습니다.
				</AccordionContent>
			</AccordionItem>
			<AccordionItem bordered>
				<AccordionTrigger>또 다른 테두리 항목</AccordionTrigger>
				<AccordionContent>
					여러 개의 테두리 항목을 사용할 수 있습니다.
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	),
};
