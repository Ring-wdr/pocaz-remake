import * as stylex from "@stylexjs/stylex";
import dayjs from "dayjs";
import Link from "next/link";
import "remixicon/fonts/remixicon.css";

import {
	Footer,
	Layout,
	MainPocaItem,
	MainRecentPocaItem,
	MainSlider,
} from "@/components/home";

// Placeholder data for posts
const recentPosts = [
	{ id: 1, title: "르세라핌 김채원 포카 양도합니다", createAt: "2024-01-15" },
	{ id: 2, title: "뉴진스 하니 OMG 포카 구해요", createAt: "2024-01-14" },
	{ id: 3, title: "아이브 장원영 포카 교환 원해요", createAt: "2024-01-13" },
	{
		id: 4,
		title: "에스파 카리나 MY WORLD 포카 팝니다",
		createAt: "2024-01-12",
	},
	{ id: 5, title: "세븐틴 민규 FML 앨범 포카 양도", createAt: "2024-01-11" },
];

// Placeholder data for boast gallery
const boastPosts = [
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

const styles = stylex.create({
	mainContentsWrap: {},
	contentSection: {
		paddingLeft: "14px",
		paddingRight: "14px",
		marginTop: "28px",
		backgroundColor: "#fff",
	},
	boardWrap: {
		marginBottom: "24px",
	},
	sectionButton: {
		display: "flex",
		marginBottom: "14px",
		fontSize: "24px",
		fontWeight: 800,
		backgroundColor: "transparent",
		borderWidth: 0,
		padding: 0,
		cursor: "pointer",
		color: "#000",
		textDecoration: "none",
	},
	boardList: {},
	boardListUl: {
		listStyle: "none",
		margin: 0,
		padding: 0,
	},
	boardListItem: {},
	boardItemButton: {
		display: "flex",
		justifyContent: "space-between",
		width: "100%",
		marginBottom: "6px",
		cursor: "pointer",
		backgroundColor: "transparent",
		borderWidth: 0,
		padding: 0,
		textDecoration: "none",
	},
	boardItemTitle: {
		marginRight: "14px",
		fontSize: "14px",
		fontWeight: 400,
		whiteSpace: "nowrap",
		textOverflow: "ellipsis",
		overflow: "hidden",
		color: "#000",
		margin: 0,
	},
	boardItemTime: {
		fontSize: "14px",
		fontWeight: 400,
		color: "#000",
	},
	bestPoca: {
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
	newPoca: {
		marginBottom: "24px",
	},
	boardBoast: {
		marginBottom: "24px",
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

export default function Home() {
	return (
		<Layout>
			<div {...stylex.props(styles.mainContentsWrap)}>
				<MainSlider />

				<div {...stylex.props(styles.contentSection)}>
					{/* 최근 게시물 */}
					<div {...stylex.props(styles.boardWrap)}>
						<Link href="/community" {...stylex.props(styles.sectionButton)}>
							최근 게시물
							<i className="ri-arrow-drop-right-line" />
						</Link>
						<div {...stylex.props(styles.boardList)}>
							<ul {...stylex.props(styles.boardListUl)}>
								{recentPosts.slice(0, 5).map((post) => {
									const days = dayjs(post.createAt).format("YYYY-MM-DD");
									return (
										<li key={post.id} {...stylex.props(styles.boardListItem)}>
											<Link
												href={`/community/1/${post.id}`}
												{...stylex.props(styles.boardItemButton)}
											>
												<h4 {...stylex.props(styles.boardItemTitle)}>
													{post.title}
												</h4>
												<time {...stylex.props(styles.boardItemTime)}>
													{days}
												</time>
											</Link>
										</li>
									);
								})}
							</ul>
						</div>
					</div>

					{/* BEST 포카 */}
					<div {...stylex.props(styles.bestPoca)}>
						<div {...stylex.props(styles.subject)}>
							<Link href="/market" {...stylex.props(styles.subjectButton)}>
								BEST 포카
							</Link>
							<h4 {...stylex.props(styles.subjectDesc)}>
								내가 사는 포카〰️ 너를 위해 구매했지! 🍪
							</h4>
						</div>
						<MainPocaItem />
					</div>

					{/* 최근 올라온 포카 */}
					<div {...stylex.props(styles.newPoca)}>
						<div {...stylex.props(styles.subject)}>
							<Link href="/market" {...stylex.props(styles.subjectButton)}>
								최근 올라온 포카
							</Link>
							<h4 {...stylex.props(styles.subjectDesc)}>
								어제 컴백한 내 가수가 이 세계 포카?! ✨
							</h4>
						</div>
						<MainRecentPocaItem />
					</div>

					{/* 포꾸 자랑 */}
					<div {...stylex.props(styles.boardBoast)}>
						<div {...stylex.props(styles.subject)}>
							<Link
								href="/community/boast"
								{...stylex.props(styles.subjectButton)}
							>
								포꾸 자랑
							</Link>
							<h4 {...stylex.props(styles.subjectDesc)}>
								하늘 아래 똑같은 포카는 없다 🤩
							</h4>
						</div>
						<div {...stylex.props(styles.boastGallery)}>
							<ul {...stylex.props(styles.boastGrid)}>
								{boastPosts.slice(0, 9).map((post) => (
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
				</div>
			</div>
			<Footer />
		</Layout>
	);
}
