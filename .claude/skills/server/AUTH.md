# Auth Integration Guide

## 핵심 파일

| 파일 | 용도 |
|------|------|
| `src/lib/elysia/auth.ts` | Elysia 인증 플러그인 |
| `src/lib/supabase/elysia.ts` | Elysia용 Supabase 클라이언트 |
| `src/lib/supabase/server.ts` | Server Components용 |
| `src/lib/supabase/client.ts` | 브라우저용 (싱글톤) |
| `src/utils/eden.ts` | Eden Treaty 클라이언트 |

## authGuard 구현 규칙

### 1. `as: "scoped"`를 사용한다

```typescript
// ❌ WRONG - 모든 라우트에 적용되어 public 라우트도 인증 필요
.derive({ as: "global" }, async ({ request }) => { ... })

// ✅ CORRECT - authGuard를 use한 라우트에만 적용
.derive({ as: "scoped" }, async ({ request }) => { ... })
```

### 2. derive는 주입만, 인증 실패는 onBeforeHandle에서 401로 응답

이 API는 브라우저와 서버 컴포넌트가 모두 fetch(Eden)로 호출하므로 리다이렉트로 응답하지 않는다. Node 런타임(Next 서버)에서는 `redirect("/login")`이 상대 URL을 파싱하지 못해 500이 되고, 리다이렉트가 동작하더라도 fetch가 로그인 페이지 HTML을 200으로 받아 `error`가 비게 된다.

```typescript
export const authGuard = new Elysia({ name: "auth-guard" })
  .derive({ as: "scoped" }, async ({ request }) => {
    // ... 인증 로직 ...
    return {
      auth: { user, session } as AuthenticatedContext,
    };
  })
  .onBeforeHandle({ as: "scoped" }, ({ auth, status }) => {
    if (!auth.user || !auth.session) {
      return status(401, { error: "Unauthorized" });
    }
  });
```

로그인 화면으로 보내는 일은 호출하는 쪽이 한다. 서버 컴포넌트는 `error.status === 401`이면 `unauthorized()`(next.config의 `authInterrupts`)를 호출하고, 클라이언트는 로그인 유도 UI를 띄운다.

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

### adminGuard (관리자 전용)

카탈로그(소속사·그룹·아티스트·포토카드·갈망포카) 쓰기처럼 운영자만 하는 작업에 쓴다. 관리자는 Supabase `app_metadata.role = "admin"`으로 지정한다. `app_metadata`는 service role로만 바꿀 수 있어 사용자가 스스로 관리자가 될 수 없다(`user_metadata`는 사용자가 바꿀 수 있으므로 권한 판단에 쓰지 않는다).

```typescript
import { adminGuard, authGuard } from "@/lib/elysia/auth";

export const agencyAdminRoutes = new Elysia()
  .use(authGuard) // 401: 비로그인
  .use(adminGuard) // 403: 관리자 아님. authGuard 없이 단독으로 쓰면 모든 요청을 거부한다
  .post("/agencies", ({ body }) => agencyService.create(body));
```

### optionalAuth (선택적)

`optionalAuth`도 scoped라서 use한 라우트 그룹에만 `auth`가 주입된다. 로그인 여부가 필요한 공개 라우트 그룹에서 직접 use한다.

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

하위 리소스(`/:id/images/:imageId`, 댓글 등)는 부모 소유권을 확인한 뒤 삭제·수정 조건에 부모 ID도 넣는다. ID만으로 지우면 다른 사람 게시글의 이미지도 지울 수 있다.

```typescript
const { count } = await prisma.postImage.deleteMany({
  where: { id: params.imageId, postId: params.id },
});
if (count === 0) {
  set.status = 404;
  return { error: "Image not found" };
}
```

## 에러 응답

```typescript
// 401 Unauthorized (authGuard)
{ "error": "Unauthorized" }

// 403 Forbidden
{ "error": "Forbidden" }

// 404 User Not Found
{ "error": "User not found" }
```
