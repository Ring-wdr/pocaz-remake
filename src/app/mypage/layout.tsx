import { unauthorized } from "next/navigation";
import { getSession } from "@/lib/auth/actions";

/**
 * 마이페이지의 모든 화면은 로그인이 필요하다. 로그인하지 않았으면 unauthorized.tsx(로그인 안내)를 보여준다.
 * 하위 화면들이 401 응답을 빈 목록으로 그리지 않도록 여기서 한 번에 막는다.
 */
export default async function MyPageLayout({
	children,
}: LayoutProps<"/mypage">) {
	const session = await getSession();
	if (!session) {
		unauthorized();
	}
	return children;
}
