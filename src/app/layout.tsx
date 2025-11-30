import "./app.css";
import * as stylex from "@stylexjs/stylex";

import { globalTokens as $ } from "./global-tokens.stylex";

export const metadata = {
	title: "Pocaz",
	description: "Build something amazing",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html {...stylex.props(styles.html, styles.reset)} lang="en">
			<body {...stylex.props(styles.reset, styles.body)}>{children}</body>
		</html>
	);
}

const DARK = "@media (prefers-color-scheme: dark)";

const styles = stylex.create({
	html: {
		colorScheme: "light dark",
	},
	reset: {
		minHeight: "100%",
		margin: 0,
		padding: 0,
	},
	body: {
		color: `rgba(${$.foregroundR}, ${$.foregroundG}, ${$.foregroundB}, 1)`,
		backgroundImage: {
			default: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 50%, #f0f2f5 100%)",
			[DARK]: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
		},
		backgroundAttachment: "fixed",
	},
});
