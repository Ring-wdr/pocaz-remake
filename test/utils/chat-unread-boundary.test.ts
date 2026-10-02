import { describe, expect, test } from "bun:test";
import {
	findLastReadMessageId,
	findLatestIncomingMessageId,
} from "@/components/chat/unread-boundary";

const ME = "me";
const PARTNER = "partner";

/** minutes: 기준 시각(10:00)에서 몇 분 뒤인지 */
function message(id: string, from: string, minutes: number) {
	return {
		id,
		createdAt: new Date(Date.UTC(2026, 9, 2, 10, minutes)).toISOString(),
		user: { id: from },
	};
}

const readAt = (minutes: number) =>
	new Date(Date.UTC(2026, 9, 2, 10, minutes)).toISOString();

describe("들어올 때 구분선을 그릴 위치", () => {
	test("읽음 시각 뒤에 온 상대의 첫 메시지 바로 앞 메시지를 돌려준다", () => {
		const messages = [
			message("m1", PARTNER, 0),
			message("m2", ME, 1),
			message("m3", PARTNER, 5),
			message("m4", PARTNER, 6),
		];

		expect(findLastReadMessageId(messages, readAt(2), ME)).toBe("m2");
	});

	test("읽음 시각 뒤에 내가 보낸 메시지가 끼어 있어도 구분선은 상대의 첫 안 읽은 메시지 위에 둔다", () => {
		// 읽은 뒤에 내가 답장(m2)을 보내고 떠났고, 그 사이 상대가 또 보냈다(m3)
		const messages = [
			message("m1", PARTNER, 0),
			message("m2", ME, 3),
			message("m3", PARTNER, 5),
		];

		expect(findLastReadMessageId(messages, readAt(1), ME)).toBe("m2");
	});

	test("읽은 적이 없으면(lastReadAt이 null) 구분선이 없다", () => {
		const messages = [message("m1", PARTNER, 0), message("m2", PARTNER, 1)];

		expect(findLastReadMessageId(messages, null, ME)).toBeNull();
	});

	test("안 읽은 상대 메시지가 없으면 구분선이 없다. 내 메시지만 뒤따라도 마찬가지다", () => {
		const messages = [
			message("m1", PARTNER, 0),
			message("m2", ME, 5),
			message("m3", ME, 6),
		];

		expect(findLastReadMessageId(messages, readAt(1), ME)).toBeNull();
		expect(findLastReadMessageId(messages, readAt(10), ME)).toBeNull();
		expect(findLastReadMessageId([], readAt(1), ME)).toBeNull();
	});

	test("읽음 시각과 같은 시각의 메시지는 읽은 것으로 본다", () => {
		const messages = [
			message("m1", PARTNER, 0),
			message("m2", PARTNER, 5),
			message("m3", PARTNER, 6),
		];

		expect(findLastReadMessageId(messages, readAt(5), ME)).toBe("m2");
	});

	test("불러온 메시지가 맨 위부터 전부 안 읽은 것이면 기준이 없어 구분선이 없다", () => {
		const messages = [message("m1", PARTNER, 5), message("m2", PARTNER, 6)];

		expect(findLastReadMessageId(messages, readAt(1), ME)).toBeNull();
	});
});

describe("상대가 보낸 가장 최근 메시지", () => {
	test("내 메시지는 건너뛰고 상대의 마지막 메시지 id를 돌려준다", () => {
		const messages = [
			message("m1", PARTNER, 0),
			message("m2", PARTNER, 1),
			message("m3", ME, 2),
		];

		expect(findLatestIncomingMessageId(messages, ME)).toBe("m2");
	});

	test("상대의 메시지가 없으면 null이다", () => {
		expect(findLatestIncomingMessageId([message("m1", ME, 0)], ME)).toBeNull();
		expect(findLatestIncomingMessageId([], ME)).toBeNull();
	});
});
