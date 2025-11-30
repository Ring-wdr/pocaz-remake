"use client";

import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { useEffect, useState } from "react";

import { colors, fontSize, fontWeight, spacing } from "@/app/global-tokens.stylex";

const fixHeader = stylex.keyframes({
	"0%": { top: "-5rem" },
	"100%": { top: "0" },
});

const styles = stylex.create({
	header: {
		position: "relative",
	},
	headerSticky: {
		position: "sticky",
		top: 0,
		left: 0,
		width: "100%",
		color: colors.textPrimary,
		backgroundColor: colors.bgPrimary,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
		boxShadow: colors.shadowLight,
		animationName: fixHeader,
		animationDuration: "0.3s",
		zIndex: 501,
	},
	logo: {
		padding: spacing.sm,
	},
	logoText: {
		fontStyle: "italic",
		fontSize: fontSize.xxl,
		fontWeight: fontWeight.black,
		letterSpacing: "-2px",
	},
	logoLink: {
		color: "inherit",
		textDecoration: "none",
	},
	logoDot: {
		color: colors.brandPrimary,
	},
});

export default function Header() {
	const [scrollPosition, setScrollPosition] = useState(0);

	useEffect(() => {
		const updateScroll = () => {
			setScrollPosition(window.scrollY || document.documentElement.scrollTop);
		};

		window.addEventListener("scroll", updateScroll);
		return () => {
			window.removeEventListener("scroll", updateScroll);
		};
	}, []);

	return (
		<header
			{...stylex.props(
				styles.header,
				scrollPosition >= 80 && styles.headerSticky,
			)}
		>
			<div {...stylex.props(styles.logo)}>
				<h1 {...stylex.props(styles.logoText)}>
					<Link href="/" {...stylex.props(styles.logoLink)}>
						POCAZ<span {...stylex.props(styles.logoDot)}>.</span>
					</Link>
				</h1>
			</div>
		</header>
	);
}
