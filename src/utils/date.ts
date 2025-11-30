import dayjs from "dayjs";
import "dayjs/locale/ko";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("ko");

/**
 * 상대 시간 포맷 (10분 전, 1시간 전, 3일 전 등)
 */
export function formatRelativeTime(dateString: string): string {
	const date = dayjs(dateString);
	const now = dayjs();
	const diffMin = now.diff(date, "minute");
	const diffHour = now.diff(date, "hour");
	const diffDay = now.diff(date, "day");

	if (diffMin < 1) return "방금 전";
	if (diffMin < 60) return `${diffMin}분 전`;
	if (diffHour < 24) return `${diffHour}시간 전`;
	if (diffDay < 7) return `${diffDay}일 전`;
	return date.format("YYYY.MM.DD");
}

/**
 * 날짜 포맷 (YYYY.MM.DD)
 */
export function formatDate(dateString: string): string {
	return dayjs(dateString).format("YYYY.MM.DD");
}

/**
 * 한국어 긴 날짜 포맷 (2024년 11월 30일)
 */
export function formatKoreanDate(dateString: string): string {
	return dayjs(dateString).format("YYYY년 M월 D일");
}

/**
 * 짧은 날짜 포맷 (MM.DD)
 */
export function formatShortDate(dateString: string): string {
	return dayjs(dateString).format("MM.DD");
}

/**
 * 날짜+시간 포맷 (MM.DD HH:mm)
 */
export function formatDateTime(dateString: string): string {
	return dayjs(dateString).format("MM.DD HH:mm");
}

/**
 * 채팅용 시간 포맷
 * - 오늘: HH:mm
 * - 어제: "어제"
 * - 올해: MM.DD
 * - 그 외: YY.MM.DD
 */
export function formatChatTime(dateString: string): string {
	const date = dayjs(dateString);
	const now = dayjs();

	if (date.isSame(now, "day")) {
		return date.format("HH:mm");
	}
	if (date.isSame(now.subtract(1, "day"), "day")) {
		return "어제";
	}
	if (date.isSame(now, "year")) {
		return date.format("MM.DD");
	}
	return date.format("YY.MM.DD");
}
