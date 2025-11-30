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

const styles = stylex.create({
	mainContentsWrap: {},
	contentSection: {
		paddingLeft: "14px",
		paddingRight: "14px",
		marginTop: "28px",
		backgroundColor: "#fff",
	},
});

export default function Home() {
	return (
		<>
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
		</>
	);
}
