import * as stylex from "@stylexjs/stylex";
import Link from "next/link";

const styles = stylex.create({
	boardBoast: {
		marginBottom: "24px",
	},
	subject: {
		marginBottom: "14px",
	},
	subjectButton: {
		fontSize: "24px",
		fontWeight: 800,
		backgroundColor: "transparent",
		borderWidth: 0,
		padding: 0,
		cursor: "pointer",
		color: "#000",
		textDecoration: "none",
	},
	subjectDesc: {
		color: "#6b7280",
		fontSize: "14px",
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
});

interface BoastPost {
	id: number;
	filePath: string;
}

// TODO: Replace with actual API call
async function getBoastPosts(): Promise<BoastPost[]> {
	// 실제 API 연동 시:
	// const response = await fetch('/api/posts/boast', { next: { revalidate: 60 } });
	// return response.json();

	// Placeholder data
	return [
		{ id: 1, filePath: "https://placehold.co/200x200/fef3c7/d97706?text=1" },
		{ id: 2, filePath: "https://placehold.co/200x200/fce7f3/db2777?text=2" },
		{ id: 3, filePath: "https://placehold.co/200x200/dbeafe/2563eb?text=3" },
		{ id: 4, filePath: "https://placehold.co/200x200/d1fae5/059669?text=4" },
		{ id: 5, filePath: "https://placehold.co/200x200/ede9fe/7c3aed?text=5" },
		{ id: 6, filePath: "https://placehold.co/200x200/fee2e2/dc2626?text=6" },
		{ id: 7, filePath: "https://placehold.co/200x200/fef9c3/ca8a04?text=7" },
		{ id: 8, filePath: "https://placehold.co/200x200/cffafe/0891b2?text=8" },
		{ id: 9, filePath: "https://placehold.co/200x200/f3e8ff/9333ea?text=9" },
	];
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
				<ul {...stylex.props(styles.boastGrid)}>
					{posts.slice(0, 9).map((post) => (
						<li key={post.id} {...stylex.props(styles.boastItem)}>
							<Link
								href={`/community/2/${post.id}`}
								{...stylex.props(styles.boastButton)}
							>
								<img
									src={post.filePath}
									{...stylex.props(styles.boastImage)}
									alt="포꾸 자랑 업로드 이미지"
								/>
							</Link>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
