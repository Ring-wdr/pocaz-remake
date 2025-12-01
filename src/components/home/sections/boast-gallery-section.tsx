import * as stylex from "@stylexjs/stylex";
import Link from "next/link";

import {
	colors,
	fontSize,
	fontWeight,
	spacing,
} from "@/app/global-tokens.stylex";
import { api } from "@/utils/eden";
import { layoutStyles } from "../layout-constants.stylex";

const styles = stylex.create({
	boardBoast: {
		marginBottom: spacing.md,
	},
	subject: {
		marginBottom: spacing.sm,
	},
	subjectButton: {
		fontSize: fontSize.xl,
		fontWeight: fontWeight.extrabold,
		backgroundColor: "transparent",
		borderWidth: 0,
		padding: 0,
		cursor: "pointer",
		color: colors.textPrimary,
		textDecoration: "none",
	},
	subjectDesc: {
		color: colors.textMuted,
		fontSize: fontSize.md,
		cursor: "default",
		margin: 0,
	},
	boastGallery: {},
	boastGrid: {
		display: "grid",
		gridTemplateColumns: "repeat(3, 1fr)",
		gridTemplateRows: "repeat(3, 1fr)",
		listStyle: "none",
		margin: 0,
		padding: 0,
	},
	boastItem: {
		height: "144px",
	},
	boastButton: {
		display: "block",
		width: "100%",
		height: "100%",
		cursor: "pointer",
		backgroundColor: "transparent",
		borderWidth: 0,
		padding: 0,
	},
	boastImage: {
		width: "100%",
		height: "100%",
		objectFit: "cover",
	},
	placeholderImage: {
		width: "100%",
		height: "100%",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.bgSecondary,
		color: colors.textMuted,
		fontSize: fontSize.xs,
	},
	emptyState: {
		height: "432px", // 144px * 3 rows
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.bgSecondary,
		color: colors.textMuted,
		fontSize: fontSize.md,
		borderRadius: "8px",
	},
});

interface BoastPost {
	id: string;
	imageUrl: string | null;
}

async function getBoastPosts(): Promise<BoastPost[]> {
	const { data, error } = await api.posts.get({
		query: { limit: "9", category: "boast" },
	});

	if (error || !data) {
		return [];
	}

	return data.items.map((post) => ({
		id: post.id,
		imageUrl: post.images[0]?.imageUrl ?? null,
	}));
}

export default async function BoastGallerySection() {
	const posts = await getBoastPosts();

	return (
		<div {...stylex.props(styles.boardBoast)}>
			<div {...stylex.props(styles.subject)}>
				<Link href="/community/boast" {...stylex.props(styles.subjectButton)}>
					포꾸 자랑
				</Link>
				<h4 {...stylex.props(styles.subjectDesc)}>
					하늘 아래 똑같은 포카는 없다 🤩
				</h4>
			</div>
			<div {...stylex.props(styles.boastGallery)}>
				{posts.length === 0 ? (
					<div
						{...stylex.props(styles.emptyState, layoutStyles.boastGridMinHeight)}
					>
						아직 자랑 게시물이 없어요
					</div>
				) : (
					<ul {...stylex.props(styles.boastGrid)}>
						{posts.map((post) => (
							<li key={post.id} {...stylex.props(styles.boastItem)}>
								<Link
									href={`/community/posts/${post.id}`}
									{...stylex.props(styles.boastButton)}
								>
									{post.imageUrl ? (
										<img
											src={post.imageUrl}
											{...stylex.props(styles.boastImage)}
											alt="포꾸 자랑 업로드 이미지"
										/>
									) : (
										<div {...stylex.props(styles.placeholderImage)}>
											이미지 없음
										</div>
									)}
								</Link>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}
