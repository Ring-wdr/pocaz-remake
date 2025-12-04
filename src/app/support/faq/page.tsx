import * as stylex from "@stylexjs/stylex";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import { Footer } from "@/components/home";
import { FAQItem } from "@/components/support/faq/item";
import { SupportHelpCard } from "@/components/support/help-card";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
	title: "FAQ | POCAZ",
	description: "계정, 거래, 서비스 이용과 관련한 자주 묻는 질문을 확인하세요.",
	path: "/support/faq",
	ogTitle: "FAQ",
});

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: colors.bgPrimary,
	},
	header: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
	},
	backButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "36px",
		height: "36px",
		color: colors.textSecondary,
		backgroundColor: "transparent",
		borderWidth: 0,
		borderRadius: radius.sm,
		cursor: "pointer",
		textDecoration: "none",
	},
	headerTitle: {
		flex: 1,
		fontSize: fontSize.lg,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
		margin: 0,
	},
	content: {
		flex: 1,
		paddingTop: spacing.md,
		paddingBottom: spacing.md,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
	},
	categoryTitle: {
		fontSize: fontSize.sm,
		fontWeight: fontWeight.semibold,
		color: colors.textMuted,
		margin: 0,
		marginBottom: spacing.xs,
		marginTop: spacing.md,
	},
	categoryTitleFirst: {
		marginTop: 0,
	},
	faqList: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xxs,
	},
	supportSection: {
		marginTop: spacing.lg,
	},
});

interface FAQ {
	id: number;
	question: string;
	answer: string;
}

interface FAQCategory {
	id: string;
	title: string;
	items: FAQ[];
}

const faqData: FAQCategory[] = [
	{
		id: "account",
		title: "계정",
		items: [
			{
				id: 1,
				question: "회원가입은 어떻게 하나요?",
				answer:
					"포카즈는 Google 계정으로 간편하게 가입할 수 있습니다. 로그인 페이지에서 'Google로 계속하기' 버튼을 클릭하면 바로 시작할 수 있습니다.",
			},
			{
				id: 2,
				question: "닉네임은 어떻게 변경하나요?",
				answer:
					"마이페이지 > 프로필 수정에서 닉네임을 변경할 수 있습니다. 닉네임은 2자 이상 20자 이하로 설정 가능합니다.",
			},
			{
				id: 3,
				question: "계정을 탈퇴하고 싶어요.",
				answer:
					"마이페이지 > 설정 > 보안에서 회원 탈퇴를 진행할 수 있습니다. 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없으니 신중하게 결정해 주세요.",
			},
		],
	},
	{
		id: "trading",
		title: "거래",
		items: [
			{
				id: 4,
				question: "거래는 어떻게 진행되나요?",
				answer:
					"판매자가 상품을 등록하면 구매 희망자가 채팅으로 연락합니다. 가격과 거래 방법을 협의한 후 거래를 진행하시면 됩니다. 포카즈는 중개 플랫폼으로 실제 거래는 당사자 간에 이루어집니다.",
			},
			{
				id: 5,
				question: "안전한 거래를 위한 팁이 있나요?",
				answer:
					"1) 프로필과 거래 후기를 확인하세요.\n2) 가능하면 직거래를 권장합니다.\n3) 택배 거래 시 운송장 번호를 공유해 주세요.\n4) 입금 전 상품 상태를 꼭 확인하세요.",
			},
			{
				id: 6,
				question: "거래 중 문제가 발생하면 어떻게 하나요?",
				answer:
					"거래 중 문제가 발생하면 1:1 문의를 통해 신고해 주세요. 허위 거래나 사기 행위는 계정 정지 처리됩니다.",
			},
		],
	},
	{
		id: "service",
		title: "서비스",
		items: [
			{
				id: 7,
				question: "포토카드를 어떻게 등록하나요?",
				answer:
					"마켓 > 상품 등록에서 포토카드 사진, 제목, 가격, 설명을 입력하여 등록할 수 있습니다. 최대 5장의 사진을 업로드할 수 있습니다.",
			},
			{
				id: 8,
				question: "커뮤니티 이용 규칙이 있나요?",
				answer:
					"타인을 비방하거나 욕설하는 글, 광고성 글, 불법적인 내용의 글은 삭제될 수 있으며 반복 시 이용이 제한됩니다.",
			},
		],
	},
];

export default function FAQPage() {
	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<Link href="/mypage" {...stylex.props(styles.backButton)}>
					<ArrowLeft size={20} />
				</Link>
				<h1 {...stylex.props(styles.headerTitle)}>자주 묻는 질문</h1>
			</header>

			<div {...stylex.props(styles.content)}>
				{faqData.map((category, categoryIndex) => (
					<div key={category.id}>
						<h2
							{...stylex.props(
								styles.categoryTitle,
								categoryIndex === 0 && styles.categoryTitleFirst,
							)}
						>
							{category.title}
						</h2>
						<div {...stylex.props(styles.faqList)}>
							{category.items.map((item) => (
								<FAQItem key={item.id} item={item} />
							))}
						</div>
					</div>
				))}

				<div {...stylex.props(styles.supportSection)}>
					<SupportHelpCard description="FAQ에 없는 질문이나 계정/거래 관련 문제는 1:1 문의를 남겨주세요." />
				</div>
			</div>

			<Footer />
		</div>
	);
}
