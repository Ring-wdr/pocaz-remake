Create a new Elysia API route for the specified domain.

## Instructions

1. Load these reference files:
   - `.claude/skills/server/route.md` - Route template
   - `.claude/skills/server/context.md` - Architecture context
   - `src/lib/elysia/routes/posts.ts` - Reference implementation

2. Ask the user for:
   - Domain name (e.g., "review", "comment")
   - Required endpoints (CRUD, search, etc.)
   - Special requirements (relations, pagination, etc.)

3. Generate the route file at `src/lib/elysia/routes/{domain}.ts`

4. Show how to register in `src/app/api/[[...slugs]]/route.ts`

5. Remind to create the service layer if not exists

Arguments: $ARGUMENTS
