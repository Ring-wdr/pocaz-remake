## 채팅 작업 통합 요약 (Tasks 1~5 진행 현황)

- **구조 파악/설계/구현/브리징/UX 튜닝**을 반영한 최신 상태를 요약한다.

### 구현된 핵심
- **가상화 리스트** `src/components/chat/chat-message-list.tsx`
  - Virtuoso + `firstItemIndex` 보정(프리펜드 시 스크롤 튐 방지), `computeItemKey`=id.
  - 날짜 배지(오늘/어제/날짜), 읽음 경계(`lastReadMessageId`/`lastReadAt`), role="log".
  - startReached → onStartReached(guarded); atBottomStateChange → 상위 followOutput/배지 제어.
- **데이터/실시간/낙관** `src/lib/hooks/use-chat-messages.ts`
  - `useRoomMessagesInfiniteQuery`(cursor=id), `useRoomMessagesRealtime`(Supabase INSERT), pending/failed/sent 병합 정렬.
  - 상태: `hasPrev`, `isFetchingPrev`, `fetchPrev`, `isAtBottom`, `newMessageCount`, 낙관 전송 헬퍼.
- **페이지 통합** `src/app/chat/[roomId]/page.tsx` → `PaginatedMessages` SSR 전달,
  **UI** `src/components/chat/chat-room.tsx` → 리스트/훅 연결, 새 메시지 배지(+Alt+N 포커스, Alt+ArrowDown 맨 아래).

### UX 패턴 체크리스트
- 과거 로드: startReached → fetchPrev, prepend 시 firstItemIndex 증가.
- 새 메시지: 바닥일 때만 followOutput("smooth"); 오프-바텀은 배지+수동 스크롤.
- 날짜/읽음: 날짜 변경마다 배지, lastRead 기준 “여기까지 읽음”.
- 접근성/키보드: role="log" aria-live="polite"; 배지 버튼 포커스; 단축키는 입력 포커스 시 무시.

### 남은 과제/QA
- 서버에서 lastRead 전달하여 unread divider 활성화.
- iOS/Android에서 prepend 연속 호출 시 점프 여부 검증.
- 배지/단축키 안내 노출 여부 결정.
- Realtime 재접속/중복 삽입 시 dedupe 추가 검토.
