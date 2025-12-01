import * as stylex from "@stylexjs/stylex";
import { Toaster } from "sonner";

import { Layout } from "@/components/home";
import { pretendard } from "@/fonts/pretendard";
import { colors } from "./global-tokens.stylex";
import "./app.css";

export const metadata = {
	title: "Pocaz",
	description: "Build something amazing",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			{...stylex.props(styles.html, styles.reset)}
			className={pretendard.className}
			lang="ko"
		>
			<body {...stylex.props(styles.reset, styles.body)}>
				<Toaster richColors position="top-center" />
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
