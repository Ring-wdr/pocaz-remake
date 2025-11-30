Create a complete new domain with Prisma model, service layer, and Elysia routes.

## Full Stack Domain Generation

This command creates everything needed for a new domain:

1. **Prisma Model** (`prisma/schema.prisma`)
2. **Service Layer** (`src/lib/services/{domain}.ts`)
3. **API Routes** (`src/lib/elysia/routes/{domain}.ts`)
4. **Route Registration** (update `src/app/api/[[...slugs]]/route.ts`)

## Instructions

1. Load all server skills:
   - `.claude/skills/server/index.md`
   - `.claude/skills/server/prisma.md`
   - `.claude/skills/server/service.md`
   - `.claude/skills/server/route.md`

2. Ask the user for domain specification:
   - Domain name (singular, PascalCase: e.g., "Review")
   - Fields and their types
   - Relations (always include User, optionally Images)
   - Features: pagination, search, soft delete

3. Generate in order:
   a. Prisma model in schema.prisma
   b. Service layer with DTOs
   c. Public + Protected routes
   d. Main app registration

4. Provide:
   - Migration commands
   - Generated code summary
   - Usage examples with Eden client

Arguments: $ARGUMENTS (domain name and description)

## Example

```
/server-domain Review - 포토카드 리뷰 (rating, content, userId)
```

Generates:
- `Review` model with rating, content, User relation
- `reviewService` with CRUD + pagination
- `publicReviewRoutes` + `reviewRoutes`
