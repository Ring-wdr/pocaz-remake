import * as stylex from "@stylexjs/stylex";

import { CategoryTabsSection } from "@/components/community/sections";
import { PostListSkeleton } from "@/components/community/skeletons";
import {
	colors,
	fontSize,
	lineHeight,
	radius,
	spacing,
} from "../../global-tokens.stylex";

const styles = stylex.create({
	content: {
		flex: 1,
		paddingTop: "20px",
		paddingLeft: "14px",
		paddingRight: "14px",
		paddingBottom: "24px",
		display: "flex",
		flexDirection: "column",
		gap: 0,
	},
	searchSkeleton: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xxs,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		borderRadius: radius.md,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderPrimary,
		backgroundColor: colors.bgSecondary,
		width: "100%",
	},
	searchContainer: {
		marginBottom: spacing.sm,
	},
	searchIcon: {
		width: "18px",
		height: "18px",
		borderRadius: radius.xs,
		backgroundColor: colors.bgPrimary,
	},
	searchInput: {
		height: `calc(${fontSize.md} * ${lineHeight.normal})`,
		flex: 1,
		borderRadius: radius.xs,
		backgroundColor: colors.bgPrimary,
	},
});

export default function Loading() {
	return (
		<div {...stylex.props(styles.content)}>
			<CategoryTabsSection />

			<div {...stylex.props(styles.searchContainer)}>
				<div {...stylex.props(styles.searchSkeleton)}>
					<div {...stylex.props(styles.searchIcon)} />
					<div {...stylex.props(styles.searchInput)} />
				</div>
			</div>

			<PostListSkeleton />
		</div>
	);
}
