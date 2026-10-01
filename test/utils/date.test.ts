import { describe, expect, test } from "bun:test";
import dayjs from "dayjs";
import {
	formatChatTime,
	formatDate,
	formatDayLabel,
	formatFullDateTime,
	formatTime,
	isSameDay,
} from "@/utils/date";

// API는 UTC ISO 문자열(…Z)을 준다. 표시는 실행 환경(서버는 보통 UTC)과 관계없이 한국 시간이어야 한다.
// 이 파일은 TZ=UTC와 TZ=America/New_York에서도 같은 결과를 내야 한다.
describe("날짜 유틸은 한국 시간으로 표시한다", () => {
	test("UTC 23:30은 다음 날 08:30 (KST)", () => {
		const instant = "2025-03-08T23:30:00.000Z";
		expect(formatFullDateTime(instant)).toBe("2025.03.09 08:30");
		expect(formatTime(instant)).toBe("08:30");
		expect(formatDate(instant)).toBe("2025.03.09");
	});

	test("같은 날 여부는 한국 날짜 기준", () => {
		// 둘 다 KST 3월 9일 (00:10, 23:50)
		expect(
			isSameDay("2025-03-08T15:10:00.000Z", "2025-03-09T14:50:00.000Z"),
		).toBe(true);
		// KST 3월 9일 23:50과 3월 10일 00:10
		expect(
			isSameDay("2025-03-09T14:50:00.000Z", "2025-03-09T15:10:00.000Z"),
		).toBe(false);
	});

	test("formatDayLabel은 오늘·어제·날짜를 구분한다", () => {
		const now = dayjs();
		expect(formatDayLabel(now.toISOString())).toBe("오늘");
		expect(formatDayLabel(now.subtract(1, "day").toISOString())).toBe("어제");
		expect(formatDayLabel("2020-01-02T03:00:00.000Z")).toBe("2020.01.02");
	});

	test("formatChatTime은 오늘이면 시:분, 어제면 '어제'", () => {
		const now = dayjs();
		expect(formatChatTime(now.toISOString())).toBe(
			formatTime(now.toISOString()),
		);
		expect(formatChatTime(now.subtract(1, "day").toISOString())).toBe("어제");
		expect(formatChatTime("2020-01-02T03:00:00.000Z")).toBe("20.01.02");
	});
});
