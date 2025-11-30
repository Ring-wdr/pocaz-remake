# Auth Integration Guide

## 핵심 파일

| 파일 | 용도 |
|------|------|
| `src/lib/elysia/auth.ts` | Elysia 인증 플러그인 |
| `src/lib/supabase/elysia.ts` | Elysia용 Supabase 클라이언트 |
| `src/lib/supabase/server.ts` | Server Components용 |
| `src/lib/supabase/client.ts` | 브라우저용 (싱글톤) |
| `src/utils/eden.ts` | Eden Treaty 클라이언트 |

## ⚠️ 중요: authGuard 구현 주의사항

### 1. `as: "scoped"` 필수 사용

```typescript
// ❌ WRONG - 모든 라우트에 적용되어 public 라우트도 인증 필요
.derive({ as: "global" }, async ({ request }) => { ... })

// ✅ CORRECT - authGuard를 use한 라우트에만 적용
.derive({ as: "scoped" }, async ({ request }) => { ... })
```

### 2. derive + onBeforeHandle 조합으로 리다이렉트

인증 실패 시 로그인 페이지로 리다이렉트하려면 `derive`와 `onBeforeHandle`을 조합합니다:

```typescript
// ✅ CORRECT - derive로 인증 정보 주입, onBeforeHandle에서 redirect
export const authGuard = new Elysia({ name: "auth-guard" })
  .derive({ as: "scoped" }, async ({ request }) => {
    // ... 인증 로직 ...
    return {
      auth: { user, session } as AuthenticatedContext,
    };
  })
  .onBeforeHandle({ as: "scoped" }, ({ auth, redirect }) => {
    if (!auth.user || !auth.session) {
      return redirect("/login");  // Elysia 내장 redirect (302)
    }
  });
```

**주의**: `redirect()`는 `derive`에서 직접 반환 불가, 반드시 `onBeforeHandle`에서 사용

## Auth Types

```typescript
interface AuthUser {
  id: string;           // Supabase user.id
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface AuthContext {
  user: AuthUser | null;
  session: Session | null;
}

interface AuthenticatedContext {
  user: AuthUser;      // non-null
  session: Session;    // non-null
}
```

## 사용법

### authGuard (인증 필수)

```typescript
import { authGuard } from "@/lib/elysia/auth";

export const protectedRoutes = new Elysia({ prefix: "/protected" })
  .use(authGuard)
  .get("/profile", ({ auth }) => {
    // auth.user 항상 존재
    return { id: auth.user.id };
  });
```

### optionalAuth (선택적)

```typescript
import { optionalAuth } from "@/lib/elysia/auth";

export const publicRoutes = new Elysia({ prefix: "/public" })
  .use(optionalAuth)
  .get("/content", ({ auth }) => {
    if (auth.user) {
      // 로그인 상태
    }
  });
```

## Supabase ID → Prisma User

```typescript
// 조회 또는 생성
const user = await userService.findOrCreate(
  auth.user.id,
  auth.user.email,
  auth.user.user_metadata?.full_name,
  auth.user.user_metadata?.avatar_url,
);

// 조회만
const user = await userService.findBySupabaseId(auth.user.id);
```

## 소유자 검증 패턴

```typescript
.put("/:id", async ({ auth, params, body, set }) => {
  const user = await userService.findBySupabaseId(auth.user.id);
  if (!user) {
    set.status = 401;
    return { error: "User not found" };
  }

  const isOwner = await {domain}Service.isOwner(params.id, user.id);
  if (!isOwner) {
    set.status = 403;
    return { error: "Forbidden" };
  }

  // 수정 진행
})
```

## 에러 응답

```typescript
// 401 Unauthorized
{ "error": "Unauthorized", "message": "Authentication required" }

// 403 Forbidden
{ "error": "Forbidden" }

// 404 User Not Found
{ "error": "User not found" }
```
