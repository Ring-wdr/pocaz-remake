# Date Utilities Reference

날짜 포맷 함수 레퍼런스입니다.

## Location

```
src/utils/date.ts
```

## Dependencies

- `dayjs` (한국어 로케일 적용됨)

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
| 상세 페이지 | `formatKoreanDate` |
| 채팅 목록 | `formatChatTime` |
| 알림 목록 | `formatShortDate` or `formatRelativeTime` |
| 거래 내역 | `formatDate` or `formatDateTime` |
