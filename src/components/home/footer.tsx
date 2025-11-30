import * as stylex from "@stylexjs/stylex";
import Link from "next/link";

import { colors, fontSize, fontWeight, spacing } from "@/app/global-tokens.stylex";

const styles = stylex.create({
	footer: {
		padding: spacing.sm,
		backgroundColor: colors.bgInverse,
	},
	footerLogo: {},
	logoText: {
		color: colors.textInverse,
		fontStyle: "italic",
		fontSize: fontSize.lg,
		fontWeight: fontWeight.extrabold,
	},
	logoLink: {
		color: colors.textInverse,
		textDecoration: "none",
	},
	infoText: {
		color: colors.footerText,
		fontSize: fontSize.sm,
		letterSpacing: "-0.05em",
	},
	linkText: {
		paddingRight: spacing.xxxs,
		color: colors.footerTextMuted,
		fontSize: fontSize.sm,
		textDecoration: "none",
	},
});

export default function Footer() {
	return (
		<footer {...stylex.props(styles.footer)}>
			<div {...stylex.props(styles.footerLogo)}>
				<h6 {...stylex.props(styles.logoText)}>
					<Link href="/" {...stylex.props(styles.logoLink)}>
						POCAZ.
					</Link>
				</h6>
			</div>
			<p {...stylex.props(styles.infoText)}>
				서울특별시 영등포구 선유로9길 30 106동 청년취업사관학교 영등포캠퍼스
			</p>
			<p {...stylex.props(styles.infoText)}>
				Copyright by POCAZ. All rights reserved.
			</p>
			<a
				{...stylex.props(styles.linkText)}
				href="#notion1"
				target="_blank"
				rel="noreferrer"
			>
				개인정보처리방침 |
			</a>
			<a
				{...stylex.props(styles.linkText)}
				href="#notion2"
				target="_blank"
				rel="noreferrer"
			>
				이용약관
			</a>
		</footer>
	);
}
