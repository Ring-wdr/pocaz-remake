"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect } from "react";

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#fff",
		paddingTop: "40px",
		paddingBottom: "40px",
		paddingLeft: "20px",
		paddingRight: "20px",
	},
	iconWrap: {
		width: "80px",
		height: "80px",
		borderRadius: "40px",
		backgroundColor: "#fee2e2",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: "24px",
	},
	icon: {
		fontSize: "40px",
		color: "#dc2626",
	},
	title: {
		fontSize: "24px",
		fontWeight: 700,
		color: "#111827",
		margin: 0,
		marginBottom: "12px",
		textAlign: "center",
	},
	description: {
		fontSize: "14px",
		color: "#6b7280",
		margin: 0,
		marginBottom: "32px",
		textAlign: "center",
		lineHeight: 1.6,
	},
	buttonGroup: {
		display: "flex",
		gap: "12px",
	},
	retryButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: "8px",
		paddingTop: "14px",
		paddingBottom: "14px",
		paddingLeft: "24px",
		paddingRight: "24px",
		fontSize: "15px",
		fontWeight: 600,
		color: "#fff",
		backgroundColor: "#000",
		borderRadius: "12px",
		borderWidth: 0,
		cursor: "pointer",
		transition: "background-color 0.2s ease",
	},
	homeButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: "8px",
		paddingTop: "14px",
		paddingBottom: "14px",
		paddingLeft: "24px",
		paddingRight: "24px",
		fontSize: "15px",
		fontWeight: 600,
		color: "#374151",
		backgroundColor: "#f3f4f6",
		borderRadius: "12px",
		textDecoration: "none",
		transition: "background-color 0.2s ease",
	},
});

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
	useEffect(() => {
		console.error("Error:", error);
	}, [error]);

	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.iconWrap)}>
				<i className="ri-bug-line" {...stylex.props(styles.icon)} />
			</div>
			<h1 {...stylex.props(styles.title)}>문제가 발생했습니다</h1>
			<p {...stylex.props(styles.description)}>
				일시적인 오류가 발생했어요.
				<br />
				잠시 후 다시 시도해주세요.
			</p>
			<div {...stylex.props(styles.buttonGroup)}>
				<button
					type="button"
					onClick={reset}
					{...stylex.props(styles.retryButton)}
				>
					<i className="ri-refresh-line" />
					다시 시도
				</button>
				<a href="/" {...stylex.props(styles.homeButton)}>
					<i className="ri-home-line" />
					홈으로
				</a>
			</div>
		</div>
	);
}
