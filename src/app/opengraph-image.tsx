import { ImageResponse } from "next/og";
import type { CSSProperties } from "react";

export const alt = "POCAZ open graph image";

const brandStyle = {
	fontSize: 96,
	fontWeight: 900,
	fontStyle: "italic",
	letterSpacing: -4,
	color: "#f8fafc",
	display: "flex",
	alignItems: "center",
	gap: 4,
} satisfies CSSProperties;

export default async function Image() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: "72px",
				backgroundColor: "#0b1224",
				backgroundImage:
					"radial-gradient(100% 100% at 20% 20%, #1d4ed8 0%, rgba(13,18,36,0) 60%)",
				color: "#e2e8f0",
				position: "relative",
				overflow: "hidden",
				fontFamily: "Inter, 'Noto Sans KR', system-ui, sans-serif",
			}}
		>
			<div
				style={{
					position: "absolute",
					inset: 24,
					border: "1px solid rgba(255,255,255,0.08)",
					borderRadius: 32,
					background:
						"linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
					backdropFilter: "blur(8px)",
				}}
			/>

			<div
				style={{
					position: "absolute",
					top: -120,
					right: -80,
					width: 420,
					height: 420,
					borderRadius: "50%",
					background:
						"radial-gradient(circle, rgba(99,102,241,0.45) 0, rgba(99,102,241,0) 60%)",
					filter: "blur(10px)",
				}}
			/>

			<div
				style={{
					position: "relative",
					display: "flex",
					flexDirection: "column",
					alignItems: "flex-start",
					width: "100%",
					height: "100%",
					justifyContent: "center",
					padding: "32px 48px",
					borderRadius: 24,
					boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
					background:
						"linear-gradient(145deg, rgba(21, 24, 40, 0.9), rgba(23, 37, 84, 0.75))",
				}}
			>
				<div style={brandStyle}>
					<span>POCAZ</span>
					<span style={{ color: "#60a5fa" }}>.</span>
				</div>
				<p
					style={{
						marginTop: 8,
						marginBottom: 0,
						fontSize: 26,
						color: "#cbd5e1",
						maxWidth: 720,
						lineHeight: 1.4,
					}}
				>
					최애 포토카드를 찾고 거래하고 자랑하는 포토카드 거래 커뮤니티.
				</p>
			</div>
		</div>,
		{
			width: 1200,
			height: 630,
		},
	);
}
