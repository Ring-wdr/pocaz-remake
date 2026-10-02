"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { loginHref } from "@/utils/url";

type LoginLinkProps = Omit<ComponentProps<typeof Link>, "href">;

/**
 * 로그인 화면으로 가는 링크. 지금 보고 있는 경로를 `?redirect=`로 붙여서,
 * 로그인하고 나면 이 화면으로 돌아오게 한다. (쿼리스트링은 보존하지 않고 경로만 넘긴다)
 */
export function LoginLink(props: LoginLinkProps) {
	const pathname = usePathname();

	return <Link {...props} href={loginHref(pathname)} />;
}
