# Eden Treaty Guide

## 핵심 파일

| 파일 | 용도 |
|------|------|
| `src/utils/eden.ts` | Eden Treaty 클라이언트 |
| `src/utils/url.ts` | Base URL 유틸리티 |

## ⚠️ 중요: 서버/클라이언트 통합 패턴

Eden Treaty는 `onRequest` 훅을 사용하여 서버/클라이언트 컴포넌트 모두에서 **단일 `api` export**로 사용할 수 있습니다.

### 올바른 구현

```typescript
// src/utils/eden.ts
import { treaty } from "@elysiajs/eden";
import type { app as AppType } from "@/app/api/[[...slugs]]/route";
import { getApiBaseUrl } from "./url";

export const { api } = treaty<typeof AppType>(getApiBaseUrl(), {
  fetch: {
    credentials: "include",
  },
  async onRequest() {
    // 서버 환경에서만 쿠키 주입
    if (typeof window === "undefined") {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      return {
        headers: {
          cookie: cookieStore.toString(),
        },
      };
    }
  },
});
```

### 사용법 (서버/클라이언트 동일)

```typescript
import { api } from "@/utils/eden";

// 서버 컴포넌트
export default async function ProfileSection() {
  const { data, error } = await api.users.me.get();
  // ...
}

// 클라이언트 컴포넌트
"use client";
export default function ClientComponent() {
  const handleClick = async () => {
    const { data, error } = await api.users.me.get();
  };
}
```

## ❌ 안티 패턴

### 1. 서버/클라이언트 분리 함수 (불필요)

```typescript
// ❌ WRONG - 불필요한 분리
export const { api } = treaty<typeof AppType>(getApiBaseUrl(), {
  fetch: { credentials: "include" },
});

export async function getServerApi() {
  const { cookies } = await import("next/headers");
  return treaty<typeof AppType>(getApiBaseUrl(), {
    headers: { cookie: (await cookies()).toString() },
  }).api;
}

// 사용 시 혼란
const api = await getServerApi(); // 서버
api.users.me.get(); // 클라이언트
```

### 2. Elysia 인스턴스 직접 전달 (호환성 문제)

```typescript
// ❌ WRONG - Response.clone 에러 발생 가능
const { app } = await import("@/app/api/[[...slugs]]/route");
treaty<typeof AppType>(app, { ... }); // HTTP가 아닌 직접 호출
```

## 동작 원리

| 환경 | 쿠키 전달 방식 |
|------|---------------|
| 클라이언트 | `credentials: "include"` → 브라우저가 자동 전송 |
| 서버 | `onRequest` 훅 → `next/headers`의 `cookies()` 주입 |

## Base URL 설정

```typescript
// src/utils/url.ts
export function getApiBaseUrl(): string {
  // 브라우저: 상대 경로 (same-origin)
  if (typeof window !== "undefined") {
    return "";
  }
  // 서버: 절대 경로
  return getBaseUrl();
}
```

## 인증 라우트와 리다이렉트

`authGuard`가 적용된 라우트는 인증 실패 시 자동으로 `/login`으로 302 리다이렉트합니다.
Eden Treaty 클라이언트에서는 별도 처리 없이 브라우저가 리다이렉트를 따라갑니다.

```typescript
// authGuard 라우트 호출 시
const { data, error } = await api.users.me.get();
// 인증 실패 → 자동으로 /login 리다이렉트 (Elysia 레벨에서 처리)
// 인증 성공 → data에 프로필 정보
```

## 에러 핸들링

```typescript
const { data, error } = await api.users.me.get();

if (error) {
  // error.value에 응답 본문
  // error.status에 HTTP 상태 코드
  console.error(error.value);
  return;
}

// data는 타입 안전
console.log(data.nickname);
```

## 타입 안전성

Eden Treaty는 Elysia 앱의 타입을 자동으로 추론합니다:

```typescript
// 자동 완성 지원
api.users.me.get()           // GET /api/users/me
api.posts.get({ query: {} }) // GET /api/posts?...
api.posts.post({ body: {} }) // POST /api/posts
api.posts[":id"].get()       // GET /api/posts/:id
```
