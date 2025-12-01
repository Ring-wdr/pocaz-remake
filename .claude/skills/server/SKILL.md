---
name: server
description: API 라우트, 서비스, Prisma 모델 생성/수정 시 반드시 사용. Elysia.js 패턴과 인증 통합 규칙 준수 필수.
---

# Pocaz Server Development Skill

Pocaz 프로젝트의 서버 개발을 위한 스킬입니다.

## Triggers (reference)

api, route, 서비스, service, prisma, 모델, model, 엔드포인트, endpoint, 백엔드, backend, elysia

## When to Use

- 새로운 API 엔드포인트 추가
- Prisma 모델 생성/수정
- 서비스 레이어 구현
- 인증이 필요한 라우트 작업
- 새 도메인(기능) 추가

## Tech Stack

| 기술 | 버전 | 용도 |
|------|------|------|
| Elysia.js | 1.4.16 | API Framework |
| Eden | 1.4.5 | Type-safe Client |
| Prisma | 7.0.1 | ORM (PG Adapter) |
| Supabase | - | Auth, Realtime, Storage |

## Instructions

### 새 도메인 추가 워크플로우

1. **Prisma 모델 정의** → `PRISMA.md` 참조
2. **마이그레이션 실행** → `npx prisma migrate dev`
3. **서비스 레이어 생성** → `SERVICE.md` 참조
4. **API 라우트 생성** → `ROUTE.md` 참조
5. **메인 앱 등록** → `src/app/api/[[...slugs]]/route.ts`

### 핵심 디렉토리 구조

```
src/
├── app/api/[[...slugs]]/route.ts   # Elysia 메인 앱
├── lib/
│   ├── elysia/
│   │   ├── auth.ts                  # 인증 플러그인
│   │   └── routes/                  # 도메인별 라우트
│   ├── services/                    # 비즈니스 로직
│   ├── supabase/                    # Supabase 클라이언트
│   └── prisma.ts                    # Prisma 클라이언트
└── generated/prisma/               # 생성된 타입
```

## Examples

### 예시 1: Review 도메인 추가

```bash
# 1. Prisma 모델 추가 (prisma/schema.prisma)
model Review {
  id        String   @id @default(uuid())
  content   String
  rating    Int
  createdAt DateTime @default(now())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
}

# 2. 마이그레이션
npx prisma migrate dev --name add_review

# 3. 서비스 생성 (src/lib/services/review.ts)
# 4. 라우트 생성 (src/lib/elysia/routes/reviews.ts)
# 5. 메인 앱에 등록
```

### 예시 2: 인증 필요 라우트

```typescript
import { authGuard } from "@/lib/elysia/auth";

export const reviewRoutes = new Elysia({ prefix: "/reviews" })
  .use(authGuard)
  .post("/", async ({ auth, body }) => {
    const user = await userService.findOrCreate(auth.user.id, ...);
    return reviewService.create({ ...body, userId: user.id });
  });
```

## Reference Files

상세 템플릿과 패턴은 다음 파일 참조:

| 파일 | 내용 |
|------|------|
| `ROUTE.md` | Elysia 라우트 템플릿 |
| `SERVICE.md` | 서비스 레이어 템플릿 |
| `PRISMA.md` | Prisma 모델 패턴 |
| `AUTH.md` | 인증 통합 가이드 |
| `EDEN.md` | Eden Treaty 클라이언트 가이드 |

## Key Patterns

### Public + Protected 분리

```typescript
// Public (인증 불필요)
export const publicReviewRoutes = new Elysia({ prefix: "/reviews" })
  .get("/", () => reviewService.findAll());

// Protected (인증 필수)
export const reviewRoutes = new Elysia({ prefix: "/reviews" })
  .use(authGuard)
  .post("/", ({ auth, body }) => { /* ... */ });
```

### 커서 기반 페이지네이션

```typescript
const items = await prisma.review.findMany({
  take: limit + 1,
  ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  orderBy: { createdAt: "desc" },
});
const hasMore = items.length > limit;
```

### Supabase ID → Prisma User 연동

```typescript
const user = await userService.findOrCreate(
  auth.user.id,           // Supabase ID
  auth.user.email,
  auth.user.user_metadata?.full_name,
  auth.user.user_metadata?.avatar_url,
);
```
