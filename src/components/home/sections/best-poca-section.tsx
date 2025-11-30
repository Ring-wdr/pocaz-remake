import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { MainPocaItem } from "@/components/home";

const styles = stylex.create({
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
});

interface BestPocaItem {
	id: number;
	groupName: string;
	stageName: string;
	pocaName: string;
	price: number;
	pocaImg: string;
}

// TODO: Replace with actual API call
async function getBestPocaItems(): Promise<BestPocaItem[]> {
	// 실제 API 연동 시:
	// const response = await fetch('/api/poca/best', { next: { revalidate: 300 } });
	// return response.json();

	// Placeholder data
	return [
		{
			id: 1,
			groupName: "LE SSERAFIM",
			stageName: "김채원",
			pocaName: "FEARLESS 앨범 포카",
			price: 15000,
			pocaImg: "https://placehold.co/300x400/e2e8f0/64748b?text=PHOTOCARD",
		},
		{
			id: 2,
			groupName: "NewJeans",
			stageName: "하니",
			pocaName: "OMG 특전 포카",
			price: 25000,
			pocaImg: "https://placehold.co/300x400/e2e8f0/64748b?text=PHOTOCARD",
		},
		{
			id: 3,
			groupName: "IVE",
			stageName: "장원영",
			pocaName: "I AM 앨범 포카",
			price: 18000,
			pocaImg: "https://placehold.co/300x400/e2e8f0/64748b?text=PHOTOCARD",
		},
		{
			id: 4,
			groupName: "aespa",
			stageName: "카리나",
			pocaName: "MY WORLD 포카",
			price: 22000,
			pocaImg: "https://placehold.co/300x400/e2e8f0/64748b?text=PHOTOCARD",
		},
		{
			id: 5,
			groupName: "THE BOYZ",
			stageName: "주연",
			pocaName: "PHANTASY 포카",
			price: 12000,
			pocaImg: "https://placehold.co/300x400/e2e8f0/64748b?text=PHOTOCARD",
		},
	];
}

export default async function BestPocaSection() {
	const items = await getBestPocaItems();

	return (
		<div {...stylex.props(styles.bestPoca)}>
			<div {...stylex.props(styles.subject)}>
				<Link href="/market" {...stylex.props(styles.subjectButton)}>
					BEST 포카
				</Link>
				<h4 {...stylex.props(styles.subjectDesc)}>
					내가 사는 포카〰️ 너를 위해 구매했지! 🍪
				</h4>
			</div>
			<MainPocaItem items={items} />
		</div>
	);
}
