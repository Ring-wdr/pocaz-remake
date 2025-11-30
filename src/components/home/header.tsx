"use client";

import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { useEffect, useState } from "react";

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
		color: "#000",
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: "#ebebeb",
		boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
		animationName: fixHeader,
		animationDuration: "0.3s",
		zIndex: 501,
	},
	logo: {
		padding: "14px",
	},
	logoText: {
		fontStyle: "italic",
		fontSize: "30px",
		fontWeight: 900,
		letterSpacing: "-2px",
	},
	logoLink: {
		color: "inherit",
		textDecoration: "none",
	},
	logoDot: {
		color: "#034ac5",
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
