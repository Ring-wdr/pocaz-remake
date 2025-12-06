import * as stylex from "@stylexjs/stylex";
import type { Metadata } from "next";
import { OverlayProvider } from "overlay-kit";
import { Toaster } from "sonner";
import { Layout } from "@/components/home";
import { pretendard } from "@/fonts/pretendard";
import { createMetadata } from "@/lib/metadata";
import { getBaseUrl } from "@/utils/url";
import { colors } from "./global-tokens.stylex";
import "./app.css";

export const metadata: Metadata = {
	...createMetadata({
		title: "POCAZ | 포토카드 마켓 & 커뮤니티",
		description:
			"최애 포토카드를 찾고 거래하고 자랑하는 포토카드 거래 커뮤니티",
		path: "/",
		ogTitle: "Home",
	}),
	metadataBase: new URL(getBaseUrl()),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			{...stylex.props(styles.html, styles.reset)}
			className={pretendard.className}
			lang="ko"
		>
			<body {...stylex.props(styles.reset, styles.body)}>
				<OverlayProvider>
					<Toaster richColors position="top-center" />
					<Layout>{children}</Layout>
				</OverlayProvider>
			</body>
		</html>
	);
}

const styles = stylex.create({
	html: {
		colorScheme: "light dark",
		backgroundColor: colors.accentPrimary,
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
