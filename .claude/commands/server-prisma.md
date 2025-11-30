Create a new Prisma model and related schema.

## Instructions

1. Load these reference files:
   - `.claude/skills/server/prisma.md` - Prisma patterns
   - `prisma/schema.prisma` - Current schema

2. Ask the user for:
   - Model name (e.g., "Review", "Comment")
   - Fields and types
   - Relations (User, Images, etc.)
   - Special features (soft delete, enum, etc.)

3. Add the model to `prisma/schema.prisma`

4. Update related models (add relation arrays to User, etc.)

5. Provide migration commands:
   ```bash
   npx prisma migrate dev --name add_{model}
   npx prisma generate
   ```

6. Remind to create service and route layers

Arguments: $ARGUMENTS
