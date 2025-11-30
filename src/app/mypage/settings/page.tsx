import * as stylex from "@stylexjs/stylex";
import {
	ArrowLeft,
	Bell,
	ChevronRight,
	Moon,
	Palette,
	ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { colors, fontSize, fontWeight, radius, spacing } from "@/app/global-tokens.stylex";
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
		marginBottom: spacing.md,
	},
	sectionTitle: {
		fontSize: "13px",
		fontWeight: fontWeight.semibold,
		color: colors.textMuted,
		margin: 0,
		marginBottom: spacing.xs,
		paddingLeft: spacing.xxxs,
	},
	list: {
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
		overflow: "hidden",
	},
	item: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		textDecoration: "none",
		color: colors.textSecondary,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
	},
	itemLast: {
		borderBottomWidth: 0,
	},
	icon: {
		color: colors.textMuted,
	},
	label: {
		flex: 1,
		fontSize: fontSize.md,
		fontWeight: fontWeight.medium,
	},
	value: {
		fontSize: fontSize.sm,
		color: colors.textMuted,
	},
	arrow: {
		color: colors.textPlaceholder,
	},
	version: {
		textAlign: "center",
		paddingTop: spacing.lg,
	},
	versionText: {
		fontSize: fontSize.sm,
		color: colors.textPlaceholder,
		margin: 0,
	},
});

export default function SettingsPage() {
	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<Link href="/mypage" {...stylex.props(styles.backButton)}>
					<ArrowLeft size={20} />
				</Link>
				<h1 {...stylex.props(styles.headerTitle)}>설정</h1>
			</header>

			<div {...stylex.props(styles.content)}>
				<div {...stylex.props(styles.section)}>
					<h2 {...stylex.props(styles.sectionTitle)}>앱 설정</h2>
					<div {...stylex.props(styles.list)}>
						<Link
							href="/mypage/notifications"
							{...stylex.props(styles.item)}
						>
							<Bell size={20} {...stylex.props(styles.icon)} />
							<span {...stylex.props(styles.label)}>알림 설정</span>
							<ChevronRight size={18} {...stylex.props(styles.arrow)} />
						</Link>
						<div {...stylex.props(styles.item)}>
							<Moon size={20} {...stylex.props(styles.icon)} />
							<span {...stylex.props(styles.label)}>다크 모드</span>
							<span {...stylex.props(styles.value)}>시스템 설정</span>
							<ChevronRight size={18} {...stylex.props(styles.arrow)} />
						</div>
						<div {...stylex.props(styles.item, styles.itemLast)}>
							<Palette size={20} {...stylex.props(styles.icon)} />
							<span {...stylex.props(styles.label)}>테마 색상</span>
							<span {...stylex.props(styles.value)}>기본</span>
							<ChevronRight size={18} {...stylex.props(styles.arrow)} />
						</div>
					</div>
				</div>

				<div {...stylex.props(styles.section)}>
					<h2 {...stylex.props(styles.sectionTitle)}>계정</h2>
					<div {...stylex.props(styles.list)}>
						<Link
							href="/mypage/security"
							{...stylex.props(styles.item, styles.itemLast)}
						>
							<ShieldCheck size={20} {...stylex.props(styles.icon)} />
							<span {...stylex.props(styles.label)}>보안</span>
							<ChevronRight size={18} {...stylex.props(styles.arrow)} />
						</Link>
					</div>
				</div>

				<div {...stylex.props(styles.version)}>
					<p {...stylex.props(styles.versionText)}>버전 1.0.0</p>
				</div>
			</div>

			<Footer />
		</div>
	);
}
