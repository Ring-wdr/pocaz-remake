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

export default function PrivacyPage() {
	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<Link href="/login" {...stylex.props(styles.backButton)}>
					<ArrowLeft size={20} />
				</Link>
				<h1 {...stylex.props(styles.headerTitle)}>개인정보처리방침</h1>
			</header>

			<div {...stylex.props(styles.content)}>
				<p {...stylex.props(styles.lastUpdated)}>최종 수정일: 2024년 1월 1일</p>

				<div {...stylex.props(styles.section)}>
					<h2 {...stylex.props(styles.sectionTitle)}>1. 수집하는 개인정보</h2>
					<p {...stylex.props(styles.sectionContent)}>
						회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.
						{"\n"}- 필수: 이메일 주소, 닉네임
						{"\n"}- 선택: 프로필 이미지
						{"\n"}- 자동 수집: 서비스 이용 기록, 접속 로그, 기기 정보
					</p>
				</div>

				<div {...stylex.props(styles.section)}>
					<h2 {...stylex.props(styles.sectionTitle)}>
						2. 개인정보의 수집 목적
					</h2>
					<p {...stylex.props(styles.sectionContent)}>
						수집된 개인정보는 다음의 목적으로 이용됩니다.
						{"\n"}- 회원 가입 및 관리
						{"\n"}- 서비스 제공 및 개선
						{"\n"}- 부정 이용 방지 및 서비스 보안
						{"\n"}- 고객 상담 및 민원 처리
					</p>
				</div>

				<div {...stylex.props(styles.section)}>
					<h2 {...stylex.props(styles.sectionTitle)}>
						3. 개인정보의 보유 기간
					</h2>
					<p {...stylex.props(styles.sectionContent)}>
						회사는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당
						정보를 지체 없이 파기합니다. 단, 관계 법령에 따라 보존할 필요가 있는
						경우 해당 기간 동안 보관합니다.
						{"\n"}- 계약 또는 청약철회 등에 관한 기록: 5년
						{"\n"}- 대금결제 및 재화 등의 공급에 관한 기록: 5년
						{"\n"}- 소비자 불만 또는 분쟁처리에 관한 기록: 3년
					</p>
				</div>

				<div {...stylex.props(styles.section)}>
					<h2 {...stylex.props(styles.sectionTitle)}>
						4. 개인정보의 제3자 제공
					</h2>
					<p {...stylex.props(styles.sectionContent)}>
						회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 단,
						다음의 경우에는 예외로 합니다.
						{"\n"}- 이용자가 사전에 동의한 경우
						{"\n"}- 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와
						방법에 따라 수사기관의 요구가 있는 경우
					</p>
				</div>

				<div {...stylex.props(styles.section)}>
					<h2 {...stylex.props(styles.sectionTitle)}>5. 이용자의 권리</h2>
					<p {...stylex.props(styles.sectionContent)}>
						이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며,
						회원 탈퇴를 통해 개인정보의 삭제를 요청할 수 있습니다.
						{"\n"}- 개인정보 조회/수정: 마이페이지 &gt; 프로필 수정
						{"\n"}- 회원 탈퇴: 마이페이지 &gt; 설정 &gt; 회원 탈퇴
					</p>
				</div>

				<div {...stylex.props(styles.section)}>
					<h2 {...stylex.props(styles.sectionTitle)}>6. 문의처</h2>
					<p {...stylex.props(styles.sectionContent)}>
						개인정보 관련 문의는 아래 연락처로 문의해 주시기 바랍니다.
						{"\n"}- 이메일: akswnd55@gmail.com
						{"\n"}- 고객센터: 1:1 문의
					</p>
				</div>
			</div>

			<Footer />
		</div>
	);
}
