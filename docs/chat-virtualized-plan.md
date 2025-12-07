## 목표
- Supabase Realtime + TanStack Query v5 기반으로 채팅 메시지를 무한 스크롤/실시간 처리하면서 react-virtuoso로 가변 높이 리스트를 안정적으로 렌더링한다.
- 스크롤 튐 없이 새 메시지 따라가기, 위로 스크롤 시 과거 메시지 로드, 새 메시지 배지/읽지 않음 경계 등을 지원한다.

## 현재 상태 파악
- `src/app/chat/[roomId]/page.tsx`에서 최근 50개 메시지를 서버에서 받아 `ChatRoom`(client)로 넘김.
- `ChatRoom`(`src/components/chat/chat-room.tsx`)은 내부 state로 메시지/pending 메시지를 관리하며 단순 `overflow: auto` 리스트만 사용 → 가상화·무한 스크롤 없음, 새 메시지 배지 없음.
- 실시간 수신은 `useChatRealtime`(`src/lib/hooks/use-chat-realtime.ts`)로 Supabase Postgres Changes 구독. followOutput이나 unread 기준은 미구현.
- TanStack Query, react-virtuoso 의존성은 현재 패키지에 없음.

## 선택: react-virtuoso 우선
- 가변 높이를 자동 측정해 주고, `startReached`/`endReached`로 양방향 로드, `followOutput`으로 “맨 아래일 때만 자동 스크롤”을 쉽게 처리할 수 있음.
- 역방향(위로 과거 로드) 채팅 UX를 다루는 예제가 풍부하며, 별도 측정기 없이 이미지/멀티라인 메시지도 안정적으로 처리.
- TanStack Virtual로도 구현 가능하나, 높이 측정/스크롤 보정/새 메시지 follow 로직을 직접 작성해야 해서 현재 리소스에선 Virtuoso가 적합.

## 인터페이스 정의 (초안)
```ts
// 공통 엔티티 확장 (pending/실패 상태 포함)
export interface ChatMessageView extends ChatMessage {
  status?: "sending" | "sent" | "failed";
  clientId?: string; // 낙관적 메시지 구분용
}

// useChatMessages 훅 (Query + Realtime + 낙관 상태 관리)
interface UseChatMessagesOptions {
  roomId: string;
  initialPage: PaginatedMessages; // SSR에서 내려준 최근 페이지
  currentUserId: string;
}
interface UseChatMessagesResult {
  items: ChatMessageView[];        // 시간 오름차순
  fetchPrev: () => Promise<void>;  // startReached에서 호출
  hasPrev: boolean;
  isFetchingPrev: boolean;
  appendLocal: (content: string) => void; // 낙관 전송
  retry: (clientId: string) => void;
  removePending: (clientId: string) => void;
  isAtBottom: boolean;
  setAtBottom: (v: boolean) => void;
  newMessageCount: number;        // 바닥이 아닐 때 누적
  consumeNewMessages: () => void; // 배지 클릭 시 초기화 및 스크롤
}

// Virtualized 리스트 컴포넌트
interface ChatMessageListProps {
  messages: ChatMessageView[];
  onStartReached: () => void; // 과거 로드
  hasPrev: boolean;
  isFetchingPrev: boolean;
  followOutput: "smooth" | false;
  onAtBottomChange: (atBottom: boolean) => void;
  renderMessage: (msg: ChatMessageView) => React.ReactNode;
  renderDaySeparator?: (date: string) => React.ReactNode;
}
```

## 구현 스케치
> 의존성: `react-virtuoso`, `@tanstack/react-query` (provider를 `RootLayout`에 추가 필요), dayjs(이미 있음).

```tsx
// src/components/chat/chat-message-list.tsx (신규)
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";

export function ChatMessageList({
  messages,
  onStartReached,
  hasPrev,
  isFetchingPrev,
  followOutput,
  onAtBottomChange,
  renderMessage,
  renderDaySeparator,
}: ChatMessageListProps) {
  const virtuosoRef = useRef<VirtuosoHandle | null>(null);
  const data = useMemo(() => messages, [messages]);

  return (
    <Virtuoso
      ref={virtuosoRef}
      data={data}
      totalCount={data.length}
      initialTopMostItemIndex={data.length - 1} // 최신 메시지 기준
      startReached={() => {
        if (hasPrev && !isFetchingPrev) onStartReached();
      }}
      atBottomStateChange={onAtBottomChange}
      followOutput={followOutput} // (isAtBottom) => isAtBottom ? "smooth" : false 도 가능
      itemContent={(index, item) => renderMessage(item)}
      components={{
        Header: () =>
          isFetchingPrev ? <Spinner /> : hasPrev ? <div /> : null,
        Footer: () => null,
      }}
    />
  );
}
```

```tsx
// src/lib/hooks/use-chat-messages.ts (신규)
export function useChatMessages(opts: UseChatMessagesOptions): UseChatMessagesResult {
  const queryClient = useQueryClient();
  const {
    data,
    fetchNextPage, // 이전 메시지 로드 (cursor를 이전 페이지의 nextCursor로 사용)
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["chat", opts.roomId, "messages"],
    queryFn: async ({ pageParam }) =>
      api.chat.rooms({ id: opts.roomId }).messages.get({
        query: { cursor: pageParam ?? undefined, limit: "50" },
      }).then((r) => r.data!),
    initialPageParam: null,
    getNextPageParam: (last) => last.nextCursor,
    initialData: { pages: [opts.initialPage], pageParams: [null] },
  });

  // 낙관 메시지 관리 + realtime push
  // ...pending state reducer...

  // 새 메시지 배지
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);
  useChatRealtime(opts.roomId, (message) => {
    queryClient.setQueryData<InfiniteData<PaginatedMessages>>(
      ["chat", opts.roomId, "messages"],
      (prev) => prev
        ? { ...prev, pages: [...prev.pages, { messages: [message], nextCursor: null, hasMore: true }] }
        : prev,
    );
    setNewMessageCount((c) => (isAtBottom ? 0 : c + 1));
  });

  return { /* ...see 인터페이스 정의 */ };
}
```

### 읽지 않음/새 메시지 UX
- `atBottomStateChange`로 바닥 여부를 추적. 새 메시지 수신 시 바닥이 아니면 `newMessageCount` 증가, 배지를 표시.
- 배지 클릭 → `scrollToIndex(data.length - 1, { behavior: "smooth" })` 후 `newMessageCount` 리셋.
- “읽지 않음 경계”는 서버에서 lastReadAt을 내려주면 `renderMessage`에서 첫 unread 앞에 divider를 그리도록 확장.

### 이미지/가변 높이 고려
- Virtuoso가 이미지 높이를 lazy 측정하므로 `img`에 `loading="lazy"`를 사용하고, 로딩 중 깜빡임을 줄이기 위해 CSS에서 `min-height`/`background-color`를 주면 충분.
- 긴 텍스트는 `white-space: pre-wrap` + `word-break: break-word`로 처리.

### ChatRoom 연결 방식
1. `page.tsx`에서 `initialMessages`를 `PaginatedMessages` 형태(rooms/messages API shape)로 내려줌.
2. `ChatRoom`에서 `useChatMessages` 훅으로 상태/RT/낙관 전송을 통합 관리.
3. 메시지 영역을 `ChatMessageList`로 교체하고, `renderMessage`에 기존 버블 UI를 분리한 `ChatMessageBubble` 컴포넌트를 전달.
4. 입력창 로직은 기존을 재사용하되 `appendLocal` → API 전송 → 실패 시 상태 업데이트 패턴으로 변경.

## 다음 단계
1. 의존성 추가: `bun add react-virtuoso @tanstack/react-query` (provider 설치 포함) + Query Devtools 선택적.
2. `RootLayout`에 QueryClientProvider/Suspense 바인딩 추가, 기존 `ChatRoom`를 `useChatMessages + ChatMessageList`로 교체.
3. 새 메시지 배지/읽지 않음 경계 UI 컴포넌트 배치 후 모바일 스크롤 튐 검증 (iOS/Android).
4. 이미지 포함 메시지, 빠른 스크롤, Realtime 재접속 시 메시지 중복 여부를 집중적으로 QA.
