import * as stylex from "@stylexjs/stylex";

export const MOBILE_MEDIA = "@media (max-width: 767px)" as const;
export const TABLET_MEDIA = "@media (max-width: 1023px)" as const;

// Shared layout helpers to keep skeleton and loaded sections in sync.
export const layoutStyles = stylex.create({
	pocaSectionMinHeight: {
		minHeight: {
			default: "456px",
			[TABLET_MEDIA]: "552px",
			[MOBILE_MEDIA]: "408px",
		},
	},
	pocaEmptyHeight: {
		minHeight: {
			default: "350px",
			[TABLET_MEDIA]: "446px",
			[MOBILE_MEDIA]: "302px",
		},
	},
	sliderImageHeight: {
		height: {
			default: "288px",
			[TABLET_MEDIA]: "384px",
			[MOBILE_MEDIA]: "240px",
		},
	},
	boastGridMinHeight: {
		minHeight: "509px",
	},
	recentPostsMinHeight: {
		minHeight: "166px",
	},
});
