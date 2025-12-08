## 채팅 가상화/실시간 구현 요약 (최신)

### 개요
- Supabase Realtime + TanStack Query v5 + react-virtuoso 기반으로 가변 높이 채팅 리스트를 구현했다.
- 위로 스크롤 시 과거 로드, 바닥일 때만 새 메시지 자동 스크롤, 바닥이 아닐 때는 배지로 안내.
- 날짜 배지/읽지 않음 경계/접근성(role="log")을 포함한 프로덕션 스크롤 UX를 구성했다.

### 현재 코드 스냅샷
- 리스트: `src/components/chat/chat-message-list.tsx`
  - Virtuoso + `firstItemIndex`로 prepend 시 스크롤 튐 방지, `computeItemKey`에 id 사용.
  - 날짜 배지: 첫 메시지 및 날짜 변경 지점마다 오늘/어제/날짜(YYYY.MM.DD) 표시.
  - 읽음 경계: `lastReadMessageId` 또는 `lastReadAt`가 주어지면 첫 미읽음 앞에 “여기까지 읽음” 구분선.
  - 접근성: `role="log" aria-live="polite" aria-relevant="additions text"`.
  - Props: `messages`, `hasPrev`, `isFetchingPrev`, `onStartReached`, `onAtBottomChange`, `renderMessage`, optional `virtuosoRef`, `lastReadMessageId`, `lastReadAt`.
- 데이터/실시간: `src/lib/hooks/use-chat-messages.ts`
  - `useRoomMessagesInfiniteQuery`: cursor=id 기반 페이지네이션(fetchPrev).
  - `useRoomMessagesRealtime`: Supabase INSERT 구독 → 마지막 페이지 append + 오프-바텀 시 `newMessageCount` 증가(자기 메시지는 무시).
  - `useChatMessages`: pending/failed/sent 병합 정렬(오름차순), `isAtBottom`/`newMessageCount` 상태 제공, 낙관 전송 헬퍼 포함.
- 페이지 통합: `src/app/chat/[roomId]/page.tsx`가 `PaginatedMessages` 형태로 초기 페이지 전달. `ChatRoom`(`src/components/chat/chat-room.tsx`)이 훅과 리스트를 사용하며 새 메시지 배지/단축키(Alt+ArrowDown 맨 아래, Alt+N 배지 포커스)를 제공.

### 데이터/스크롤 흐름 (텍스트)
- SSR: `ChatRoomPage` → `initialPage (PaginatedMessages)` 주입
- 클라이언트: `ChatRoom` → `useChatMessages`
  - `useRoomMessagesInfiniteQuery` ← Eden GET `/chat/rooms/:id/messages` (cursor=id)
  - `useRoomMessagesRealtime` ← Supabase INSERT → cache append, 바닥 아닐 때 배지 카운트
  - pending/failed → merged items (createdAt 오름차순)
- 리스트: `ChatMessageList`
  - `startReached` → `fetchPrev` (guard: `hasPrev && !isFetchingPrev`)
  - prepend 시 `firstItemIndex += delta`로 위치 유지
  - `atBottomStateChange` → 상위에서 followOutput/배지 제어
  - 날짜 배지/읽음 경계/메시지 버블 렌더

### UX 체크리스트 (구현됨)
- 과거 로딩: startReached → onStartReached; prepend 보정(firstItemIndex), item key=id.
- 새 메시지: 바닥일 때만 followOutput("smooth"); 바닥이 아니면 “새 메시지 N개” 배지 + 클릭/Alt+N→Enter로 스크롤/리셋.
- 읽음 경계: lastReadMessageId/lastReadAt로 “여기까지 읽음” 표시.
- 날짜 라벨: 날짜 변경마다 자동 배지(오늘/어제/날짜).
- 접근성: role="log", aria-live="polite"; 배지 버튼 포커스 가능; 단축키는 입력 요소 포커스 시 무시.

### 남은 작업/QA 포인트
- lastRead 값을 서버/클라이언트에서 주입해 divider를 실제 활성화.
- 모바일(iOS/Android)에서 prepend 연속 호출 시 스크롤 점프 여부 검증.
- 새 메시지 배지/단축키를 UI 도움말로 안내할지 결정.
- Realtime 재접속/중복 삽입 여부 확인, 필요 시 dedupe 강화.
