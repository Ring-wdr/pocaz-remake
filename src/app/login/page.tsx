import { signInWithGoogle } from "@/lib/auth/actions";

export default function LoginPage() {
	return (
		<div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
			<h1>로그인</h1>
			<form action={signInWithGoogle}>
				<button
					type="submit"
					style={{
						padding: "0.75rem 1.5rem",
						fontSize: "1rem",
						cursor: "pointer",
						backgroundColor: "#4285f4",
						color: "white",
						border: "none",
						borderRadius: "4px",
						width: "100%",
					}}
				>
					Google로 로그인
				</button>
			</form>
		</div>
	);
}
