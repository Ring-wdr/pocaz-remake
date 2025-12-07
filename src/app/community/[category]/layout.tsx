import * as stylex from "@stylexjs/stylex";

import { PageHeader } from "@/components/community";
import { Footer } from "@/components/home";
import { colors } from "../../global-tokens.stylex";

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: colors.bgPrimary,
	},
});

export default function Layout(props: LayoutProps<"/community/[category]">) {
	return (
		<div {...stylex.props(styles.container)}>
			<PageHeader />
			{props.children}
			<Footer />
		</div>
	);
}
