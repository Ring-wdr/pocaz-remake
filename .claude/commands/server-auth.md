Add authentication to routes or understand auth patterns.

## Instructions

1. Load these reference files:
   - `.claude/skills/server/AUTH.md` - Auth patterns
   - `.claude/skills/server/EDEN.md` - Eden Treaty client
   - `src/lib/elysia/auth.ts` - Auth implementation
   - `src/utils/eden.ts` - Eden Treaty configuration

2. Based on user request:

### For adding auth to routes:
- Show how to use `authGuard` or `optionalAuth`
- Explain Supabase ID → Prisma User flow
- Show owner verification pattern

### For auth troubleshooting:
- **authGuard 500 에러**: `as: "scoped"` 사용 확인, 인증 실패 응답을 `onBeforeHandle`에서 반환하는지 확인
- **인증 실패가 500 `Failed to parse URL from /login`**: Node 런타임에서 `redirect()`에 상대 경로를 넘긴 경우. `status(401, …)`로 응답
- **Public 라우트 인증 요구**: `as: "global"` → `as: "scoped"` 변경
- **서버 컴포넌트 pending**: Eden `onRequest` 훅에서 쿠키 주입 확인
- Check cookie handling
- Verify JWT claims extraction
- Debug session issues

### For new auth features:
- Extend auth types if needed
- Add custom guards
- Implement role-based access

## Key Gotchas

1. **authGuard는 반드시 `as: "scoped"` 사용** - `as: "global"`은 모든 라우트에 적용됨
2. **인증 실패는 `onBeforeHandle`에서 처리** - derive는 `auth` 컨텍스트 주입만 담당 (`src/lib/elysia/auth.ts`)
3. **Eden Treaty 단일 api 사용** - 서버/클라이언트 분리 불필요, `onRequest` 훅으로 해결

Arguments: $ARGUMENTS
