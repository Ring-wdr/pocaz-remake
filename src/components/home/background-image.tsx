"use client";

import * as stylex from "@stylexjs/stylex";
import Image from "next/image";
import { useEffect, useState } from "react";

const MOBILE = "@media (max-width: 767px)" as const;
const DESKTOP_BREAKPOINT = 768;

const styles = stylex.create({
	bgFixed: {
		position: "fixed",
		top: 0,
		left: 0,
		width: "100vw",
		height: "100vh",
		zIndex: 0,
		pointerEvents: "none",
		backgroundColor: "#2563eb",
		display: {
			default: "block",
			[MOBILE]: "none",
		},
	},
	bgContent: {
		objectFit: "cover",
	},
});

export default function BackgroundImage() {
	const [showBg, setShowBg] = useState(false);

	useEffect(() => {
		setShowBg(window.innerWidth >= DESKTOP_BREAKPOINT);
	}, []);

	if (!showBg) return null;

	return (
		<div {...stylex.props(styles.bgFixed)}>
			<Image
				src="/pocaz_bg.png"
				alt="배경 이미지"
				fill
				priority
				sizes="100vw"
				{...stylex.props(styles.bgContent)}
			/>
		</div>
	);
}
