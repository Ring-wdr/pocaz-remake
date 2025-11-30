# Prisma Model Patterns

## 스키마 위치

`prisma/schema.prisma`

## 기본 모델 템플릿

```prisma
model {Domain} {
  id        String   @id @default(uuid())
  // ... 필드들
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // User 관계
  userId    String
  user      User     @relation(fields: [userId], references: [id])
}
```

## 공통 패턴

### User 관계

```prisma
// 도메인 모델
userId    String
user      User     @relation(fields: [userId], references: [id])

// User 모델에 추가
{domain}s {Domain}[]
```

### 이미지 관계 (1:N)

```prisma
model {Domain}Image {
  id        String   @id @default(uuid())
  imageUrl  String
  createdAt DateTime @default(now())

  {domain}Id String
  {domain}   {Domain} @relation(fields: [{domain}Id], references: [id], onDelete: Cascade)
}
```

### Soft Delete

```prisma
deletedAt DateTime?
```

### 좋아요 (M:N)

```prisma
model Like {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())

  userId    String
  user      User     @relation(fields: [userId], references: [id])

  {domain}Id String
  {domain}   {Domain} @relation(fields: [{domain}Id], references: [id], onDelete: Cascade)

  @@unique([userId, {domain}Id])
}
```

### Enum

```prisma
enum Status {
  PENDING
  ACTIVE
  COMPLETED
}

model {Domain} {
  status Status @default(PENDING)
}
```

## Field Types

| Prisma | TypeScript | 설명 |
|--------|------------|------|
| `String` | `string` | 문자열 |
| `Int` | `number` | 정수 |
| `Boolean` | `boolean` | 불린 |
| `DateTime` | `Date` | 날짜 |
| `String?` | `string \| null` | nullable |

## 마이그레이션

```bash
npx prisma migrate dev --name add_{domain}
npx prisma generate
```
