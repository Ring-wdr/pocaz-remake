import * as stylex from "@stylexjs/stylex";
import { Suspense } from "react";
import { Footer, MainSlider } from "@/components/home";
import {
	BestPocaSection,
	BoastGallerySection,
	RecentPocaSection,
	RecentPostsSection,
} from "@/components/home/sections";
import {
	BoastGallerySkeleton,
	PocaSliderSkeleton,
	RecentPostsSkeleton,
} from "@/components/home/skeletons";
import { createMetadata } from "@/lib/metadata";
import { colors } from "./global-tokens.stylex";

export const metadata = createMetadata({
	title: "POCAZ 홈 | 포토카드 마켓 & 커뮤니티",
	description: "베스트 포카, 최신 거래와 커뮤니티 소식을 한눈에 확인하세요.",
	path: "/",
	ogTitle: "POCAZ Home",
});

export const revalidate = 120;

const styles = stylex.create({
	container: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		backgroundColor: colors.bgPrimary,
	},
	mainContentsWrap: {
		flex: 1,
	},
	contentSection: {
		paddingLeft: "14px",
		paddingRight: "14px",
		marginTop: "28px",
		backgroundColor: colors.bgPrimary,
	},
});

export default function Home() {
	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.mainContentsWrap)}>
				<MainSlider />
				<div {...stylex.props(styles.contentSection)}>
					<Suspense fallback={<RecentPostsSkeleton />}>
						<RecentPostsSection />
					</Suspense>

					<Suspense fallback={<PocaSliderSkeleton />}>
						<BestPocaSection />
					</Suspense>

					<Suspense fallback={<PocaSliderSkeleton />}>
						<RecentPocaSection />
					</Suspense>

					<Suspense fallback={<BoastGallerySkeleton />}>
						<BoastGallerySection />
					</Suspense>
				</div>
			</div>
			<Footer />
		</div>
	);
}
