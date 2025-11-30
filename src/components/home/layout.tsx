import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import BottomMenu from "./bottom-menu";
import Header from "./header";
import ScrollTopButton from "./scroll-top-button";

const MOBILE = "@media (max-width: 767px)" as const;
const TABLET = "@media (max-width: 1023px)" as const;

const styles = stylex.create({
	wrapper: {
		position: "relative",
		minHeight: "100vh",
		backgroundColor: "#000",
	},
	bgFixed: {
		position: "fixed",
		top: 0,
		left: 0,
		width: "100vw",
		height: "100vh",
		backgroundImage: {
			default: "url(/pocaz_bg.png)",
			[MOBILE]: "none",
		},
		backgroundSize: "cover",
		backgroundPosition: "center",
		zIndex: 0,
		pointerEvents: "none",
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
		marginBottom: "20px",
	},
	starText: {
		display: "flex",
		justifyContent: "center",
		fontSize: "14px",
		fontWeight: 700,
		color: "#fff",
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
		padding: "8px",
		fontStyle: "italic",
		color: "#fff",
	},
	pocazTitle: {
		marginTop: "24px",
		marginBottom: "24px",
		color: "#fff",
		fontStyle: "italic",
		fontSize: "72px",
		fontWeight: 900,
		letterSpacing: "-2px",
	},
	ctaButton: {
		marginTop: "20px",
		marginBottom: "20px",
		backgroundColor: "#27272a",
		color: "#fff",
		borderRadius: "8px",
		borderWidth: 0,
		cursor: "pointer",
		transition: "background-color 0.2s ease-in",
		":hover": {
			backgroundColor: "#18181b",
		},
	},
	ctaButtonInner: {
		display: "flex",
	},
	ctaLink: {
		paddingTop: "16px",
		paddingBottom: "16px",
		paddingLeft: "24px",
		paddingRight: "24px",
		color: "#fff",
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
		backgroundColor: "#fff",
	},
});

interface LayoutProps {
	children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
	return (
		<div {...stylex.props(styles.wrapper)}>
			<div {...stylex.props(styles.bgFixed)} />
			<div {...stylex.props(styles.contentLayer)}>
				<div {...stylex.props(styles.txtBox)}>
					<div {...stylex.props(styles.txtBoxInner)}>
						<p {...stylex.props(styles.starText)}>
							<i className="ri-star-fill" {...stylex.props(styles.starIcon)} />
							IDOL PHOTO CARD
							<span {...stylex.props(styles.atozWrapper)}>
								<span {...stylex.props(styles.atozBg)} />
								<span {...stylex.props(styles.atozText)}>A to Z.</span>
							</span>
						</p>
					</div>
					<h2 {...stylex.props(styles.pocazTitle)}>POCAZ.</h2>
					<button type="button" {...stylex.props(styles.ctaButton)}>
						<p {...stylex.props(styles.ctaButtonInner)}>
							<Link href="/market" {...stylex.props(styles.ctaLink)}>
								내 최애 포카 찾으러 가기
								<i className="ri-arrow-right-s-line" />
							</Link>
						</p>
					</button>
				</div>
				<div {...stylex.props(styles.mobileWrap)}>
					<Header />
					{children}
					<ScrollTopButton />
					<BottomMenu />
				</div>
			</div>
		</div>
	);
}
