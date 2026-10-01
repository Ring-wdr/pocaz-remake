# Eden Treaty Guide

## 핵심 파일

| 파일 | 용도 |
|------|------|
| `src/utils/eden.ts` | Eden Treaty 클라이언트 |
| `src/utils/url.ts` | Base URL 유틸리티 |

## 서버/클라이언트 통합 패턴

Eden Treaty는 `onRequest` 훅을 사용하여 서버/클라이언트 컴포넌트 모두에서 **단일 `api` export**로 사용할 수 있습니다.

### 구현

구현은 `src/utils/eden.ts`에 있다(이 문서에 복사하지 않는다). `api`는 처음 접근할 때 treaty 클라이언트를 만드는 지연 Proxy다. 서버에서는 `onRequest` 훅이 `next/headers`의 `cookies()`를 `cookie` 헤더로 넣고, 브라우저에서는 `credentials: "include"`로 쿠키가 전송된다.

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

`src/utils/url.ts`의 `getApiBaseUrl()`은 `getBaseUrl()`을 그대로 쓴다. 브라우저에서는 `window.location.origin`, 서버에서는 `NEXT_PUBLIC_SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL` → `http://localhost:${PORT ?? 3000}` 순서다.

## 인증 실패 처리

`authGuard` 라우트는 인증 실패 시 `401 { error: "Unauthorized" }`를 반환한다(AUTH.md). 리다이렉트는 일어나지 않으므로 호출하는 쪽에서 처리한다.

```typescript
const { data, error } = await api.users.me.get();
if (error?.status === 401) {
  unauthorized(); // 서버 컴포넌트 (next/navigation). 클라이언트에서는 로그인 유도 UI
}
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
