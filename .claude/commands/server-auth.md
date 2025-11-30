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
- **authGuard 500 에러**: `as: "scoped"` 사용 확인, derive 내 직접 throw 확인
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
2. **derive 내에서 직접 에러 throw** - `onBeforeHandle`과 실행 순서 문제
3. **Eden Treaty 단일 api 사용** - 서버/클라이언트 분리 불필요, `onRequest` 훅으로 해결

Arguments: $ARGUMENTS
