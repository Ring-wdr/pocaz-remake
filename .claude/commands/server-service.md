Create a new service layer for the specified domain.

## Instructions

1. Load these reference files:
   - `.claude/skills/server/service.md` - Service template
   - `src/lib/services/post.ts` - Reference implementation
   - `src/lib/services/user.ts` - Another reference

2. Ask the user for:
   - Domain name (e.g., "review", "comment")
   - Required operations (CRUD, search, pagination)
   - Special features (soft delete, nested create, etc.)

3. Generate the service file at `src/lib/services/{domain}.ts`

4. Include:
   - Create/Update DTOs
   - Cursor-based pagination
   - User relation includes
   - isOwner method for authorization

Arguments: $ARGUMENTS
