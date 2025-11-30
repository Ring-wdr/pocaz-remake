import "./app.css";
import * as stylex from "@stylexjs/stylex";

import { Layout } from "@/components/home";
import { colors } from "./global-tokens.stylex";

export const metadata = {
	title: "Pocaz",
	description: "Build something amazing",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
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
		color: colors.textPrimary,
	},
});
