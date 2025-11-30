# Service Layer Template

## 파일 위치

`src/lib/services/{domain}.ts`

## 기본 템플릿

```typescript
import { prisma } from "@/lib/prisma";

// ==============================================
// DTOs
// ==============================================

export interface Create{Domain}Dto {
	userId: string;
	// ... 필수 필드
}

export interface Update{Domain}Dto {
	// ... 선택적 필드 (Partial)
}

export interface PaginationOptions {
	cursor?: string;
	limit?: number;
}

// ==============================================
// Service
// ==============================================

export const {domain}Service = {
	/**
	 * 목록 조회 (커서 기반 페이지네이션)
	 */
	async findAll(options: PaginationOptions = {}) {
		const { cursor, limit = 20 } = options;

		const items = await prisma.{domain}.findMany({
			take: limit + 1,
			...(cursor && {
				cursor: { id: cursor },
				skip: 1,
			}),
			orderBy: { createdAt: "desc" },
			include: {
				user: {
					select: {
						id: true,
						nickname: true,
						profileImage: true,
					},
				},
			},
		});

		const hasMore = items.length > limit;
		const result = hasMore ? items.slice(0, -1) : items;
		const nextCursor = hasMore ? result[result.length - 1]?.id : null;

		return { items: result, nextCursor, hasMore };
	},

	/**
	 * ID로 상세 조회
	 */
	async findById(id: string) {
		return prisma.{domain}.findUnique({
			where: { id },
			include: {
				user: {
					select: {
						id: true,
						nickname: true,
						profileImage: true,
					},
				},
			},
		});
	},

	/**
	 * 생성
	 */
	async create(dto: Create{Domain}Dto) {
		return prisma.{domain}.create({
			data: { ...dto },
			include: {
				user: {
					select: {
						id: true,
						nickname: true,
						profileImage: true,
					},
				},
			},
		});
	},

	/**
	 * 수정
	 */
	async update(id: string, dto: Update{Domain}Dto) {
		return prisma.{domain}.update({
			where: { id },
			data: { ...dto },
		});
	},

	/**
	 * 삭제
	 */
	async delete(id: string) {
		await prisma.{domain}.delete({
			where: { id },
		});
	},

	/**
	 * 소유자 확인
	 */
	async isOwner({domain}Id: string, userId: string) {
		const item = await prisma.{domain}.findUnique({
			where: { id: {domain}Id },
			select: { userId: true },
		});
		return item?.userId === userId;
	},
};
```

## 추가 패턴

### Soft Delete

```typescript
async softDelete(id: string) {
	return prisma.{domain}.update({
		where: { id },
		data: { deletedAt: new Date() },
	});
},

// findAll에서 제외
where: { deletedAt: null },
```

### 중첩 생성 (이미지 등)

```typescript
async create(dto: Create{Domain}Dto) {
	return prisma.{domain}.create({
		data: {
			content: dto.content,
			userId: dto.userId,
			...(dto.imageUrls?.length && {
				images: {
					create: dto.imageUrls.map((url) => ({ imageUrl: url })),
				},
			}),
		},
	});
}
```

### Count 포함

```typescript
include: {
	_count: {
		select: { replies: true, likes: true },
	},
},

// 사용
replyCount: item._count.replies,
```

## 참조 구현

- `src/lib/services/post.ts` - 전체 CRUD + 페이지네이션
- `src/lib/services/user.ts` - findOrCreate 패턴
