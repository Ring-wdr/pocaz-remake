# Legacy Server Migration Plan

## Overview

Legacy Express.js 서버를 Next.js + Elysia.js + Supabase 스택으로 마이그레이션

### Tech Stack 변경

| 영역 | Legacy | New |
|------|--------|-----|
| Frontend | React (별도) | Next.js 16 + StyleX |
| Backend | Express.js | Elysia.js (Next.js API Routes) |
| Auth | Passport.js (Google, Twitter, Apple) | **Supabase Auth (Google Only)** |
| Database | MySQL (raw SQL) | **PostgreSQL (Prisma + Supabase)** |
| Realtime | Socket.io | **Supabase Realtime** |
| Hosting | - | Vercel |

---

## Progress

### ✅ Phase 1: Supabase 프로젝트 설정 (완료)

- [x] Supabase 프로젝트 생성
- [x] Google OAuth Provider 설정
- [x] 환경 변수 설정 (`.env`)
- [x] Connection pooling 설정 (DATABASE_URL, DIRECT_URL)

### ✅ Phase 2: Prisma 스키마 정의 (완료)

- [x] Prisma 7 설정 (`prisma.config.ts`)
- [x] 스키마 정의 (13개 모델)
- [x] 마이그레이션 실행 (`20251129153923_init`)
- [x] Prisma Client 생성
- [x] Driver Adapter 설정 (`@prisma/adapter-pg`)

**생성된 모델:**
```
User, Agency, ArtistGroup, Artist, Photocard, GalmangPoca,
Post, PostImage, Reply, Market, MarketImage, Like,
ChatRoom, ChatRoomMember, ChatMessage
```

### ✅ Phase 3: Supabase Auth 연동 (완료)

- [x] Supabase SSR 클라이언트 설정
  - `src/lib/supabase/server.ts`
  - `src/lib/supabase/client.ts`
  - `src/lib/supabase/middleware.ts`
- [x] Next.js Middleware 설정 (`src/middleware.ts`)
- [x] Auth Callback Route (`src/app/auth/callback/route.ts`)
- [x] Server Actions (`src/lib/auth/actions.ts`)
  - `signInWithGoogle()`
  - `signOut()`
  - `getUser()`
  - `getSession()`
- [x] 로그인 페이지 (`src/app/login/page.tsx`)
- [x] Auth 에러 페이지 (`src/app/auth/auth-error/page.tsx`)
- [x] AuthStatus 컴포넌트 (`src/components/auth-status.tsx`)

### ✅ Phase 4: Elysia Auth Guard (완료)

- [x] Elysia용 Supabase 클라이언트 (`src/lib/supabase/elysia.ts`)
- [x] Auth Guard 플러그인 (`src/lib/elysia/auth.ts`)
  - `authPlugin`: 모든 요청에 Auth 정보 주입 (선택적)
  - `authGuard`: 인증 필수 (401 반환)
  - `optionalAuth`: 인증 정보 선택적 사용
- [x] Protected routes 설정 (`src/app/api/[[...slugs]]/route.ts`)
  - `/api/public/*`: Public routes
  - `/api/auth/*`: Optional auth routes
  - `/api/protected/*`: Protected routes
  - `/api/users/*`: Protected user routes

### ✅ Phase 5: Core API 구현 (완료)

- [x] User API (`src/lib/elysia/routes/users.ts`)
  - User 서비스 (`src/lib/services/user.ts`)
  - Prisma User 모델에 `supabaseId` 필드 추가
  - CRUD + findOrCreate (자동 연동)
- [x] Post API (`src/lib/elysia/routes/posts.ts`)
  - Post 서비스 (`src/lib/services/post.ts`)
  - PostImage, Reply 서비스 포함
  - Cursor-based pagination
- [x] Market API (`src/lib/elysia/routes/markets.ts`)
  - Market 서비스 (`src/lib/services/market.ts`)
  - MarketImage 서비스 포함
  - 상태 관리 (available, sold, reserved)
- [x] Artist API (`src/lib/elysia/routes/artists.ts`)
  - Artist 서비스 (`src/lib/services/artist.ts`)
  - Agency, ArtistGroup 서비스 포함
  - 계층 구조 (Agency → ArtistGroup → Artist)
- [x] Photocard API (`src/lib/elysia/routes/photocards.ts`)
  - Photocard 서비스 (`src/lib/services/photocard.ts`)
  - GalmangPoca 서비스 포함 (갈망포카 - 원하는 포토카드)
- [x] Like API (`src/lib/elysia/routes/likes.ts`)
  - Like 서비스 (`src/lib/services/like.ts`)
  - Toggle, batch check 기능

### ✅ Phase 6: Supabase Realtime Chat (완료)

- [x] Chat 서비스 (`src/lib/services/chat.ts`)
  - ChatRoom CRUD (생성, 조회, 삭제, 1:1 채팅방)
  - ChatRoomMember 관리 (추가, 제거, 목록)
  - ChatMessage CRUD (커서 기반 페이지네이션)
- [x] Chat API 라우트 (`src/lib/elysia/routes/chat.ts`)
- [x] Supabase Realtime Hooks (`src/lib/hooks/use-chat-realtime.ts`)
  - `useChatRealtime`: PostgreSQL Changes 구독
  - `useChatBroadcast`: Broadcast 채널 기반 (더 가벼움)
  - `useChatPresence`: 온라인 상태 추적

### ✅ Phase 7: Supabase Storage (완료)

- [x] Storage 서비스 (`src/lib/services/storage.ts`)
  - Base64/Buffer 파일 업로드
  - 파일 삭제, 이동, 복사
  - Public URL / Signed URL 생성
  - 파일 목록 조회
- [x] Storage API 라우트 (`src/lib/elysia/routes/storage.ts`)
- [x] Legacy 코드 삭제 완료

---

## File Structure

```
src/
├── app/
│   ├── api/[[...slugs]]/route.ts    # Elysia API 진입점
│   ├── auth/
│   │   ├── callback/route.ts        # OAuth callback
│   │   └── auth-error/page.tsx      # 인증 에러 페이지
│   ├── login/page.tsx               # 로그인 페이지
│   └── page.tsx                     # 홈페이지
├── components/
│   └── auth-status.tsx              # 인증 상태 컴포넌트
├── generated/
│   └── prisma/                      # Prisma Client (generated)
├── lib/
│   ├── auth/
│   │   └── actions.ts               # Auth Server Actions
│   ├── elysia/
│   │   ├── auth.ts                  # Elysia Auth Guard 플러그인
│   │   └── routes/
│   │       ├── artists.ts           # Artist, Agency, ArtistGroup API
│   │       ├── chat.ts              # Chat API (ChatRoom, ChatMessage)
│   │       ├── likes.ts             # Like API
│   │       ├── markets.ts           # Market, MarketImage API
│   │       ├── photocards.ts        # Photocard, GalmangPoca API
│   │       ├── posts.ts             # Post, Reply, PostImage API
│   │       ├── storage.ts           # Storage API (파일 업로드)
│   │       └── users.ts             # User API
│   ├── hooks/
│   │   └── use-chat-realtime.ts     # Supabase Realtime Hooks
│   ├── services/
│   │   ├── artist.ts                # Artist 서비스
│   │   ├── chat.ts                  # Chat 서비스
│   │   ├── like.ts                  # Like 서비스
│   │   ├── market.ts                # Market 서비스
│   │   ├── photocard.ts             # Photocard 서비스
│   │   ├── post.ts                  # Post 서비스
│   │   ├── storage.ts               # Storage 서비스
│   │   └── user.ts                  # User 서비스
│   ├── prisma.ts                    # Prisma Client with Adapter
│   └── supabase/
│       ├── client.ts                # Browser Client
│       ├── elysia.ts                # Elysia용 Supabase Client
│       ├── middleware.ts            # Session 갱신
│       └── server.ts                # Server Client
└── middleware.ts                    # Next.js Middleware
```

---

## Environment Variables

```env
# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SECRET_KEY=...

# Prisma (Supabase PostgreSQL)
DATABASE_URL=postgresql://...pooler...6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://...pooler...5432/postgres
```

---

## Commands

```bash
# 개발 서버
bun run dev

# Prisma
bun run prisma generate    # Client 생성
bun run prisma migrate dev # 마이그레이션
bun run prisma studio      # DB GUI

# 빌드
bun run build
```

---

## Notes

### Prisma 7 변경사항
- `schema.prisma`에서 `url`, `directUrl` 제거
- `prisma.config.ts`에서 datasource URL 설정
- Runtime에서 Driver Adapter 사용 필요 (`@prisma/adapter-pg`)

### Supabase Connection
- **DATABASE_URL (6543)**: Connection Pooling - 런타임 쿼리용
- **DIRECT_URL (5432)**: Direct Connection - 마이그레이션용

### 현재 구현된 API 엔드포인트

#### Core Routes
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api` | GET | - | API 정보 |
| `/api/public/health` | GET | - | Health check |
| `/api/auth/me` | GET | Optional | 현재 인증 상태 확인 |
| `/api/protected/profile` | GET | Required | Supabase Auth 사용자 정보 |

#### User API
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/users` | GET | - | 전체 사용자 목록 (공개 정보) |
| `/api/users/me` | GET | Required | 현재 사용자 정보 |
| `/api/users/me` | PUT | Required | 사용자 정보 수정 |
| `/api/users/me` | DELETE | Required | 회원 탈퇴 (soft delete) |
| `/api/users/:id` | GET | Required | 특정 사용자 조회 |

#### Post API
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/posts` | GET | - | 게시물 목록 (pagination) |
| `/api/posts/:id` | GET | - | 게시물 상세 |
| `/api/posts/search` | GET | - | 게시물 검색 |
| `/api/posts` | POST | Required | 게시물 생성 |
| `/api/posts/:id` | PUT | Required | 게시물 수정 |
| `/api/posts/:id` | DELETE | Required | 게시물 삭제 |
| `/api/posts/:id/replies` | GET | - | 댓글 목록 |
| `/api/posts/:id/replies` | POST | Required | 댓글 생성 |
| `/api/replies/:id` | PUT | Required | 댓글 수정 |
| `/api/replies/:id` | DELETE | Required | 댓글 삭제 |

#### Market API
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/markets` | GET | - | 마켓 목록 (pagination) |
| `/api/markets/:id` | GET | - | 마켓 상세 |
| `/api/markets/search` | GET | - | 마켓 검색 |
| `/api/markets` | POST | Required | 마켓 생성 |
| `/api/markets/:id` | PUT | Required | 마켓 수정 |
| `/api/markets/:id` | DELETE | Required | 마켓 삭제 |
| `/api/markets/:id/status` | PATCH | Required | 마켓 상태 변경 |

#### Artist API
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/agencies` | GET | - | 소속사 목록 |
| `/api/agencies/:id` | GET | - | 소속사 상세 |
| `/api/agencies` | POST | Required | 소속사 생성 |
| `/api/agencies/:id` | PUT | Required | 소속사 수정 |
| `/api/agencies/:id` | DELETE | Required | 소속사 삭제 |
| `/api/groups` | GET | - | 그룹 목록 |
| `/api/groups/:id` | GET | - | 그룹 상세 |
| `/api/agencies/:agencyId/groups` | GET | - | 소속사별 그룹 |
| `/api/groups` | POST | Required | 그룹 생성 |
| `/api/groups/:id` | PUT | Required | 그룹 수정 |
| `/api/groups/:id` | DELETE | Required | 그룹 삭제 |
| `/api/artists` | GET | - | 아티스트 목록 |
| `/api/artists/:id` | GET | - | 아티스트 상세 |
| `/api/artists/search` | GET | - | 아티스트 검색 |
| `/api/groups/:groupId/artists` | GET | - | 그룹별 아티스트 |
| `/api/artists` | POST | Required | 아티스트 생성 |
| `/api/artists/:id` | PUT | Required | 아티스트 수정 |
| `/api/artists/:id` | DELETE | Required | 아티스트 삭제 |

#### Photocard API
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/photocards` | GET | - | 포토카드 목록 (pagination) |
| `/api/photocards/:id` | GET | - | 포토카드 상세 |
| `/api/photocards/search` | GET | - | 포토카드 검색 |
| `/api/artists/:artistId/photocards` | GET | - | 아티스트별 포토카드 |
| `/api/photocards` | POST | Required | 포토카드 생성 |
| `/api/photocards/:id` | PUT | Required | 포토카드 수정 |
| `/api/photocards/:id` | DELETE | Required | 포토카드 삭제 |
| `/api/galmang-pocas` | GET | - | 갈망포카 목록 |
| `/api/galmang-pocas/:id` | GET | - | 갈망포카 상세 |
| `/api/galmang-pocas` | POST | Required | 갈망포카 생성 |
| `/api/galmang-pocas/:id` | PATCH | Required | 갈망포카 수량 수정 |
| `/api/galmang-pocas/:id` | DELETE | Required | 갈망포카 삭제 |

#### Like API
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/posts/:postId/like` | POST | Required | 좋아요 토글 |
| `/api/posts/:postId/likes` | GET | Required | 좋아요 여부 확인 |
| `/api/likes/batch` | POST | Required | 여러 게시물 좋아요 상태 확인 |
| `/api/users/:userId/likes` | GET | Required | 사용자가 좋아요한 게시물 |

#### Chat API
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/chat/rooms` | GET | Required | 내 채팅방 목록 |
| `/api/chat/rooms` | POST | Required | 채팅방 생성 |
| `/api/chat/rooms/direct` | POST | Required | 1:1 채팅방 조회/생성 |
| `/api/chat/rooms/:id` | GET | Required | 채팅방 상세 |
| `/api/chat/rooms/:id` | PATCH | Required | 채팅방 이름 수정 |
| `/api/chat/rooms/:id/leave` | DELETE | Required | 채팅방 나가기 |
| `/api/chat/rooms/:id/members` | GET | Required | 멤버 목록 |
| `/api/chat/rooms/:id/members` | POST | Required | 멤버 추가 |
| `/api/chat/rooms/:id/messages` | GET | Required | 메시지 목록 (pagination) |
| `/api/chat/rooms/:id/messages` | POST | Required | 메시지 전송 |
| `/api/chat/messages/:id` | DELETE | Required | 메시지 삭제 |

#### Storage API
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/storage/upload` | POST | Required | Base64 이미지 업로드 |
| `/api/storage/upload/multiple` | POST | Required | 여러 파일 업로드 |
| `/api/storage/delete` | DELETE | Required | 파일 삭제 |
| `/api/storage/url` | POST | Required | Public URL 조회 |
| `/api/storage/signed-url` | POST | Required | Signed URL 생성 |
| `/api/storage/list/:bucket` | GET | Required | 파일 목록 조회 |
| `/api/storage/buckets` | GET | Required | 사용 가능한 버킷 목록 |

### Supabase 설정

#### Realtime 설정
Realtime을 사용하려면 Supabase Dashboard에서 활성화가 필요합니다:

1. **Database > Replication** 에서 `ChatMessage` 테이블 활성화
2. 또는 SQL 실행:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE "ChatMessage";
   ```

#### Storage Bucket 설정
Supabase Dashboard에서 Storage Bucket 생성 필요:
- `images` - 일반 이미지
- `avatars` - 프로필 이미지
- `posts` - 게시물 이미지
- `markets` - 마켓 이미지
- `photocards` - 포토카드 이미지

---

## 마이그레이션 완료

모든 Legacy 기능이 새 스택으로 마이그레이션 완료되었습니다.
Legacy 코드(`legacy/` 폴더)는 삭제되었습니다.
