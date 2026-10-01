import { unauthorized } from "next/navigation";
import { getSession } from "@/lib/auth/actions";

/**
 * 채팅 화면은 로그인이 필요하다. 로그인하지 않았으면 unauthorized.tsx(로그인 안내)를 보여준다.
 */
export default async function ChatLayout({ children }: LayoutProps<"/chat">) {
	const session = await getSession();
	if (!session) {
		unauthorized();
	}
	return children;
}
