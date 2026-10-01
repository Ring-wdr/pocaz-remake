# Date Utilities Reference

날짜 포맷 함수 레퍼런스입니다.

## Location

```
src/utils/date.ts
```

## Dependencies

- `dayjs` (한국어 로케일 적용됨)
- `dayjs/plugin/utc`, `dayjs/plugin/timezone`: 모든 함수는 실행 환경의 시간대가 아니라 한국 시간(`Asia/Seoul`)으로 표시한다. 서버(Vercel은 UTC)와 브라우저가 같은 문자열을 그려야 hydration 불일치가 없고, 해외에서 접속해도 거래 시각이 한국 시간으로 보인다. "오늘/어제"와 `isSameDay`도 한국 날짜 기준이다.

## Functions

### formatRelativeTime

상대 시간 표시용. 게시글 목록, 댓글 등에 사용.

```typescript
import { formatRelativeTime } from "@/utils/date";

formatRelativeTime(post.createdAt)
// "방금 전" | "10분 전" | "3시간 전" | "5일 전" | "2024.11.30"
```

| 경과 시간 | 출력 |
|----------|------|
| < 1분 | "방금 전" |
| < 60분 | "N분 전" |
| < 24시간 | "N시간 전" |
| < 7일 | "N일 전" |
| >= 7일 | "YYYY.MM.DD" |

### formatDate

기본 날짜 형식. 일반적인 날짜 표시에 사용.

```typescript
import { formatDate } from "@/utils/date";

formatDate(item.createdAt)
// "2024.11.30"
```

### formatKoreanDate

한국어 긴 날짜 형식. 상세 페이지 등에 사용.

```typescript
import { formatKoreanDate } from "@/utils/date";

formatKoreanDate(market.createdAt)
// "2024년 11월 30일"
```

### formatShortDate

짧은 날짜. 공간이 제한된 UI에 사용.

```typescript
import { formatShortDate } from "@/utils/date";

formatShortDate(notification.createdAt)
// "11.30"
```

### formatDateTime

날짜+시간. 정확한 시간 표시가 필요할 때 사용.

```typescript
import { formatDateTime } from "@/utils/date";

formatDateTime(message.createdAt)
// "11.30 10:30"
```

### formatFullDateTime

연도까지 포함한 날짜+시간. 게시글 상세의 작성 시각에 사용.

```typescript
import { formatFullDateTime } from "@/utils/date";

formatFullDateTime(post.createdAt)
// "2024.11.30 10:30"
```

### formatTime

시간만. 채팅 메시지 말풍선에 사용.

```typescript
import { formatTime } from "@/utils/date";

formatTime(message.createdAt)
// "10:30"
```

### formatDayLabel / isSameDay

채팅 메시지 목록의 날짜 구분선. 앞 메시지와 다른 날이면 라벨을 넣는다.

```typescript
import { formatDayLabel, isSameDay } from "@/utils/date";

if (!isSameDay(prev.createdAt, current.createdAt)) {
  formatDayLabel(current.createdAt); // "오늘" | "어제" | "2024.11.30"
}
```

### formatChatTime

채팅 목록용. 컨텍스트에 따라 다른 형식 반환.

```typescript
import { formatChatTime } from "@/utils/date";

formatChatTime(chat.lastMessageAt)
// 오늘: "10:30"
// 어제: "어제"
// 올해: "11.30"
// 작년: "23.11.30"
```

## Usage by Context

| 컨텍스트 | 권장 함수 |
|----------|----------|
| 게시글 목록 | `formatRelativeTime` |
| 상세 페이지 | `formatKoreanDate` (게시글 작성 시각은 `formatFullDateTime`) |
| 채팅 목록 | `formatChatTime` |
| 채팅 메시지 | `formatTime`, 날짜 구분선은 `formatDayLabel` + `isSameDay` |
| 알림 목록 | `formatShortDate` or `formatRelativeTime` |
| 거래 내역 | `formatDate` or `formatDateTime` |
