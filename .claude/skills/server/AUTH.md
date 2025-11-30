# Auth Integration Guide

## 핵심 파일

| 파일 | 용도 |
|------|------|
| `src/lib/elysia/auth.ts` | Elysia 인증 플러그인 |
| `src/lib/supabase/elysia.ts` | Elysia용 Supabase 클라이언트 |
| `src/lib/supabase/server.ts` | Server Components용 |
| `src/lib/supabase/client.ts` | 브라우저용 (싱글톤) |

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
