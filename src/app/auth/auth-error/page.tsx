import Link from "next/link";

export default function AuthErrorPage() {
	return (
		<div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
			<h1>인증 오류</h1>
			<p>로그인 중 오류가 발생했습니다.</p>
			<Link href="/login">다시 시도하기</Link>
		</div>
	);
}
