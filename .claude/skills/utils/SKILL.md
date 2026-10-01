---
name: utils
description: 날짜 포맷, URL 처리 등 유틸리티 함수 사용 시 반드시 참조. 인라인 구현 대신 기존 유틸 함수 사용 필수.
---

# Pocaz Utilities Skill

Pocaz 프로젝트의 유틸리티 함수 사용을 위한 스킬입니다.

## When to Use

- 날짜/시간 포맷팅이 필요할 때
- URL 처리가 필요할 때
- 공통 유틸리티 함수 사용 시

## Core Principle

날짜·URL 포맷은 `src/utils`의 함수를 쓴다. 표시 형식(구분자, 오늘/어제 규칙, 시간대)을 한 곳에서 바꿀 수 있게 하기 위해서다. 필요한 형식이 없으면 컴포넌트 안에 만들지 말고 `src/utils/date.ts`에 함수를 추가한다. (`biome.json`의 `noRestrictedImports`가 `src/utils/date.ts`와 테스트 밖의 `dayjs` import를 막는다.)

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

모두 한국 시간(`Asia/Seoul`)으로 표시한다. 서버 시간대와 관계없다.

| 함수 | 출력 형식 | 용도 |
|------|----------|------|
| `formatRelativeTime` | "10분 전", "3일 전" | 상대 시간 |
| `formatDate` | "2024.11.30" | 기본 날짜 |
| `formatKoreanDate` | "2024년 11월 30일" | 한국어 날짜 |
| `formatShortDate` | "11.30" | 짧은 날짜 |
| `formatDateTime` | "11.30 10:30" | 날짜+시간 |
| `formatFullDateTime` | "2024.11.30 10:30" | 연도 포함 날짜+시간 |
| `formatTime` | "10:30" | 시간만 |
| `formatChatTime` | 컨텍스트별 | 채팅 목록용 |
| `formatDayLabel` | "오늘", "어제", "2024.11.30" | 날짜 구분선 |
| `isSameDay` | boolean | 두 시각이 같은 날인지 |

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
3. 이 스킬의 표(`SKILL.md`, 날짜 함수면 `DATE.md`) 업데이트
