# Elysia Route Template

## 파일 위치

`src/lib/elysia/routes/{domain}.ts`

## 기본 템플릿

```typescript
import { Elysia, t } from "elysia";
import { authGuard } from "@/lib/elysia/auth";
import { {domain}Service } from "@/lib/services/{domain}";
import { userService } from "@/lib/services/user";

// ==============================================
// Response Schemas
// ==============================================
const {Domain}ItemSchema = t.Object({
	id: t.String(),
	// ... 필드 정의
	createdAt: t.String(),
});

const Paginated{Domain}Schema = t.Object({
	items: t.Array({Domain}ItemSchema),
	nextCursor: t.Nullable(t.String()),
	hasMore: t.Boolean(),
});

const ErrorSchema = t.Object({
	error: t.String(),
	message: t.Optional(t.String()),
});

// ==============================================
// Public Routes (인증 불필요)
// ==============================================
export const public{Domain}Routes = new Elysia({ prefix: "/{domains}" })
	// GET /{domains} - 목록 조회
	.get(
		"/",
		async ({ query }) => {
			const result = await {domain}Service.findAll({
				cursor: query.cursor,
				limit: query.limit ? Number.parseInt(query.limit) : 20,
			});

			return {
				items: result.items.map((item) => ({
					id: item.id,
					// ... 매핑
					createdAt: item.createdAt.toISOString(),
				})),
				nextCursor: result.nextCursor,
				hasMore: result.hasMore,
			};
		},
		{
			query: t.Object({
				cursor: t.Optional(t.String()),
				limit: t.Optional(t.String()),
			}),
			response: Paginated{Domain}Schema,
			detail: {
				tags: ["{Domains}"],
				summary: "{Domain} 목록 조회",
			},
		},
	)
	// GET /{domains}/:id - 상세 조회
	.get(
		"/:id",
		async ({ params, set }) => {
			const item = await {domain}Service.findById(params.id);
			if (!item) {
				set.status = 404;
				return { error: "{Domain} not found" };
			}
			return {
				id: item.id,
				createdAt: item.createdAt.toISOString(),
			};
		},
		{
			params: t.Object({ id: t.String() }),
			response: t.Union([{Domain}ItemSchema, ErrorSchema]),
			detail: {
				tags: ["{Domains}"],
				summary: "{Domain} 상세 조회",
			},
		},
	);

// ==============================================
// Protected Routes (인증 필수)
// ==============================================
export const {domain}Routes = new Elysia({ prefix: "/{domains}" })
	.use(authGuard)
	// POST /{domains} - 생성
	.post(
		"/",
		async ({ auth, body, set }) => {
			const user = await userService.findOrCreate(
				auth.user.id,
				auth.user.email,
				auth.user.user_metadata?.full_name,
				auth.user.user_metadata?.avatar_url,
			);

			const item = await {domain}Service.create({
				...body,
				userId: user.id,
			});

			set.status = 201;
			return {
				id: item.id,
				createdAt: item.createdAt.toISOString(),
			};
		},
		{
			body: t.Object({
				// ... 입력 필드
			}),
			response: {Domain}ItemSchema,
			detail: {
				tags: ["{Domains}"],
				summary: "{Domain} 생성",
			},
		},
	)
	// PUT /{domains}/:id - 수정
	.put(
		"/:id",
		async ({ auth, params, body, set }) => {
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

			const item = await {domain}Service.update(params.id, body);
			return {
				id: item.id,
				updatedAt: item.updatedAt.toISOString(),
			};
		},
		{
			params: t.Object({ id: t.String() }),
			body: t.Object({ /* 수정 필드 */ }),
			response: t.Union([/* ... */, ErrorSchema]),
			detail: {
				tags: ["{Domains}"],
				summary: "{Domain} 수정",
			},
		},
	)
	// DELETE /{domains}/:id - 삭제
	.delete(
		"/:id",
		async ({ auth, params, set }) => {
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

			await {domain}Service.delete(params.id);
			return { message: "{Domain} deleted successfully" };
		},
		{
			params: t.Object({ id: t.String() }),
			response: t.Union([t.Object({ message: t.String() }), ErrorSchema]),
			detail: {
				tags: ["{Domains}"],
				summary: "{Domain} 삭제",
			},
		},
	);
```

## 메인 앱 등록

`src/app/api/[[...slugs]]/route.ts`에 추가:

```typescript
import { public{Domain}Routes, {domain}Routes } from "@/lib/elysia/routes/{domain}";

app
	.use(public{Domain}Routes)
	.use({domain}Routes);
```

## 참조 구현

실제 구현 예시: `src/lib/elysia/routes/posts.ts`
