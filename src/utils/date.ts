import dayjs from "dayjs";
import "dayjs/locale/ko";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("ko");

/**
 * 표시 기준 시간대. 서버(Vercel은 UTC)와 브라우저가 같은 시각을 그리도록 실행 환경의 시간대를 쓰지 않는다.
 */
const TIME_ZONE = "Asia/Seoul";

function inKst(dateString: string) {
	return dayjs(dateString).tz(TIME_ZONE);
}

function nowInKst() {
	return dayjs().tz(TIME_ZONE);
}

/** 한국 날짜 (YYYY-MM-DD). 날짜 비교용 */
function kstDay(date: dayjs.Dayjs) {
	return date.format("YYYY-MM-DD");
}

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
	return inKst(dateString).format("YYYY.MM.DD");
}

/**
 * 날짜 포맷 (YYYY.MM.DD)
 */
export function formatDate(dateString: string): string {
	return inKst(dateString).format("YYYY.MM.DD");
}

/**
 * 한국어 긴 날짜 포맷 (2024년 11월 30일)
 */
export function formatKoreanDate(dateString: string): string {
	return inKst(dateString).format("YYYY년 M월 D일");
}

/**
 * 짧은 날짜 포맷 (MM.DD)
 */
export function formatShortDate(dateString: string): string {
	return inKst(dateString).format("MM.DD");
}

/**
 * 날짜+시간 포맷 (MM.DD HH:mm)
 */
export function formatDateTime(dateString: string): string {
	return inKst(dateString).format("MM.DD HH:mm");
}

/**
 * 연도까지 포함한 날짜+시간 포맷 (YYYY.MM.DD HH:mm)
 */
export function formatFullDateTime(dateString: string): string {
	return inKst(dateString).format("YYYY.MM.DD HH:mm");
}

/**
 * 시간 포맷 (HH:mm)
 */
export function formatTime(dateString: string): string {
	return inKst(dateString).format("HH:mm");
}

/**
 * 날짜 구분선 라벨
 * - 오늘: "오늘"
 * - 어제: "어제"
 * - 그 외: YYYY.MM.DD
 */
export function formatDayLabel(dateString: string): string {
	const date = inKst(dateString);
	const now = nowInKst();
	if (kstDay(date) === kstDay(now)) return "오늘";
	if (kstDay(date) === kstDay(now.subtract(1, "day"))) return "어제";
	return date.format("YYYY.MM.DD");
}

/**
 * 두 시각이 한국 날짜로 같은 날인지
 */
export function isSameDay(a: string, b: string): boolean {
	return kstDay(inKst(a)) === kstDay(inKst(b));
}

/**
 * 채팅용 시간 포맷
 * - 오늘: HH:mm
 * - 어제: "어제"
 * - 올해: MM.DD
 * - 그 외: YY.MM.DD
 */
export function formatChatTime(dateString: string): string {
	const date = inKst(dateString);
	const now = nowInKst();

	if (kstDay(date) === kstDay(now)) {
		return date.format("HH:mm");
	}
	if (kstDay(date) === kstDay(now.subtract(1, "day"))) {
		return "어제";
	}
	if (date.year() === now.year()) {
		return date.format("MM.DD");
	}
	return date.format("YY.MM.DD");
}
