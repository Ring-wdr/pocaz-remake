Add authentication to routes or understand auth patterns.

## Instructions

1. Load these reference files:
   - `.claude/skills/server/auth.md` - Auth patterns
   - `src/lib/elysia/auth.ts` - Auth implementation

2. Based on user request:

### For adding auth to routes:
- Show how to use `authGuard` or `optionalAuth`
- Explain Supabase ID → Prisma User flow
- Show owner verification pattern

### For auth troubleshooting:
- Check cookie handling
- Verify JWT claims extraction
- Debug session issues

### For new auth features:
- Extend auth types if needed
- Add custom guards
- Implement role-based access

Arguments: $ARGUMENTS
