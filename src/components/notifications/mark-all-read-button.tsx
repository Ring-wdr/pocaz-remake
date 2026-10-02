"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import {
	notificationsQueryKey,
	notificationUnreadCountQueryOptions,
} from "@/lib/queries/notifications";
import { api } from "@/utils/eden";

const MARK_ALL_READ_FAILED_MESSAGE = "모두 읽음 처리하지 못했어요";

/**
 * 알림함 헤더의 "모두 읽음" 버튼. 안 읽은 알림이 없으면(수를 아직 모를 때도) 누를 수 없다.
 * 요청이 끝나면 목록과 안 읽음 수를 새로 받는다.
 */
export function MarkAllReadButton() {
	const queryClient = useQueryClient();
	const { data: unreadCount = 0 } = useQuery(
		notificationUnreadCountQueryOptions(),
	);
	const [isPending, startTransition] = useTransition();

	const handleClick = () => {
		if (isPending) return;

		startTransition(async () => {
			try {
				const { error } = await api.notifications["read-all"].post();
				if (error) {
					toast.error(MARK_ALL_READ_FAILED_MESSAGE);
				}
			} catch (err) {
				console.error("Mark all notifications read error:", err);
				toast.error(MARK_ALL_READ_FAILED_MESSAGE);
			}
			// 실패했어도 화면을 서버 값에 맞추도록 항상 새로 받는다
			void queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
		});
	};

	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			disabled={unreadCount === 0 || isPending}
			onClick={handleClick}
		>
			모두 읽음
		</Button>
	);
}
