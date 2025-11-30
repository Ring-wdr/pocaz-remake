import * as stylex from "@stylexjs/stylex";
import { Filter } from "lucide-react";
import { Suspense } from "react";

import { ChatListSection } from "@/components/chat/sections";
import { ChatListSkeleton } from "@/components/chat/skeletons";
import { Footer } from "@/components/home";

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: "#fff",
	},
	content: {
		flex: 1,
		paddingTop: "20px",
		paddingLeft: "14px",
		paddingRight: "14px",
		paddingBottom: "24px",
	},
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: "16px",
	},
	title: {
		fontSize: "24px",
		fontWeight: 800,
		color: "#000",
		margin: 0,
	},
	filterButton: {
		display: "flex",
		alignItems: "center",
		gap: "4px",
		paddingTop: "6px",
		paddingBottom: "6px",
		paddingLeft: "12px",
		paddingRight: "12px",
		fontSize: "13px",
		fontWeight: 500,
		color: "#6b7280",
		backgroundColor: "#f3f4f6",
		borderRadius: "16px",
		borderWidth: 0,
		cursor: "pointer",
	},
});

export default function ChatListPage() {
	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.content)}>
				<div {...stylex.props(styles.header)}>
					<h1 {...stylex.props(styles.title)}>채팅</h1>
					<button type="button" {...stylex.props(styles.filterButton)}>
						<Filter size={14} />
						필터
					</button>
				</div>
				<Suspense fallback={<ChatListSkeleton />}>
					<ChatListSection />
				</Suspense>
			</div>
			<Footer />
		</div>
	);
}
