import { describe, expect, test } from "bun:test";
import dayjs from "dayjs";
import {
	formatChatTime,
	formatDayLabel,
	formatFullDateTime,
	formatTime,
	isSameDay,
} from "@/utils/date";

// 오프셋 없는 문자열은 실행 환경의 로컬 시간으로 해석되므로 시간대와 무관하게 결과가 같다.
describe("날짜 유틸", () => {
	test("formatFullDateTime / formatTime", () => {
		expect(formatFullDateTime("2025-03-09T07:05:00")).toBe("2025.03.09 07:05");
		expect(formatTime("2025-03-09T19:45:00")).toBe("19:45");
	});

	test("formatDayLabel은 오늘·어제·날짜를 구분한다", () => {
		const now = dayjs();
		expect(formatDayLabel(now.toISOString())).toBe("오늘");
		expect(formatDayLabel(now.subtract(1, "day").toISOString())).toBe("어제");
		expect(formatDayLabel("2020-01-02T12:00:00")).toBe("2020.01.02");
	});

	test("isSameDay는 시각이 달라도 같은 날이면 true", () => {
		expect(isSameDay("2025-03-09T00:10:00", "2025-03-09T23:50:00")).toBe(true);
		expect(isSameDay("2025-03-09T23:50:00", "2025-03-10T00:10:00")).toBe(false);
	});

	test("formatChatTime은 오늘이면 시:분, 어제면 '어제'", () => {
		const now = dayjs();
		expect(formatChatTime(now.toISOString())).toBe(now.format("HH:mm"));
		expect(formatChatTime(now.subtract(1, "day").toISOString())).toBe("어제");
	});
});
