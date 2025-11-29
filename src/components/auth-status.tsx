import Link from "next/link";
import { getUser, signOut } from "@/lib/auth/actions";

export async function AuthStatus() {
	const user = await getUser();

	if (!user) {
		return (
			<div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
				<Link
					href="/login"
					style={{
						padding: "0.5rem 1rem",
						backgroundColor: "#4285f4",
						color: "white",
						borderRadius: "4px",
						textDecoration: "none",
					}}
				>
					로그인
				</Link>
			</div>
		);
	}

	return (
		<div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
			<span style={{ fontSize: "0.875rem" }}>
				{user.email ?? user.user_metadata?.name ?? "사용자"}
			</span>
			{user.user_metadata?.avatar_url && (
				<img
					src={user.user_metadata.avatar_url}
					alt="Profile"
					style={{ width: "32px", height: "32px", borderRadius: "50%" }}
				/>
			)}
			<form action={signOut}>
				<button
					type="submit"
					style={{
						padding: "0.5rem 1rem",
						backgroundColor: "#6b7280",
						color: "white",
						border: "none",
						borderRadius: "4px",
						cursor: "pointer",
					}}
				>
					로그아웃
				</button>
			</form>
		</div>
	);
}
