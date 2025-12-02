import * as stylex from "@stylexjs/stylex";
import { Mail, MessageCircle, Search } from "lucide-react";
import Link from "next/link";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";

const styles = stylex.create({
	card: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xs,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderRadius: radius.md,
		backgroundColor: colors.bgSecondary,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
	},
	title: {
		margin: 0,
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
	},
	description: {
		margin: 0,
		fontSize: fontSize.sm,
		color: colors.textMuted,
		lineHeight: 1.6,
	},
	actions: {
		display: "flex",
		flexWrap: "wrap",
		gap: spacing.xs,
		marginTop: spacing.xs,
	},
	actionButton: {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.xxs,
		paddingTop: spacing.xxs,
		paddingBottom: spacing.xxs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		fontSize: fontSize.sm,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
		textDecoration: "none",
		backgroundColor: colors.bgPrimary,
		borderRadius: radius.sm,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
	},
});

interface SupportHelpCardProps {
	title?: string;
	description?: string;
}

export function SupportHelpCard({
	title = "추가 도움이 필요하신가요?",
	description = "필요한 정보를 찾지 못했다면 바로 문의를 남겨주세요.",
}: SupportHelpCardProps) {
	return (
		<div {...stylex.props(styles.card)}>
			<h2 {...stylex.props(styles.title)}>{title}</h2>
			<p {...stylex.props(styles.description)}>{description}</p>
			<div {...stylex.props(styles.actions)}>
				<Link href="/support/inquiry" {...stylex.props(styles.actionButton)}>
					<MessageCircle size={16} />
					1:1 문의
				</Link>
				<a
					href="mailto:akswnd55@gmail.com?subject=POCAZ%20지원%20문의"
					{...stylex.props(styles.actionButton)}
				>
					<Mail size={16} />
					이메일
				</a>
				<Link href="/support/faq" {...stylex.props(styles.actionButton)}>
					<Search size={16} />
					FAQ
				</Link>
			</div>
		</div>
	);
}
