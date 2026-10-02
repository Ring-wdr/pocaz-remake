# Implementation Gaps & To‑Dos

이 문서는 에이전트가 후속 작업을 잡을 때 체크할 수 있는 TODO 리스트입니다. 각 항목은 파일/경로 단서와 함께 제공됩니다.

## 홈/로그인
- [ ] 홈 슬라이더 컨트롤·오토플레이/접근성 강화, 추천/검색 UX 보강 (`src/app/page.tsx`, `src/components/home`)
- [v] 로그인 로딩/에러 상태 및 추가 로그인 옵션 검토 (`src/app/login/page.tsx`)

## 커뮤니티
- [v] 게시글 수정 페이지 구현 또는 메뉴 제거 (`community/posts/[postId]/edit/page.tsx`, `page.client.tsx`)
- [v] 목록 검색/정렬/페이지네이션 및 오류·빈 상태 개선 (`components/community/sections/post-list-section.tsx`)
- [v] 비로그인 좋아요·댓글 가드 및 로그인 유도 (`components.tsx`, `comments-client.tsx`)
- [v] 댓글/답글 낙관적 업데이트·재시도 UX 추가 (`comments-client.tsx`)
- [v] 글쓰기: 제목/본문 분리, 업로드 실패·용량 제한, 로그인 체크 (`community/write/page.tsx`, `page.client.tsx`)

## 마켓
- [v] 검색바/필터 탭을 API 파라미터와 연동, 페이지네이션·정렬 추가 (`market/page.tsx`, `components/market/sections`)
- [v] 상세: 이미지 슬라이더 동작, 좋아요/공유 핸들러, 상태 배지 토스트·낙관적 처리 (`market/[productId]/*`)
- [v] 등록: 스토리지 업로드 사용, 상태/협상 가능 여부를 구조화해 전송, 검증·로그인 가드·에러 UX 강화 (`market/register/page.client.tsx`)

## 채팅
- [v] 전송 실패 재시도/알림, 첨부·이미지 전송 옵션 검토 (`components/chat/chat-room.tsx`)
- [v] Supabase realtime 시 사용자 정보 반복 fetch 제거(페이로드 포함 or 캐시) (`use-chat-realtime.ts`)
- [v] 타이핑/읽음/차단·나가기 등 관리 액션 검토 - 나가기 구현 완료, 타이핑/읽음은 추후
- [v] 채팅 목록 필터/검색·페이지네이션 및 필터 버튼 동작 구현 (`chat/list/page.tsx`, `components/chat/sections`)

## 마이페이지 (공통)
- [v] `users.me.summary` 엔드포인트 유효성/구현 후 실제 통계 연결 (`components/mypage/sections/stats-section.tsx`)
- [v] 활동·리스트 페이지 페이지네이션/필터 및 오류 UX 보완

## 마이페이지 (개별)
- [v] 내 글 링크: 이미 `/community/posts/${id}` 사용 중 (버그 아님) (`mypage/posts/page.tsx`)
- [v] 프로필 수정: 닉네임 중복 검증(API + debounce), 파일 타입/용량 제한(5MB), 저장 중 로딩 표시 (`mypage/edit/profile-form.tsx`, `lib/elysia/routes/users.ts`)
- [ ] 설정: 다크모드/테마 토글 실제 동작 및 영속화 (`mypage/settings/page.tsx`)
- [v] 알림 설정: 서버에 토글 저장(`/users/me/notification-settings`)하고 알림함(`/notifications`)·종 아이콘과 연동 (`mypage/notifications/page.client.tsx`, `components/notifications`). 웹 푸시(권한 요청·서비스 워커)는 아직 없다
- [v] 보안: 로그아웃/탈퇴 2차 확인 모달, 로딩 표시 강화 (`mypage/security/page.client.tsx`)
- [ ] 탈퇴 범위: 계정은 익명화되고(이메일·닉네임·프로필 사진 삭제) 다시 로그인해도 복구되지 않는다. 하지만 작성한 글·댓글·판매글·채팅 메시지와 Supabase Auth 계정(이메일·이름)은 남는다. 탈퇴 화면은 "모든 데이터가 영구적으로 삭제"된다고 안내하므로, 삭제 범위(법정 보존 기간이 있는 거래 기록 포함)를 정해 구현하거나 안내 문구를 고친다 (`mypage/security/page.client.tsx`, `lib/services/user.ts`)
- [v] 판매/구매/거래: 탭 필터링 동작 추가 (`mypage/sales/page.client.tsx`)
- [v] 찜: 위시 해제 액션 추가 (`mypage/wishlist/page.client.tsx`)
- [v] 좋아요한 글: 정렬 옵션(좋아요한 순/인기순/최신순) 추가, 페이지네이션 유지 (`mypage/likes/page.tsx`, `lib/services/like.ts`)

## 고객지원/공통
- [v] 문의: 첨부/연락처 필드, 접수 번호·상태 표시, 로그인 가드 (`support/inquiry/page.client.tsx`)
- [v] FAQ/약관/오류 페이지에 지원 채널·재시도 링크 강화 (`support/*`, `error.tsx` 등)
- [v] 전역 에러/권한 페이지에 재시도·피드백/로그 수집 연결

## 운영 반영·결정 필요 (2026-10-01 감사 후속, 자세한 내용은 `docs/opus-5.5-improvements.md`)
- [ ] RLS: Supabase 대시보드에서 확인한 뒤 `supabase/enable-rls.sql` 실행
- [ ] 인덱스 마이그레이션(`prisma/migrations/20261001124058_add_query_indexes`)을 운영 DB에 적용 (`bun run db:migrate:prod`)
- [ ] BEST 포카 기준 정하기: 지금은 최근 포카와 같은 쿼리 (`components/home/sections/best-poca-section.tsx`)
- [ ] rate limit을 공유 저장소로 옮기고 쓰기 라우트 전반으로 넓히기 (`lib/elysia/routes/likes.ts`)
- [ ] 이미지 URL 검증: 프로필 사진·게시글/상품 이미지·채팅 `image:` 메시지가 임의 URL을 받아 `<img>`로 그린다 (`lib/elysia/routes/users.ts`, `posts.ts`, `markets.ts`, `components/chat/chat-room.tsx`)
- [ ] 활동 내역·거래 내역을 만드는 코드가 없어 해당 화면이 항상 비어 있다 (`lib/services/activity.ts`, `lib/services/transaction.ts`)
