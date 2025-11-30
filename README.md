# Pocaz

포토카드 거래 및 커뮤니티 플랫폼

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | ![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js) |
| Language | ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white) |
| UI | ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black) ![StyleX](https://img.shields.io/badge/StyleX-0.17-blue) |
| Backend | ![Elysia](https://img.shields.io/badge/Elysia.js-1.4-7C3AED?logo=bun&logoColor=white) |
| Database | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white) |
| ORM | ![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white) |
| Auth | ![Supabase](https://img.shields.io/badge/Supabase-Auth-3FCF8E?logo=supabase&logoColor=white) |
| Realtime | ![Supabase](https://img.shields.io/badge/Supabase-Realtime-3FCF8E?logo=supabase&logoColor=white) |
| Package Manager | ![Bun](https://img.shields.io/badge/Bun-1.x-FBF0DF?logo=bun&logoColor=black) |
| Lint/Format | ![Biome](https://img.shields.io/badge/Biome-2.3-60A5FA?logo=biome&logoColor=white) |
| Icons | ![Lucide](https://img.shields.io/badge/Lucide-React-F56565) |

## 주요 기능

- **홈**: 메인 슬라이더, 베스트/최신 포카 목록
- **커뮤니티**: 게시글 작성, 댓글, 좋아요
- **마켓**: 포토카드 거래 등록/조회
- **채팅**: 실시간 1:1 채팅
- **마이페이지**: 프로필, 활동 통계

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── api/[[...slugs]]/   # Elysia API 라우트
│   ├── chat/               # 채팅
│   ├── community/          # 커뮤니티
│   ├── market/             # 마켓
│   ├── mypage/             # 마이페이지
│   └── login/              # 로그인
├── components/             # UI 컴포넌트
│   ├── home/
│   ├── community/
│   ├── market/
│   ├── chat/
│   └── mypage/
├── lib/
│   ├── elysia/             # API 라우트 정의
│   ├── services/           # 비즈니스 로직
│   ├── supabase/           # Supabase 클라이언트
│   └── hooks/              # React 훅
└── generated/prisma/       # Prisma 생성 타입
```

## 시작하기

### 환경 변수 설정

`.env.example`을 참고하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

필요한 환경 변수:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 익명 키
- `SUPABASE_SECRET_KEY` - Supabase 서비스 키
- `DATABASE_URL` - PostgreSQL 연결 URL (Transaction mode)
- `DIRECT_URL` - PostgreSQL 직접 연결 URL

### 의존성 설치

```bash
bun install
```

### 데이터베이스 마이그레이션

```bash
bunx prisma migrate dev
```

### 개발 서버 실행

```bash
bun dev
```

[http://localhost:3000](http://localhost:3000)에서 확인

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `bun dev` | 개발 서버 실행 |
| `bun run build` | Prisma 클라이언트 생성 + 프로덕션 빌드 |
| `bun run serve` | 빌드 후 3016 포트에서 실행 |
| `bun run lint` | Biome 린트 검사 |
| `bun run check` | Biome 전체 검사 |
| `bun run format` | 코드 포맷팅 |

> `postinstall` 스크립트가 `prisma generate`를 자동 실행하여 Prisma 클라이언트를 생성합니다.

## 배포

### Vercel

Vercel 배포 시 환경 변수를 설정하면 자동으로 빌드됩니다.

1. Vercel 프로젝트에 환경 변수 추가
2. `bun install` 시 `postinstall`이 Prisma 클라이언트 생성
3. `bun run build`로 Next.js 빌드

## 데이터 모델

- **User**: 사용자 (Supabase Auth 연동)
- **Agency / ArtistGroup / Artist**: 소속사, 그룹, 아티스트
- **Photocard / GalmangPoca**: 포토카드, 갈망 포카
- **Post / Reply / Like**: 게시글, 댓글, 좋아요
- **Market**: 마켓 거래 상품
- **ChatRoom / ChatMessage**: 채팅방, 메시지
