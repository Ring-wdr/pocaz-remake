import * as stylex from "@stylexjs/stylex";

const MOBILE = "@media (max-width: 767px)" as const;
const TABLET = "@media (max-width: 1023px)" as const;

const shimmer = stylex.keyframes({
	"0%": { backgroundPosition: "-200% 0" },
	"100%": { backgroundPosition: "200% 0" },
});

const styles = stylex.create({
	container: {
		marginBottom: "24px",
	},
	header: {
		marginBottom: "14px",
	},
	titleSkeleton: {
		width: "100px",
		height: "28px",
		marginBottom: "4px",
		borderRadius: "4px",
		backgroundImage: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	descSkeleton: {
		width: "200px",
		height: "18px",
		borderRadius: "4px",
		backgroundImage: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	sliderContainer: {
		display: "flex",
		gap: "14px",
		overflow: "hidden",
	},
	card: {
		flexShrink: 0,
		width: "calc((100% - 28px) / 2.4)",
	},
	imageSkeleton: {
		height: {
			default: "288px",
			[TABLET]: "384px",
			[MOBILE]: "240px",
		},
		borderRadius: "12px",
		backgroundImage: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	infoContainer: {
		marginTop: "4px",
	},
	groupSkeleton: {
		width: "80px",
		height: "14px",
		marginBottom: "4px",
		borderRadius: "4px",
		backgroundImage: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	nameSkeleton: {
		width: "50px",
		height: "16px",
		marginBottom: "4px",
		borderRadius: "4px",
		backgroundImage: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	descLineSkeleton: {
		width: "100px",
		height: "14px",
		marginBottom: "4px",
		borderRadius: "4px",
		backgroundImage: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	priceSkeleton: {
		width: "120px",
		height: "18px",
		borderRadius: "4px",
		backgroundImage: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
		backgroundSize: "200% 100%",
		animationName: shimmer,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
});

export default function PocaSliderSkeleton() {
	return (
		<div {...stylex.props(styles.container)}>
			<div {...stylex.props(styles.header)}>
				<div {...stylex.props(styles.titleSkeleton)} />
				<div {...stylex.props(styles.descSkeleton)} />
			</div>
			<div {...stylex.props(styles.sliderContainer)}>
				{Array.from({ length: 3 }).map((_, index) => (
					<div key={index} {...stylex.props(styles.card)}>
						<div {...stylex.props(styles.imageSkeleton)} />
						<div {...stylex.props(styles.infoContainer)}>
							<div {...stylex.props(styles.groupSkeleton)} />
							<div {...stylex.props(styles.nameSkeleton)} />
							<div {...stylex.props(styles.descLineSkeleton)} />
							<div {...stylex.props(styles.priceSkeleton)} />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
