import * as stylex from "@stylexjs/stylex";
import { Suspense } from "react";
import { SuspenseTest } from "@/components/suspense-test";
import { globalTokens as $, spacing, text } from "./global-tokens.stylex";

export default function Home() {
	return (
		<main {...stylex.props(styles.main)}>
			{/* Hero Section */}
			<section {...stylex.props(styles.hero)}>
				<div {...stylex.props(styles.heroGlow)} />
				<h1 {...stylex.props(styles.title)}>
					Build Something
					<span {...stylex.props(styles.gradient)}> Amazing</span>
					<Suspense fallback={<div>Loading...</div>}>
						<SuspenseTest />
					</Suspense>
				</h1>
				<p {...stylex.props(styles.subtitle)}>
					Create modern web applications with cutting-edge technology. Fast,
					scalable, and beautifully designed.
				</p>
				<div {...stylex.props(styles.buttonGroup)}>
					<button {...stylex.props(styles.button, styles.primaryButton)}>
						Get Started
					</button>
					<button {...stylex.props(styles.button, styles.secondaryButton)}>
						Learn More
					</button>
				</div>
			</section>

			{/* Features Section */}
			<section {...stylex.props(styles.features)}>
				<div {...stylex.props(styles.featureCard)}>
					<div {...stylex.props(styles.featureIcon)}>⚡</div>
					<h3 {...stylex.props(styles.featureTitle)}>Lightning Fast</h3>
					<p {...stylex.props(styles.featureDesc)}>
						Optimized for speed with modern build tools and efficient rendering.
					</p>
				</div>
				<div {...stylex.props(styles.featureCard)}>
					<div {...stylex.props(styles.featureIcon)}>🎨</div>
					<h3 {...stylex.props(styles.featureTitle)}>Beautiful Design</h3>
					<p {...stylex.props(styles.featureDesc)}>
						Clean and modern aesthetics with attention to every detail.
					</p>
				</div>
				<div {...stylex.props(styles.featureCard)}>
					<div {...stylex.props(styles.featureIcon)}>🔧</div>
					<h3 {...stylex.props(styles.featureTitle)}>Easy to Customize</h3>
					<p {...stylex.props(styles.featureDesc)}>
						Flexible architecture that adapts to your specific needs.
					</p>
				</div>
			</section>

			{/* Footer */}
			<footer {...stylex.props(styles.footer)}>
				<p {...stylex.props(styles.footerText)}>Built with Next.js & StyleX</p>
			</footer>
		</main>
	);
}

const MEDIA_MOBILE = "@media (max-width: 768px)" as const;
const DARK = "@media (prefers-color-scheme: dark)";

const shimmer = stylex.keyframes({
	"0%": { backgroundPosition: "-200% 0" },
	"100%": { backgroundPosition: "200% 0" },
});

const float = stylex.keyframes({
	"0%, 100%": { transform: "translateY(0px)" },
	"50%": { transform: "translateY(-20px)" },
});

const styles = stylex.create({
	main: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		minHeight: "100vh",
		paddingInline: spacing.lg,
		paddingTop: spacing.xxxxl,
		paddingBottom: spacing.xl,
		position: "relative",
		overflow: "hidden",
	},
	hero: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		textAlign: "center",
		maxWidth: "800px",
		marginBottom: spacing.xxxxl,
		position: "relative",
		zIndex: 1,
	},
	heroGlow: {
		position: "absolute",
		top: "-150px",
		left: "50%",
		transform: "translateX(-50%)",
		width: "600px",
		height: "600px",
		backgroundImage: {
			default:
				"radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
			[DARK]:
				"radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)",
		},
		borderRadius: "50%",
		pointerEvents: "none",
		animationName: float,
		animationDuration: "6s",
		animationIterationCount: "infinite",
		animationTimingFunction: "ease-in-out",
	},
	title: {
		fontSize: {
			default: text.h1,
			[MEDIA_MOBILE]: text.h2,
		},
		fontWeight: 700,
		fontFamily: $.fontSans,
		lineHeight: 1.1,
		marginBottom: spacing.lg,
		color: {
			default: "#1a1a2e",
			[DARK]: "#ffffff",
		},
	},
	gradient: {
		backgroundImage:
			"linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
		backgroundSize: "200% auto",
		backgroundClip: "text",
		color: "transparent",
		animationName: shimmer,
		animationDuration: "3s",
		animationIterationCount: "infinite",
		animationTimingFunction: "linear",
	},
	subtitle: {
		fontSize: text.h5,
		fontFamily: $.fontSans,
		lineHeight: 1.6,
		color: {
			default: "#64748b",
			[DARK]: "#94a3b8",
		},
		maxWidth: "600px",
		marginBottom: spacing.xl,
	},
	buttonGroup: {
		display: "flex",
		gap: spacing.md,
		flexWrap: "wrap",
		justifyContent: "center",
	},
	button: {
		paddingBlock: spacing.sm,
		paddingInline: spacing.lg,
		fontSize: text.p,
		fontFamily: $.fontSans,
		fontWeight: 600,
		borderRadius: "12px",
		borderWidth: 0,
		borderStyle: "none",
		cursor: "pointer",
		transition: "all 0.2s ease",
	},
	primaryButton: {
		backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
		color: "#ffffff",
		boxShadow: {
			default: "0 4px 14px rgba(102, 126, 234, 0.4)",
			":hover": "0 6px 20px rgba(102, 126, 234, 0.6)",
		},
		transform: {
			default: "translateY(0)",
			":hover": "translateY(-2px)",
		},
	},
	secondaryButton: {
		backgroundColor: {
			default: "rgba(255, 255, 255, 0.8)",
			[DARK]: "rgba(255, 255, 255, 0.1)",
		},
		color: {
			default: "#1a1a2e",
			[DARK]: "#ffffff",
		},
		borderWidth: "1px",
		borderStyle: "solid",
		borderColor: {
			default: "rgba(0, 0, 0, 0.1)",
			[DARK]: "rgba(255, 255, 255, 0.2)",
		},
		transform: {
			default: "translateY(0)",
			":hover": "translateY(-2px)",
		},
		boxShadow: {
			default: "none",
			":hover": "0 4px 12px rgba(0, 0, 0, 0.1)",
		},
	},
	features: {
		display: "grid",
		gridTemplateColumns: {
			default: "repeat(3, 1fr)",
			[MEDIA_MOBILE]: "1fr",
		},
		gap: spacing.lg,
		maxWidth: "1000px",
		width: "100%",
		marginBottom: spacing.xxxxl,
	},
	featureCard: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		textAlign: "center",
		padding: spacing.xl,
		borderRadius: "20px",
		backgroundColor: {
			default: "rgba(255, 255, 255, 0.7)",
			[DARK]: "rgba(255, 255, 255, 0.05)",
		},
		backdropFilter: "blur(10px)",
		borderWidth: "1px",
		borderStyle: "solid",
		borderColor: {
			default: "rgba(255, 255, 255, 0.8)",
			[DARK]: "rgba(255, 255, 255, 0.1)",
		},
		boxShadow: {
			default: "0 4px 24px rgba(0, 0, 0, 0.06)",
			":hover": "0 8px 32px rgba(0, 0, 0, 0.1)",
		},
		transition: "all 0.3s ease",
		transform: {
			default: "translateY(0)",
			":hover": "translateY(-4px)",
		},
	},
	featureIcon: {
		fontSize: "48px",
		marginBottom: spacing.md,
	},
	featureTitle: {
		fontSize: text.h4,
		fontWeight: 600,
		fontFamily: $.fontSans,
		marginBottom: spacing.sm,
		color: {
			default: "#1a1a2e",
			[DARK]: "#ffffff",
		},
	},
	featureDesc: {
		fontSize: text.p,
		fontFamily: $.fontSans,
		lineHeight: 1.6,
		color: {
			default: "#64748b",
			[DARK]: "#94a3b8",
		},
	},
	footer: {
		marginTop: "auto",
		paddingTop: spacing.xl,
	},
	footerText: {
		fontSize: text.sm,
		fontFamily: $.fontSans,
		color: {
			default: "#94a3b8",
			[DARK]: "#64748b",
		},
	},
});
