import * as stylex from "@stylexjs/stylex";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, type ReactNode } from "react";

import {
	colors,
	fontSize,
	fontWeight,
	radius,
	size,
	spacing,
} from "@/app/global-tokens.stylex";
import { Footer } from "@/components/home";
import { Avatar } from "@/components/ui";
import UserMarketList from "@/components/users/user-market-list";
import UserReviewList from "@/components/users/user-review-list";
import { getCurrentUser } from "@/lib/auth/actions";
import { createMetadata } from "@/lib/metadata";
import { formatKoreanDate } from "@/utils/date";
import { api } from "@/utils/eden";

/** 한 번에 가져오는 상품·후기 수. "더 보기"도 같은 값을 쓴다 */
const PAGE_SIZE = 20;

type ProfileTab = "markets" | "reviews";

const TABS: { id: ProfileTab; label: string }[] = [
	{ id: "markets", label: "판매 상품" },
	{ id: "reviews", label: "후기" },
];

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: colors.bgPrimary,
	},
	header: {
		display: "flex",
		alignItems: "center",
		gap: spacing.xs,
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
		color: colors.textSecondary,
		backgroundColor: "transparent",
		borderWidth: 0,
		borderRadius: radius.sm,
		textDecoration: "none",
	},
	headerTitle: {
		flex: 1,
		fontSize: fontSize.lg,
		fontWeight: fontWeight.semibold,
		color: colors.textSecondary,
		margin: 0,
	},
	content: {
		flex: 1,
		paddingTop: spacing.md,
		paddingBottom: spacing.lg,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
	},
	profile: {
		display: "flex",
		alignItems: "center",
		gap: spacing.sm,
		marginBottom: spacing.sm,
	},
	profileInfo: {
		flex: 1,
		minWidth: 0,
	},
	nickname: {
		margin: 0,
		marginBottom: spacing.xxxs,
		fontSize: fontSize.lg,
		fontWeight: fontWeight.bold,
		color: colors.textPrimary,
		overflowWrap: "anywhere",
	},
	joinedAt: {
		margin: 0,
		fontSize: fontSize.md,
		color: colors.textMuted,
	},
	editLink: {
		flexShrink: 0,
		paddingTop: spacing.xxs,
		paddingBottom: spacing.xxs,
		paddingLeft: spacing.xs,
		paddingRight: spacing.xs,
		fontSize: fontSize.md,
		fontWeight: fontWeight.medium,
		color: colors.textTertiary,
		backgroundColor: colors.bgTertiary,
		borderRadius: radius.sm,
		textDecoration: "none",
		whiteSpace: "nowrap",
	},
	stats: {
		margin: 0,
		marginBottom: spacing.md,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		paddingLeft: spacing.sm,
		paddingRight: spacing.sm,
		fontSize: fontSize.md,
		color: colors.textTertiary,
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.md,
		textAlign: "center",
	},
	tabs: {
		display: "flex",
		marginBottom: spacing.sm,
	},
	tab: {
		flex: 1,
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		fontSize: fontSize.md,
		fontWeight: fontWeight.semibold,
		textAlign: "center",
		textDecoration: "none",
		color: colors.textMuted,
		borderBottomWidth: 2,
		borderBottomStyle: "solid",
		borderBottomColor: colors.borderPrimary,
	},
	tabActive: {
		color: colors.textPrimary,
		borderBottomColor: colors.textPrimary,
	},
	listError: {
		margin: 0,
		paddingTop: spacing.xl,
		paddingBottom: spacing.xl,
		textAlign: "center",
		fontSize: fontSize.md,
		color: colors.statusError,
	},
});

/**
 * 프로필 조회. 없는 사용자·탈퇴한 사용자(404)와 잘못된 주소(4xx)는 null이라 404 화면으로 보내고,
 * 서버 오류처럼 그 밖의 실패는 던져서 오류 화면을 보인다(없는 프로필로 오해하지 않게).
 */
const getProfile = cache(async (userId: string) => {
	const { data, error } = await api.users({ id: userId }).get();
	if (error && error.status >= 400 && error.status < 500) return null;
	if (error || !data) {
		throw new Error(`사용자 프로필을 불러오지 못했습니다: ${userId}`);
	}
	return data;
});

type Profile = NonNullable<Awaited<ReturnType<typeof getProfile>>>;

/** 거래 n회 · 평점 n.n(후기 n) · 판매중 n. 후기가 없으면 평점 대신 안내 문구 */
function formatStats(profile: Profile) {
	const rating =
		profile.averageRating === null
			? "아직 후기 없음"
			: `평점 ${profile.averageRating.toFixed(1)}(후기 ${profile.reviewCount})`;
	return [
		`거래 ${profile.tradeCount}회`,
		rating,
		`판매중 ${profile.activeMarketCount}`,
	].join(" · ");
}

function ListError({ children }: { children: string }) {
	return (
		<p role="alert" {...stylex.props(styles.listError)}>
			{children}
		</p>
	);
}

function parseTab(value: string | string[] | undefined): ProfileTab {
	const tab = Array.isArray(value) ? value[0] : value;
	return tab === "reviews" ? "reviews" : "markets";
}

/** 첫 페이지 상품. 실패하면 null이라 빈 목록과 구분해 안내한다 */
async function getMarketsPage(userId: string) {
	const { data, error } = await api.markets
		.user({ userId })
		.get({ query: { limit: PAGE_SIZE } });
	return error || !data ? null : data;
}

/** 첫 페이지 후기. 실패하면 null */
async function getReviewsPage(userId: string) {
	const { data, error } = await api
		.users({ id: userId })
		.reviews.get({ query: { limit: PAGE_SIZE } });
	return error || !data ? null : data;
}

export async function generateMetadata({
	params,
}: PageProps<"/users/[userId]">): Promise<Metadata> {
	const { userId } = await params;
	const profile = await getProfile(userId);

	if (!profile) {
		return createMetadata({
			title: "프로필을 찾을 수 없습니다 | POCAZ",
			description: "요청한 사용자의 프로필을 불러올 수 없습니다.",
			path: `/users/${userId}`,
			type: "profile",
		});
	}

	return createMetadata({
		title: `${profile.nickname}님의 프로필 | POCAZ`,
		description: `${profile.nickname}님의 판매 상품과 거래 후기를 확인해 보세요. ${formatStats(profile)}`,
		path: `/users/${userId}`,
		type: "profile",
	});
}

export default async function UserProfilePage({
	params,
	searchParams,
}: PageProps<"/users/[userId]">) {
	const [{ userId }, query] = await Promise.all([params, searchParams]);
	const tab = parseTab(query.tab);

	// 사용자 조회와 탭 목록은 서로 기다릴 필요가 없다. 없는 사용자면 목록은 쓰지 않고 404를 낸다
	const [profile, currentUser, marketsPage, reviewsPage] = await Promise.all([
		getProfile(userId),
		getCurrentUser(),
		tab === "markets" ? getMarketsPage(userId) : null,
		tab === "reviews" ? getReviewsPage(userId) : null,
	]);

	if (!profile) {
		notFound();
	}

	const isMe = currentUser?.id === profile.id;

	let tabContent: ReactNode;
	if (tab === "markets") {
		tabContent = marketsPage ? (
			<UserMarketList
				key={userId}
				userId={userId}
				initialPage={marketsPage}
				limit={PAGE_SIZE}
			/>
		) : (
			<ListError>
				상품을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
			</ListError>
		);
	} else {
		tabContent = reviewsPage ? (
			<UserReviewList
				key={userId}
				userId={userId}
				initialPage={reviewsPage}
				limit={PAGE_SIZE}
			/>
		) : (
			<ListError>
				후기를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
			</ListError>
		);
	}

	return (
		<div {...stylex.props(styles.container)}>
			<header {...stylex.props(styles.header)}>
				<Link
					aria-label="마켓으로 돌아가기"
					href="/market"
					{...stylex.props(styles.backButton)}
				>
					<ArrowLeft size={20} />
				</Link>
				<h1 {...stylex.props(styles.headerTitle)}>프로필</h1>
			</header>

			<main {...stylex.props(styles.content)}>
				<section aria-label="프로필 정보" {...stylex.props(styles.profile)}>
					<Avatar
						size="xl"
						src={profile.profileImage ?? undefined}
						alt={`${profile.nickname} 프로필 사진`}
					/>
					<div {...stylex.props(styles.profileInfo)}>
						<h2 {...stylex.props(styles.nickname)}>{profile.nickname}</h2>
						<p {...stylex.props(styles.joinedAt)}>
							{formatKoreanDate(profile.createdAt)} 가입
						</p>
					</div>
					{isMe && (
						<Link href="/mypage/edit" {...stylex.props(styles.editLink)}>
							프로필 수정
						</Link>
					)}
				</section>

				<p {...stylex.props(styles.stats)}>{formatStats(profile)}</p>

				<nav aria-label="프로필 탭" {...stylex.props(styles.tabs)}>
					{TABS.map(({ id, label }) => (
						<Link
							key={id}
							href={`/users/${userId}?tab=${id}`}
							scroll={false}
							aria-current={id === tab ? "page" : undefined}
							{...stylex.props(styles.tab, id === tab && styles.tabActive)}
						>
							{label}
						</Link>
					))}
				</nav>

				{tabContent}
			</main>

			<Footer />
		</div>
	);
}
