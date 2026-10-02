import type { ChatMessage } from "@/types/entities";

type BoundaryMessage = Pick<ChatMessage, "id" | "createdAt"> & {
	user: Pick<ChatMessage["user"], "id">;
};

/**
 * 방에 들어올 때 "여기까지 읽음" 구분선을 그릴 위치를 찾는다. 구분선은 돌려주는 메시지의 바로 아래,
 * 즉 읽음 시각(lastReadAt) 뒤에 상대가 보낸 첫 메시지 위에 그려진다.
 * - 읽은 적이 없거나 들어올 때 안 읽은 상대 메시지가 없으면 null: 구분선이 없다
 *   (ChatMessageList에 lastReadAt을 그대로 넘기면 안 읽은 메시지가 없었어도 방에 있는 동안 처음 오간 메시지 위에 구분선이 생긴다)
 * - 읽음 시각 뒤에 내가 보낸 메시지가 끼어 있어도 그 메시지는 읽은 것으로 본다
 *   (내 메시지는 읽음 처리를 일으키지 않아 읽음 시각보다 뒤에 있을 수 있다)
 * - 불러온 메시지가 맨 위부터 전부 안 읽은 것이면 기준이 될 메시지가 없어 null
 * messages는 오래된 것부터 정렬되어 있어야 한다.
 */
export function findLastReadMessageId(
	messages: BoundaryMessage[],
	lastReadAt: string | null,
	currentUserId: string,
): string | null {
	if (!lastReadAt) {
		return null;
	}

	const readAt = new Date(lastReadAt).getTime();
	const firstUnreadIndex = messages.findIndex(
		(message) =>
			message.user.id !== currentUserId &&
			new Date(message.createdAt).getTime() > readAt,
	);

	return firstUnreadIndex > 0 ? messages[firstUnreadIndex - 1].id : null;
}

/**
 * 상대가 보낸 가장 최근 메시지의 id. 상대의 메시지가 아직 없으면 null.
 * 이 값이 바뀌면 방을 보고 있는 동안 새 메시지가 온 것이라 읽음 처리를 다시 요청한다.
 * messages는 오래된 것부터 정렬되어 있어야 한다.
 */
export function findLatestIncomingMessageId(
	messages: BoundaryMessage[],
	currentUserId: string,
): string | null {
	for (let index = messages.length - 1; index >= 0; index--) {
		if (messages[index].user.id !== currentUserId) {
			return messages[index].id;
		}
	}
	return null;
}
