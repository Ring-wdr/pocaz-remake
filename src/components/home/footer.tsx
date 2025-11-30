import * as stylex from "@stylexjs/stylex";
import Link from "next/link";

const styles = stylex.create({
	footer: {
		padding: "14px",
		backgroundColor: "#000",
	},
	footerLogo: {},
	logoText: {
		color: "#fff",
		fontStyle: "italic",
		fontSize: "18px",
		fontWeight: 800,
	},
	logoLink: {
		color: "#fff",
		textDecoration: "none",
	},
	infoText: {
		color: "#71717a",
		fontSize: "12px",
		letterSpacing: "-0.05em",
	},
	linkText: {
		paddingRight: "4px",
		color: "#52525b",
		fontSize: "12px",
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
