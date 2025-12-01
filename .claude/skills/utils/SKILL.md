---
name: utils
description: 날짜 포맷, URL 처리 등 유틸리티 함수 사용 시 반드시 참조. 인라인 구현 대신 기존 유틸 함수 사용 필수.
---

# Pocaz Utilities Skill

Pocaz 프로젝트의 유틸리티 함수 사용을 위한 스킬입니다.

## Triggers (reference)

날짜, date, 시간, time, 포맷, format, formatDate, toLocaleDateString, dayjs, moment, url, baseUrl

## When to Use

- 날짜/시간 포맷팅이 필요할 때
- URL 처리가 필요할 때
- 공통 유틸리티 함수 사용 시

## Core Principle

**인라인 구현 금지** - 기존 유틸 함수가 있으면 반드시 사용

```typescript
// ❌ BAD - 인라인 구현
const formattedDate = new Date(date).toLocaleDateString("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// ✅ GOOD - 유틸 함수 사용
import { formatKoreanDate } from "@/utils/date";
const formattedDate = formatKoreanDate(date);
```

## Available Utilities

### Date (`@/utils/date`)

| 함수 | 출력 형식 | 용도 |
|------|----------|------|
| `formatRelativeTime` | "10분 전", "3일 전" | 상대 시간 |
| `formatDate` | "2024.11.30" | 기본 날짜 |
| `formatKoreanDate` | "2024년 11월 30일" | 한국어 날짜 |
| `formatShortDate` | "11.30" | 짧은 날짜 |
| `formatDateTime` | "11.30 10:30" | 날짜+시간 |
| `formatChatTime` | 컨텍스트별 | 채팅 목록용 |

### URL (`@/utils/url`)

| 함수 | 용도 |
|------|------|
| `getBaseUrl` | 앱 기본 URL |
| `getApiBaseUrl` | API 기본 URL |

### Eden (`@/utils/eden`)

| 함수 | 용도 |
|------|------|
| `api` | Type-safe API 클라이언트 |

## Reference Files

| 파일 | 내용 |
|------|------|
| `DATE.md` | 날짜 함수 상세 가이드 |

## Adding New Utilities

새 유틸 함수 추가 시:

1. 적절한 파일에 함수 추가 (`src/utils/*.ts`)
2. JSDoc 주석 작성
3. `docs/utils/*.md` 문서 업데이트
4. 이 스킬 파일 업데이트
