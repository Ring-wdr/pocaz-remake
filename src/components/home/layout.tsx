import * as stylex from "@stylexjs/stylex";
import { ChevronRight, Star } from "lucide-react";
import Link from "next/link";
import {
	colors,
	fontSize,
	fontWeight,
	radius,
	spacing,
} from "@/app/global-tokens.stylex";
import BackgroundImage from "./background-image";
import BottomMenu from "./bottom-menu";
import Header from "./header";
import ScrollTopButton from "./scroll-top-button";

const TABLET = "@media (max-width: 1023px)" as const;

const styles = stylex.create({
	wrapper: {
		position: "relative",
		minHeight: "100vh",
		backgroundColor: colors.accentPrimary,
	},
	contentLayer: {
		position: "relative",
		zIndex: 1,
		minHeight: "100vh",
	},
	txtBox: {
		position: "fixed",
		top: "50%",
		left: "50%",
		textAlign: "center",
		marginTop: "-120px",
		marginLeft: "-450px",
		display: {
			default: "block",
			[TABLET]: "none",
		},
	},
	txtBoxInner: {
		marginBottom: spacing.sm,
	},
	starText: {
		display: "flex",
		justifyContent: "center",
		fontSize: fontSize.md,
		fontWeight: fontWeight.bold,
		color: "#ffffff",
	},
	starIcon: {
		color: "#fef08a",
	},
	atozWrapper: {
		position: "relative",
		display: "inline-block",
		marginLeft: "6px",
	},
	atozBg: {
		position: "absolute",
		inset: "-4px",
		backgroundColor: "#000",
		transform: "skewY(-3deg)",
	},
	atozText: {
		position: "relative",
		padding: spacing.xxs,
		fontStyle: "italic",
		color: "#ffffff",
	},
	pocazTitle: {
		marginTop: spacing.md,
		marginBottom: spacing.md,
		color: "#ffffff",
		fontStyle: "italic",
		fontSize: "72px",
		fontWeight: fontWeight.black,
		letterSpacing: "-2px",
	},
	ctaButton: {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		marginTop: spacing.sm,
		marginBottom: spacing.sm,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.md,
		paddingRight: spacing.md,
		backgroundColor: "#27272a",
		color: "#ffffff",
		borderRadius: radius.sm,
		borderWidth: 0,
		cursor: "pointer",
		transition: "background-color 0.2s ease-in",
		":hover": {
			backgroundColor: "#18181b",
		},
	},
	ctaLink: {
		display: "inline-flex",
		alignItems: "center",
		gap: "4px",
		color: "#ffffff",
		textDecoration: "none",
	},
	mobileWrap: {
		position: {
			default: "absolute",
			[TABLET]: "static",
		},
		top: 0,
		right: 0,
		width: {
			default: "480px",
			[TABLET]: "100%",
		},
		marginRight: {
			default: "160px",
			[TABLET]: 0,
		},
		minHeight: "100vh",
		display: "flex",
		flexDirection: "column",
		backgroundColor: colors.bgPrimary,
	},
	mainContent: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
	},
});

interface LayoutProps {
	children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
	return (
		<div {...stylex.props(styles.wrapper)}>
			<BackgroundImage />
			<div {...stylex.props(styles.contentLayer)}>
				<div {...stylex.props(styles.txtBox)}>
					<div {...stylex.props(styles.txtBoxInner)}>
						<p {...stylex.props(styles.starText)}>
							<Star
								size={14}
								fill="currentColor"
								{...stylex.props(styles.starIcon)}
							/>
							IDOL PHOTO CARD
							<span {...stylex.props(styles.atozWrapper)}>
								<span {...stylex.props(styles.atozBg)} />
								<span {...stylex.props(styles.atozText)}>A to Z.</span>
							</span>
						</p>
					</div>
					<h2 {...stylex.props(styles.pocazTitle)}>POCAZ.</h2>
					<Link
						href="/market"
						{...stylex.props(styles.ctaButton, styles.ctaLink)}
					>
						내 최애 포카 찾으러 가기
						<ChevronRight size={18} />
					</Link>
				</div>
				<div {...stylex.props(styles.mobileWrap)}>
					<Header />
					<div {...stylex.props(styles.mainContent)}>{children}</div>
					<ScrollTopButton />
					<BottomMenu />
				</div>
			</div>
		</div>
	);
}
