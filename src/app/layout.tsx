import "./app.css";
import * as stylex from "@stylexjs/stylex";
import "remixicon/fonts/remixicon.css";

import { Layout } from "@/components/home";
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
		<html {...stylex.props(styles.html, styles.reset)} lang="ko">
			<body {...stylex.props(styles.reset, styles.body)}>
				<Layout>{children}</Layout>
			</body>
		</html>
	);
}

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
	},
});
