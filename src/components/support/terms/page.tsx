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
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
	title: "이용약관 | POCAZ",
	description: "포카즈 서비스 이용약관을 확인하세요.",
	path: "/support/terms",
	ogTitle: "Terms of Service",
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
	section: {
		marginBottom: spacing.lg,
	},
	sectionTitle: {
		fontSize: fontSize.lg,
		fontWeight: fontWeight.bold,
		color: colors.textPrimary,
		margin: 0,
		marginBottom: spacing.xs,
	},
	sectionContent: {
		fontSize: fontSize.md,
		color: colors.textSecondary,
		lineHeight: 1.7,
		margin: 0,
	},
	lastUpdated: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
		margin: 0,
		marginBottom: spacing.md,
	},
});

export default function TermsPage() {
	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<Link href="/login" {...stylex.props(styles.backButton)}>
					<ArrowLeft size={20} />
				</Link>
				<h1 {...stylex.props(styles.headerTitle)}>이용약관</h1>
			</header>

			<div {...stylex.props(styles.content)}>
				<p {...stylex.props(styles.lastUpdated)}>
					최종 수정일: 2025년 11월 30일
				</p>

				<div {...stylex.props(styles.section)}>
					<h2 {...stylex.props(styles.sectionTitle)}>제1조 (목적)</h2>
					<p {...stylex.props(styles.sectionContent)}>
						이 약관은 포카즈(이하 "회사")가 제공하는 서비스의 이용조건 및 절차,
						회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
					</p>
				</div>

				<div {...stylex.props(styles.section)}>
					<h2 {...stylex.props(styles.sectionTitle)}>제2조 (용어의 정의)</h2>
					<p {...stylex.props(styles.sectionContent)}>
						1. "서비스"란 회사가 제공하는 포토카드 거래 및 커뮤니티 플랫폼을
						의미합니다.
						{"\n"}2. "회원"이란 이 약관에 동의하고 회사와 서비스 이용계약을
						체결한 자를 의미합니다.
						{"\n"}3. "아이디(ID)"란 회원 식별과 서비스 이용을 위해 회원이
						설정하고 회사가 승인한 문자와 숫자의 조합을 의미합니다.
					</p>
				</div>

				<div {...stylex.props(styles.section)}>
					<h2 {...stylex.props(styles.sectionTitle)}>제3조 (서비스 이용)</h2>
					<p {...stylex.props(styles.sectionContent)}>
						1. 서비스는 연중무휴 24시간 제공을 원칙으로 합니다.
						{"\n"}2. 회사는 서비스의 일부 또는 전부를 운영상 또는 기술상의
						필요에 따라 수정, 중단할 수 있습니다.
						{"\n"}3. 회원은 서비스를 이용함에 있어 관련 법령과 이 약관의 규정을
						준수해야 합니다.
					</p>
				</div>

				<div {...stylex.props(styles.section)}>
					<h2 {...stylex.props(styles.sectionTitle)}>제4조 (회원의 의무)</h2>
					<p {...stylex.props(styles.sectionContent)}>
						1. 회원은 타인의 개인정보를 도용하거나 허위 정보를 등록해서는 안
						됩니다.
						{"\n"}2. 회원은 서비스를 이용하여 불법 행위나 타인의 권리를 침해하는
						행위를 해서는 안 됩니다.
						{"\n"}3. 회원은 서비스 내에서 음란, 폭력적, 혐오적 콘텐츠를
						게시해서는 안 됩니다.
					</p>
				</div>

				<div {...stylex.props(styles.section)}>
					<h2 {...stylex.props(styles.sectionTitle)}>제5조 (면책조항)</h2>
					<p {...stylex.props(styles.sectionContent)}>
						1. 회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등
						불가항력적인 사유로 서비스를 제공할 수 없는 경우 책임이 면제됩니다.
						{"\n"}2. 회사는 회원 간의 거래에서 발생하는 분쟁에 대해 책임을 지지
						않습니다.
						{"\n"}3. 회사는 회원이 서비스를 이용하여 기대하는 효용을 얻지
						못하거나 서비스 자료에 대한 취사선택 또는 이용으로 발생하는 손해에
						대해 책임을 지지 않습니다.
					</p>
				</div>
			</div>

			<Footer />
		</div>
	);
}
