import * as stylex from "@stylexjs/stylex";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ChatListAllContent } from "@/components/chat/sections/chat-list-all-content";
import { ChatListContent } from "@/components/chat/sections/chat-list-content";
import { Footer } from "@/components/home";
import { FixedPageHeader, fixedHeaderStyles } from "@/components/ui";
import { createMetadata } from "@/lib/metadata";
import { colors, spacing } from "../../global-tokens.stylex";

export const metadata = createMetadata({
	title: "채팅 목록 | POCAZ",
	description: "거래 중인 포토카드와 대화를 한곳에서 확인하세요.",
	path: "/chat/list",
	ogTitle: "Chat List",
});

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: colors.bgPrimary,
	},
	content: {
		flex: 1,
		paddingTop: spacing.md,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		paddingBottom: spacing.lg,
	},
});

export default async function ChatListPage({
	searchParams,
}: PageProps<"/chat/list">) {
	const { marketId } = await searchParams;
	const firstMarketId = Array.isArray(marketId) ? marketId[0] : marketId;

	return (
		<div {...stylex.props(styles.container)}>
			<FixedPageHeader
				title={marketId ? "거래 채팅" : "채팅"}
				leading={
					firstMarketId ? (
						<Link
							href="/chat/list"
							{...stylex.props(fixedHeaderStyles.roundButton)}
						>
							<ArrowLeft size={20} />
						</Link>
					) : undefined
				}
			/>
			<div {...stylex.props(styles.content)}>
				{firstMarketId ? (
					<ChatListContent marketId={firstMarketId} />
				) : (
					<ChatListAllContent />
				)}
			</div>
			<Footer />
		</div>
	);
}
