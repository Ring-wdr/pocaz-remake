# Implementation Gaps & To‑Dos

이 문서는 에이전트가 후속 작업을 잡을 때 체크할 수 있는 TODO 리스트입니다. 각 항목은 파일/경로 단서와 함께 제공됩니다.

## 홈/로그인
- [ ] 홈 슬라이더 컨트롤·오토플레이/접근성 강화, 추천/검색 UX 보강 (`src/app/page.tsx`, `src/components/home`)
- [v] 로그인 로딩/에러 상태 및 추가 로그인 옵션 검토 (`src/app/login/page.tsx`)

## 커뮤니티
- [ ] 게시글 수정 페이지 구현 또는 메뉴 제거 (`community/posts/[postId]/components.tsx` → `/community/posts/[id]/edit`)
- [ ] 목록 검색/정렬/페이지네이션 및 오류·빈 상태 개선 (`components/community/sections/post-list-section.tsx`)
- [ ] 비로그인 좋아요·댓글 가드 및 로그인 유도
- [ ] 댓글/답글 낙관적 업데이트·재시도 UX 추가 (`comments-client.tsx`)
- [ ] 글쓰기: 제목/본문 분리, 업로드 실패·용량 제한, 로그인 체크 (`community/write/page.client.tsx`)

## 마켓
- [ ] 검색바/필터 탭을 API 파라미터와 연동, 페이지네이션·정렬 추가 (`market/page.tsx`, `components/market/sections`)
- [ ] 상세: 이미지 슬라이더 동작, 좋아요/공유 핸들러, 상태 배지 토스트·낙관적 처리 (`market/[productId]/*`)
- [ ] 등록: 스토리지 업로드 사용, 상태/협상 가능 여부를 구조화해 전송, 검증·로그인 가드·에러 UX 강화 (`market/register/page.client.tsx`)

## 채팅
- [ ] 전송 실패 재시도/알림, 첨부·이미지 전송 옵션 검토 (`components/chat/chat-room.tsx`)
- [ ] Supabase realtime 시 사용자 정보 반복 fetch 제거(페이로드 포함 or 캐시) (`use-chat-realtime.ts`)
- [ ] 타이핑/읽음/차단·나가기 등 관리 액션 검토
- [ ] 채팅 목록 필터/검색·페이지네이션 및 필터 버튼 동작 구현 (`chat/list/page.tsx`, `components/chat/sections`)

## 마이페이지 (공통)
- [ ] `users.me.summary` 엔드포인트 유효성/구현 후 실제 통계 연결 (`components/mypage/sections/stats-section.tsx`)
- [ ] 활동·리스트 페이지 페이지네이션/필터 및 오류 UX 보완

## 마이페이지 (개별)
- [ ] 내 글 링크 버그: `/community/posts/${id}`로 수정 (`mypage/posts/page.tsx`)
- [ ] 프로필 수정: 닉네임 중복 검증, 파일 제한, 저장 중 로딩 표시 (`mypage/edit/profile-form.tsx`)
- [ ] 설정: 다크모드/테마 토글 실제 동작 및 영속화 (`mypage/settings/page.tsx`)
- [ ] 알림 설정: 서버/푸시 권한 연동, 토글 영속화 (`mypage/notifications/page.client.tsx`)
- [ ] 보안: 탈퇴/로그아웃 피드백·재인증/2차 확인 강화 (`mypage/security/page.client.tsx`)
- [ ] 판매/구매/거래/찜: 필터·정렬/탭 동작, 위시 해제·상태 변경 액션 추가 (`mypage/wishlist|sales|purchases|trades/page.tsx`)
- [ ] 좋아요한 글: 페이지네이션·정렬 및 오류/빈 상태 개선 (`mypage/likes/page.tsx`)

## 고객지원/공통
- [ ] 문의: 첨부/연락처 필드, 접수 번호·상태 표시, 로그인 가드 (`support/inquiry/page.client.tsx`)
- [ ] FAQ/약관/오류 페이지에 지원 채널·재시도 링크 강화 (`support/*`, `error.tsx` 등)
- [ ] 전역 에러/권한 페이지에 재시도·피드백/로그 수집 연결
