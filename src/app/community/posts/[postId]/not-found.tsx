import * as stylex from "@stylexjs/stylex";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import {
	colors,
	fontSize,
	fontWeight,
	size,
	spacing,
} from "@/app/global-tokens.stylex";

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: colors.bgPrimary,
		minHeight: "100vh",
	},
	header: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
	},
	backButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: size.touchTarget,
		height: size.touchTarget,
		backgroundColor: "transparent",
		borderWidth: 0,
		cursor: "pointer",
		color: colors.textPrimary,
	},
	headerTitle: {
		fontSize: fontSize.lg,
		fontWeight: fontWeight.bold,
		color: colors.textPrimary,
		margin: 0,
	},
	placeholder: {
		width: size.touchTarget,
		height: size.touchTarget,
	},
	content: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		paddingTop: spacing.xxxl,
		paddingBottom: spacing.xxxl,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
	},
	message: {
		fontSize: fontSize.base,
		color: colors.textPlaceholder,
		margin: 0,
		marginBottom: spacing.md,
	},
	link: {
		fontSize: fontSize.md,
		color: colors.accentPrimary,
		textDecoration: "none",
	},
});

export default function PostNotFound() {
	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<Link href="/community" {...stylex.props(styles.backButton)}>
					<ArrowLeft size={24} />
				</Link>
				<h1 {...stylex.props(styles.headerTitle)}>게시글</h1>
				<div {...stylex.props(styles.placeholder)} />
			</header>

			<div {...stylex.props(styles.content)}>
				<p {...stylex.props(styles.message)}>게시글을 찾을 수 없습니다</p>
				<Link href="/community" {...stylex.props(styles.link)}>
					커뮤니티로 돌아가기
				</Link>
			</div>
		</div>
	);
}
