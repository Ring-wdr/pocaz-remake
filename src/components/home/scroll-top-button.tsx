"use client";

import * as stylex from "@stylexjs/stylex";
import { ChevronUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const styles = stylex.create({
	wrapper: {
		position: "sticky",
		bottom: "25%",
		height: 0,
		cursor: "pointer",
		zIndex: 50,
	},
	topBtn: {
		position: "absolute",
		right: "14px",
		width: "40px",
		height: "40px",
		borderRadius: "50%",
		backgroundColor: "#000",
		opacity: 0,
		transition: "opacity 0.4s",
		visibility: "hidden",
	},
	topBtnActive: {
		opacity: 1,
		visibility: "visible",
	},
	button: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
		height: "100%",
		fontSize: "24px",
		color: "#fff",
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
	},
});

let timer: ReturnType<typeof setTimeout>;

export default function ScrollTopButton() {
	const [btnStatus, setBtnStatus] = useState(false);

	const handleFlow = useCallback(() => {
		if (timer) clearTimeout(timer);
		setBtnStatus(true);
		timer = setTimeout(() => setBtnStatus(false), 500);
	}, []);

	const handleTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
		setBtnStatus(false);
	};

	useEffect(() => {
		window.addEventListener("scroll", handleFlow);
		return () => {
			window.removeEventListener("scroll", handleFlow);
		};
	}, [handleFlow]);

	return (
		<div {...stylex.props(styles.wrapper)}>
			<h3 {...stylex.props(styles.topBtn, btnStatus && styles.topBtnActive)}>
				<button
					type="button"
					{...stylex.props(styles.button)}
					onClick={handleTop}
				>
					<ChevronUp size={24} />
				</button>
			</h3>
		</div>
	);
}
