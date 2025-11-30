import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { MainRecentPocaItem } from "@/components/home";

import { colors, fontSize, fontWeight, spacing } from "@/app/global-tokens.stylex";

const styles = stylex.create({
	newPoca: {
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
});

interface RecentPocaItem {
	id: number;
	groupName: string;
	stageName: string;
	pocaName: string;
	price: number;
	filePath: string;
}

// TODO: Replace with actual API call
async function getRecentPocaItems(): Promise<RecentPocaItem[]> {
	// 실제 API 연동 시:
	// const response = await fetch('/api/poca/recent', { next: { revalidate: 60 } });
	// return response.json();

	// Placeholder data
	return [
		{
			id: 6,
			groupName: "SEVENTEEN",
			stageName: "민규",
			pocaName: "FML 앨범 포카",
			price: 19000,
			filePath: "https://placehold.co/300x400/dbeafe/3b82f6?text=RECENT",
		},
		{
			id: 7,
			groupName: "Stray Kids",
			stageName: "방찬",
			pocaName: "ROCK-STAR 포카",
			price: 16000,
			filePath: "https://placehold.co/300x400/dbeafe/3b82f6?text=RECENT",
		},
		{
			id: 8,
			groupName: "NCT DREAM",
			stageName: "마크",
			pocaName: "ISTJ 앨범 포카",
			price: 14000,
			filePath: "https://placehold.co/300x400/dbeafe/3b82f6?text=RECENT",
		},
		{
			id: 9,
			groupName: "ENHYPEN",
			stageName: "성훈",
			pocaName: "DARK BLOOD 포카",
			price: 17000,
			filePath: "https://placehold.co/300x400/dbeafe/3b82f6?text=RECENT",
		},
		{
			id: 10,
			groupName: "TXT",
			stageName: "수빈",
			pocaName: "이름의 장 포카",
			price: 13000,
			filePath: "https://placehold.co/300x400/dbeafe/3b82f6?text=RECENT",
		},
	];
}

export default async function RecentPocaSection() {
	const items = await getRecentPocaItems();

	return (
		<div {...stylex.props(styles.newPoca)}>
			<div {...stylex.props(styles.subject)}>
				<Link href="/market" {...stylex.props(styles.subjectButton)}>
					최근 올라온 포카
				</Link>
				<h4 {...stylex.props(styles.subjectDesc)}>
					어제 컴백한 내 가수가 이 세계 포카?! ✨
				</h4>
			</div>
			<MainRecentPocaItem items={items} />
		</div>
	);
}
