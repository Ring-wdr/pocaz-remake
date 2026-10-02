# 단기 UX 개선 구현 계획

작성 2026-10-02 · 브랜치 `claude/sleepy-ritchie-0xop11` · 범위: 사용자 관점 제안 중 단기에 끝낼 수 있는 1~4번. 5번(교환·구해요, 시세, 가격 제안)과 웹 푸시, 홈 배너 관리, BEST 기준은 미룬다.

## 진행 방식

- 하위 작업 하나를 서브 에이전트(Sonnet) 하나가 맡는다. 메인 세션은 계획, 검수, 푸시만 한다.
- 순차로 진행한다. 채팅방, 하단 탭, Prisma 스키마를 여러 작업이 건드리므로 병렬로 돌리지 않는다.
- 각 작업은 `bun run typecheck`, `bun run check`, `bun test`를 통과한 뒤 커밋한다.
- 운영 DB에는 아무것도 적용하지 않는다. 마이그레이션 파일만 만들고 테스트 DB에만 적용한다. 운영 반영은 맨 아래 "운영 반영"을 따른다.

### 상태

| ID | 작업 | 상태 |
|---|---|---|
| 1a | 거래 완료 API | 완료 |
| 1b | 채팅방 거래 완료 UI | 완료 |
| 1c | 거래 후기 | 완료 |
| 2a | 상품 상태·협상 가능 필드 구조화 | 완료 |
| 2b | 상품 수정·삭제 | 완료 |
| 2c | 아티스트 태그와 필터 | 완료 |
| 3a | 채팅 안 읽음 표시 | 완료 |
| 3b | 알림 백엔드 | 완료 |
| 3c | 알림 UI와 알림 설정 | 대기 |
| 4a | 판매자 공개 프로필 | 대기 |
| 4b | 로그인 후 원래 화면 복귀 | 대기 |
| 4c | 작은 수정 묶음 | 대기 |

## 공통 규칙 (서브 에이전트용)

1. 먼저 `AGENTS.md`, 이 문서의 담당 섹션, `.claude/skills/server/*.md`, `.claude/skills/stylex/SKILL.md`, `.claude/skills/utils/SKILL.md`를 읽는다.
2. 담당 섹션 밖으로 범위를 넓히지 않는다. 계획과 코드가 다르면 코드를 따르고, 보고에 어떻게 달리 했는지 적는다.
3. UI 문구, 주석, 문서는 한국어. 파일명은 kebab-case. StyleX 규칙(다중 값 shorthand 금지, 토큰 사용)을 지킨다.
4. 서버 컴포넌트는 Eden 클라이언트로 데이터를 가져온다. 변경 뒤에는 보여 주는 데이터를 갱신한다(`router.refresh()`, `invalidateQueries`).
5. Prisma 스키마를 바꾸는 작업의 순서:
   - `prisma/schema.prisma` 수정
   - `DIRECT_URL=$TEST_DATABASE_URL bunx prisma migrate dev --name <이름> --create-only` 로 마이그레이션 파일 생성 (테스트 DB는 로컬 Postgres라 안전하다)
   - 생성된 `migration.sql`을 검토·보완
   - `DIRECT_URL=$TEST_DATABASE_URL bunx prisma migrate deploy` 로 테스트 DB에 적용
   - `bun run db:generate`
   - `.env`의 운영 DB를 건드리는 `bun run db:migrate`, `db:push`, `db:reset`은 실행하지 않는다.
6. 새 기능에는 테스트를 붙인다. API는 `test/api/*.test.ts` 패턴(`callApi`, `createUser`, `resetDb`, `describe.skipIf(!hasTestDb)`), UI는 `test/ui/*.test.tsx` 패턴을 따른다.
7. 검증: `bun run typecheck`, `bun run check`(기존 경고 11개·info 19개 외 새 오류 없음), `bun test` 모두 통과.
8. 끝나면 이 문서 상태 표의 담당 행을 `완료`로 바꾸고, 관련 파일만 `git add` 해서 한 번 커밋한다. 푸시는 하지 않는다. 커밋 메시지는 영어 conventional 제목(예: `feat(market): record a buyer when a trade completes`) 과 짧은 본문, 그리고 메인 세션이 알려 준 footer 두 줄.
9. 마지막 보고는 15줄 이내: 바뀐 동작, 추가·수정 파일, 검증 결과(명령별), 계획과 달리 한 결정, 다음 작업이 알아야 할 것.

## 1. 거래 완료 흐름과 후기

사용자 문제: 판매자가 "판매완료"로 바꿔도 누구에게 팔았는지 남지 않아 구매 내역, 거래 내역, 마이페이지 거래 수가 항상 0이다. 후기를 남길 곳도 없다.

### 1a 거래 완료 API

- 서비스 `transactionService.completeTrade({ marketId, sellerId, buyerId, price? })` (`src/lib/services/transaction.ts`):
  - 검사: 상품 없음 404 · 판매자가 아님 403 · `buyerId === sellerId` 400 · 구매자 없음/탈퇴 400 · 구매자가 이 상품의 채팅방(`ChatRoom.marketId === marketId`) 멤버가 아님 400 · 이미 완료된 거래(`status: completed`)가 있음 409(기존 거래 id 포함).
  - 효과는 하나의 `prisma.$transaction` 안에서: `Transaction` 생성(`type: "purchase"`, `status: "completed"`, `price: body.price ?? market.price ?? 0`), 상품 `status: "sold"`, 활동 기록 두 건(`activityService.create`, 판매자 `"<상품명>" 판매 완료`, 구매자 `"<상품명>" 구매 완료`, `type: "trade"`, `targetType: "transaction"`, `targetId: transaction.id`).
- 라우트 `POST /api/markets/:id/complete` (`src/lib/elysia/routes/markets.ts`의 인증 라우트) · body `{ buyerId: string; price?: number }` · 201 `{ id, marketId, buyerId, sellerId, price, completedAt }` · 오류는 위 상태 코드와 `{ error }`.
- 채팅방 상세 응답(`GET /api/chat/rooms/:id`)의 `market`에 `transaction: { id, buyerId, sellerId, price, completedAt } | null` 추가. 멤버만 보는 응답이라 여기에 둔다. `src/types/entities`의 `ChatMarketInfo`도 맞춘다.
- 테스트 `test/api/trade-complete.test.ts`: 성공 시 201, 상품 sold, `/users/me/trades`·`/users/me/purchases`에 양쪽 모두 보임, `/users/me/summary`의 `trades`가 1 · 판매자가 아니면 403 · 채팅방 멤버가 아닌 구매자 400 · 두 번째 완료 409 · 자기 자신 400.

### 1b 채팅방 거래 완료 UI

- `src/components/chat/chat-room.tsx` 상품 배너:
  - 상태 텍스트를 영문 그대로(`available`) 보여 주던 것을 한국어 라벨(판매중/예약중/판매완료)로 바꾼다.
  - 현재 사용자가 상품 주인이고 `market.transaction`이 없고 상태가 `sold`가 아니면 "거래 완료" 버튼. 누르면 `confirmAction`(제목 "거래 완료", 설명 "<상대 닉네임>님과 거래를 완료할까요? 상품이 판매완료로 바뀌고 양쪽 거래 내역에 남아요.", 확인 "거래 완료") → `api.markets({ id }).complete.post({ buyerId: partner.id })` → 성공 토스트 "거래를 완료했어요. 거래 내역에서 확인할 수 있어요." → `router.refresh()` 와 `chatRoomsQueryKey`, 상품 정보 쿼리 invalidate. 실패는 토스트.
  - `market.transaction`이 있으면 "거래 완료" 뱃지.
- `src/components/market/status-changer.tsx`: 주인이 "판매완료"를 고르면 바로 바꾸지 말고 `confirmAction`(제목 "판매완료로 변경", 설명 "채팅방에서 '거래 완료'를 누르면 구매자와의 거래가 내역에 남아요. 구매자 지정 없이 상태만 바꿀까요?", 확인 "상태만 변경", 취소 "취소"). 취소하면 이전 상태로 되돌린다.
- `src/app/chat/[roomId]/page.tsx`에서 `transaction`을 `ChatRoom`까지 전달.
- 테스트 `test/ui/chat-trade-complete.test.tsx`: 주인에게만 버튼이 보이고, 거래가 있으면 뱃지가 보인다.

### 1c 거래 후기

- 스키마 `Review`: `id`, `transactionId`, `reviewerId`, `revieweeId`, `rating Int`(1~5), `content String?`, `createdAt`; `@@unique([transactionId, reviewerId])`, `@@index([revieweeId, createdAt(sort: Desc)])`. `User`에 `reviewsWritten`/`reviewsReceived`, `Transaction`에 `reviews` 관계.
- 서비스 `src/lib/services/review.ts`: `create`(거래의 구매자·판매자만, 상대가 reviewee, 1인 1회), `listByUser(userId, { cursor, limit })`, `summary(userId)` → `{ reviewCount, averageRating(소수 1자리 또는 null) }`.
- 라우트 `src/lib/elysia/routes/reviews.ts` 를 메인 앱에 등록:
  - `POST /api/transactions/:id/reviews` body `{ rating: 1..5, content?: string(최대 300) }` · 201 · 당사자가 아니면 403 · 중복 409 · 거래 없음 404.
  - `GET /api/users/:id/reviews` 공개 · 커서 페이지네이션 · 항목 `{ id, rating, content, createdAt, reviewer: { id, nickname, profileImage }, market: { id, title } }`.
- `GET /api/users/:id` 공개 응답에 `createdAt`, `tradeCount`, `reviewCount`, `averageRating` 추가.
- `GET /api/users/me/trades`, `/users/me/purchases` 항목에 `reviewed: boolean`(내가 후기를 썼는지)과 `partnerId` 추가. 채팅방 상세의 `market.transaction`에 `myReviewed: boolean` 추가.
- UI:
  - 공용 `src/components/review/review-bottom-sheet.tsx`(클라이언트): `BottomSheet` 안에 별 5개 버튼(`aria-label="별 n개"`), 300자 textarea와 글자 수, 제출. 성공 토스트 "후기를 남겼어요", 실패 토스트.
  - 채팅방 배너: 거래가 있고 내가 당사자이면 `myReviewed`가 false일 때 "후기 남기기" 버튼, true면 "후기 작성 완료" 텍스트.
  - `/mypage/trades`, `/mypage/purchases` 항목: `reviewed`가 false면 "후기 쓰기" 버튼(작은 클라이언트 컴포넌트) → 같은 바텀시트 → 성공 후 `router.refresh()`.
- 테스트 `test/api/reviews.test.ts`: 구매자가 판매자 후기 201 · 제3자 403 · 중복 409 · rating 0/6 422 · `/users/:id`의 `averageRating`, `reviewCount` 갱신 · `/users/me/trades`의 `reviewed`.

## 2. 상품 정보 구조화와 멤버 태그

사용자 문제: 상태와 협상 가능 여부가 설명문 끝에 글자로 붙어 목록에서 보이지도 걸러지지도 않는다. 판매자는 상품을 고치거나 지울 수 없다. 멤버 기준으로 찾을 수 없다.

### 2a 상품 상태·협상 가능 필드 구조화

- 스키마 `Market`: `condition String?`(값 `new` | `like-new` | `good` | `used`, 등록 폼의 id와 같음), `isNegotiable Boolean @default(false)`.
- 마이그레이션 SQL에 백필을 넣는다. `-- backfill:start` 와 `-- backfill:end` 주석 사이에:
  - 설명 끝의 `\n\n---\n상태: <라벨> · 가격 협상: <가능|불가>` 꼬리표를 파싱해 `condition`(새 상품→new, 거의 새것→like-new, 사용감 적음→good, 사용감 있음→used)과 `isNegotiable`(가능→true)을 채우고 꼬리표를 설명에서 제거한다.
  - `price IS NULL` 인 행은 `isNegotiable = true`.
- API(`markets.ts`): 응답 스키마에 `condition: t.Nullable(enum)`, `isNegotiable: t.Boolean()`; POST/PUT body에 `condition?`, `isNegotiable?`; 목록·검색·상태별 조회 query에 `condition?`, `negotiable?: boolean` 필터.
- 서비스: `findAll`, `findByStatus`, `search`의 중복을 `findMany(filters)` 하나로 합쳐도 된다. 라우트 계약은 유지.
- 클라이언트 `src/components/market/v2`: `MarketSearchFilters`에 `condition`, `negotiable` 추가, `search-params.ts`·`update-query-string.ts`·`get-market-list.ts`·`market-list-client.tsx`가 모두 전달. `filter-bar.tsx`에 상태 칩 줄(전체/새 상품/거의 새것/사용감 적음/사용감 있음)과 "협상 가능만" 토글 칩.
- 등록 폼(`src/app/market/register/page.client.tsx`): 설명에 꼬리표를 붙이지 않고 `condition`, `isNegotiable`을 보낸다.
- 상세(`src/app/market/[productId]/page.tsx`): 가격 아래 `Badge`로 상태 라벨과 "협상 가능". 목록 카드(`market-grid-item.tsx`): 가격 옆 흐린 글씨로 "거의 새것 · 협상 가능".
- `src/types/entities`의 `MarketItem`에 필드 추가.
- 테스트 `test/api/market-fields.test.ts`: 생성·응답, 세 목록 엔드포인트의 `condition`/`negotiable` 필터. `test/api/market-backfill.test.ts`: 옛 형식 설명으로 행을 만든 뒤 마이그레이션 파일에서 `backfill:start`~`backfill:end` 사이 SQL을 읽어 `$executeRawUnsafe`로 실행하고 필드와 설명을 검증.

### 2b 상품 수정·삭제

- 등록 폼을 `src/components/market/market-form.tsx`로 뽑아 `mode: "create" | "edit"`, 초기값, 기존 이미지 목록을 받게 한다. 등록 페이지는 이 컴포넌트를 쓴다.
- 수정 페이지 `src/app/market/[productId]/edit/page.tsx`(서버: 비로그인 → `/login?redirect=/market/<id>/edit`, 주인이 아니면 `/market/<id>`로) + `page.client.tsx`.
- 수정 저장 순서: `PUT /markets/:id`(제목·가격·협상·상태·설명) → 새 이미지 업로드 후 `POST /markets/:id/images` → 지운 기존 이미지 `DELETE /markets/:id/images/:imageId`. 이미지는 최소 1장 남아야 한다(폼 검증). 끝나면 토스트, `router.push('/market/<id>')`, `router.refresh()`.
- 상세 헤더(`src/app/market/[productId]/components.tsx`의 `Header`): 주인에게 더보기 메뉴(수정, 삭제). 게시글 상세의 `PostActions`(react-aria Menu) 패턴을 따른다. 삭제는 `confirmAction` → `DELETE /markets/:id` → 토스트 → `router.push('/market')` + `router.refresh()`.
- 테스트 `test/ui/market-owner-actions.test.tsx`: 주인에게만 메뉴. `test/ui/market-form.test.tsx`: 수정 모드에서 마지막 이미지는 지울 수 없다.

### 2c 아티스트 태그와 필터

- 스키마 `Market`: `groupId String?` → `ArtistGroup`, `artistId String?` → `Artist`, 각각 `@@index`. 역관계 `ArtistGroup.markets`, `Artist.markets`.
- 시드 `prisma/seed-catalog.ts` + `package.json` 스크립트 `db:seed:catalog`(`bun run prisma/seed-catalog.ts`). 이름 기준 upsert라 여러 번 실행해도 같다. 명단은 아래 "시드 카탈로그"를 그대로 쓴다.
- API: 상품 응답에 `group: { id, name } | null`, `artist: { id, name } | null`; POST/PUT body에 `groupId?`, `artistId?`(둘 다 있으면 아티스트가 그 그룹 소속인지 검사, 아니면 400); 목록·검색·상태별 query에 `groupId?`, `artistId?`; 검색 키워드는 `artist.name`, `group.name`에도 매치.
- 폼(`market-form.tsx`): "아티스트(선택)" 영역에 그룹 `select` → 멤버 `select`. 목록은 기존 공개 API(`GET /api/groups`, `GET /api/groups/:id/artists`)에서 가져온다.
- 상세: 제목 위에 "르세라핌 · 김채원" 칩, 누르면 `/market?groupId=..&artistId=..`.
- 목록: 상태 탭 위에 그룹 칩 줄(가로 스크롤, "전체" + 그룹). 그룹을 고르면 멤버 칩 줄이 나타난다. URL 파라미터와 동기화. 카드에 "그룹 · 멤버" 흐린 글씨.
- 테스트 `test/api/market-artist-filter.test.ts`: 시드 없이 테스트 안에서 그룹·아티스트를 만들고 필터와 멤버 이름 검색을 검증. `test/api/seed-catalog.test.ts`: 시드 함수를 두 번 실행해도 행 수가 같다.

#### 시드 카탈로그

소속사 → 그룹 → 멤버. 이름은 한국어 활동명.

- 하이브(빅히트 뮤직) → 방탄소년단: RM, 진, 슈가, 제이홉, 지민, 뷔, 정국
- 하이브(빅히트 뮤직) → 투모로우바이투게더: 수빈, 연준, 범규, 태현, 휴닝카이
- 쏘스뮤직 → 르세라핌: 사쿠라, 김채원, 허윤진, 카즈하, 홍은채
- 어도어 → 뉴진스: 민지, 하니, 다니엘, 해린, 혜인
- 빌리프랩 → 엔하이픈: 정원, 희승, 제이, 제이크, 성훈, 선우, 니키
- 플레디스 → 세븐틴: 에스쿱스, 정한, 조슈아, 준, 호시, 원우, 우지, 디에잇, 민규, 도겸, 승관, 버논, 디노
- KOZ 엔터테인먼트 → 보이넥스트도어: 성호, 리우, 명재현, 태산, 이한, 운학
- 원헌드레드 → 더보이즈: 상연, 제이콥, 영훈, 현재, 주연, 케빈, 뉴, 큐, 주학년, 선우, 에릭
- SM 엔터테인먼트 → 에스파: 카리나, 지젤, 윈터, 닝닝
- SM 엔터테인먼트 → 라이즈: 쇼타로, 은석, 성찬, 원빈, 소희, 앤톤
- SM 엔터테인먼트 → 레드벨벳: 아이린, 슬기, 웬디, 조이, 예리
- JYP 엔터테인먼트 → 스트레이 키즈: 방찬, 리노, 창빈, 현진, 한, 필릭스, 승민, 아이엔
- JYP 엔터테인먼트 → 트와이스: 나연, 정연, 모모, 사나, 지효, 미나, 다현, 채영, 쯔위
- JYP 엔터테인먼트 → 있지: 예지, 리아, 류진, 채령, 유나
- JYP 엔터테인먼트 → 엔믹스: 해원, 릴리, 설윤, 배이, 지우, 규진
- YG 엔터테인먼트 → 블랙핑크: 지수, 제니, 로제, 리사
- YG 엔터테인먼트 → 베이비몬스터: 루카, 파리타, 아사, 아현, 라미, 로라, 치키타
- 스타쉽 엔터테인먼트 → 아이브: 안유진, 가을, 레이, 장원영, 리즈, 이서
- 큐브 엔터테인먼트 → 아이들: 미연, 민니, 소연, 우기, 슈화
- S2 엔터테인먼트 → 키스오브라이프: 쥴리, 나띠, 벨, 하늘

## 3. 채팅 안 읽음과 알림함

사용자 문제: 새 메시지가 왔는지 방마다 들어가 봐야 한다. 알림 설정은 토글만 있고 실제 알림이 없다.

### 3a 채팅 안 읽음 표시

- 스키마 `ChatRoomMember.lastReadAt DateTime?`.
- API(`chat.ts`): `POST /api/chat/rooms/:id/read`(멤버만, `lastReadAt = now`, 응답 `{ lastReadAt }`) · 채팅방 목록 두 엔드포인트의 항목에 `unreadCount: number`(내 `lastReadAt` 이후, 내가 보내지 않은 메시지 수; `lastReadAt`이 없으면 전체) · `GET /api/chat/unread-count` → `{ count }`(내 방 전체 합) · 채팅방 상세에 `lastReadAt: string | null`. 페이지당 방 수(20) 이상의 쿼리를 날리지 않는다.
- 채팅방(`chat-room.tsx`): 들어올 때, 맨 아래 상태에서 새 메시지가 올 때, 탭이 다시 보일 때 읽음 처리(1초 throttle). 처리 뒤 `chatRoomsQueryKey`와 안 읽음 수 쿼리 invalidate. 들어올 때의 `lastReadAt`을 `ChatMessageList`의 기존 prop으로 넘겨 "여기까지 읽음" 구분선이 그려지게 한다(세션 중 값이 바뀌지 않게 처음 값을 state에 보관).
- 목록 항목(`chat-list-item.tsx`): `unreadCount > 0`이면 강조색 뱃지(99 초과는 "99+")와 굵은 마지막 메시지.
- 하단 탭(`src/components/home/bottom-menu.tsx`): 채팅 탭에 안 읽음 수 뱃지. `src/lib/queries/chat.ts`의 `queryOptions`로 `refetchInterval: 30_000`, `refetchOnWindowFocus: true`, `retry: false`, 오류·비로그인은 0으로 취급.
- 테스트 `test/api/chat-unread.test.ts`: 상대 메시지만 센다, 읽음 처리 후 0, 비멤버 403, 합계. `test/ui/chat-unread-badge.test.tsx`: 뱃지 표기.

### 3b 알림 백엔드

- 스키마 `Notification`: `id`, `userId`, `type String`(`comment` | `like` | `chat` | `market` | `trade` | `review`), `title`, `body String?`, `href String?`, `actorId String?`, `readAt DateTime?`, `createdAt`; `@@index([userId, createdAt(sort: Desc)])`, `@@index([userId, readAt])`. `User.notificationSettings Json?`(키 `chat`, `like`, `comment`, `market`, `trade`, 모두 기본 true).
- 서비스 `src/lib/services/notification.ts`: `create`(설정이 꺼져 있거나 `userId === actorId`면 만들지 않음), `createForChatMessage(roomId, senderId, preview)`(같은 방의 안 읽은 채팅 알림이 있으면 새로 만들지 않고 body·createdAt 갱신), `list(userId, { cursor, limit })`, `unreadCount`, `markRead(userId, id)`, `markAllRead(userId)`, `getSettings`, `updateSettings`. 알림 생성 실패가 본 요청을 실패시키지 않게 try/catch 후 `console.error`.
- 생성 지점: 댓글 작성 → 글쓴이(`comment`, href 글), 답글 → 부모 댓글 작성자 · 좋아요 켜짐 → 글쓴이(`like`, 같은 글·같은 actor의 안 읽은 like 알림이 있으면 생략) · 상품 상태 변경 → 찜한 사용자 전원(`market`, "찜한 상품이 예약중/판매완료로 바뀌었어요") · 거래 완료 → 구매자(`trade`, href `/mypage/purchases`) · 후기 작성 → 상대(`review`, href `/users/<id>`) · 채팅 메시지 → 다른 멤버(`chat`, href `/chat/<roomId>`).
- 라우트 `src/lib/elysia/routes/notifications.ts`를 메인 앱에 등록: `GET /api/notifications?cursor&limit`, `GET /api/notifications/unread-count`, `PATCH /api/notifications/:id/read`, `POST /api/notifications/read-all`. `users.ts`에 `GET /api/users/me/notification-settings`, `PUT /api/users/me/notification-settings`.
- 테스트 `test/api/notifications.test.ts`: 생성 지점별 생성, 설정 off면 없음, 본인 행동은 없음, 채팅 중복 갱신, 페이지네이션, 읽음 처리, 설정 GET/PUT.

### 3c 알림 UI와 알림 설정

- `/notifications` 페이지(로그인 필요): 클라이언트 목록(`src/lib/queries/notifications.ts`의 `queryOptions`, `@suspensive/react` `<Suspense clientOnly>` + 에러 바운더리, 무한 스크롤은 채팅 목록 패턴). 항목: 타입 아이콘, 제목, 본문, 상대 시간(`formatRelativeTime`), 안 읽음 점. 누르면 읽음 처리(낙관적) 후 `href`로 이동. 헤더 "알림"과 "모두 읽음" 버튼. 빈 상태 문구.
- 종 아이콘 `src/components/notifications/notification-bell.tsx`: `/notifications` 링크 + 안 읽음 수 뱃지(`refetchInterval: 60_000`, 포커스 시 재조회, 오류·비로그인은 숨김). 홈 헤더 오른쪽과 마이페이지 `FixedPageHeader`의 `trailing`에 둔다. 마이페이지 메뉴 "계정 관리"에 "알림" 항목 추가.
- 알림 설정(`src/app/mypage/notifications/page.client.tsx`): localStorage 대신 서버 설정을 읽고 토글마다 저장(낙관적, 실패 시 되돌리고 토스트). 마케팅 섹션은 뒷받침하는 기능이 없으므로 뺀다. 항목: 채팅, 좋아요, 댓글, 관심 상품(찜한 상품 상태 변경), 거래(거래 완료·후기).
- 테스트 `test/ui/notifications-page.test.tsx`, `test/ui/notification-settings.test.tsx`.

## 4. 작은 마감

### 4a 판매자 공개 프로필

- `GET /api/users/:id`에 1c에서 추가한 필드 외에 `activeMarketCount`(판매중 수)가 없으면 추가.
- 페이지 `src/app/users/[userId]/page.tsx`: 없는 사용자·탈퇴 사용자는 404. 프로필(아바타, 닉네임, "YYYY년 M월 가입"), 수치 줄(거래 n회 · 평점 n.n(후기 n) · 판매중 n), 탭 "판매 상품"(`/markets/user/:userId`, `MarketGridItem` 재사용, 더보기)과 "후기"(`/users/:id/reviews`). 본인이면 "프로필 수정" 링크. `createMetadata` 적용.
- 링크 연결: 상품 상세 판매자 줄, 채팅방 헤더 상대 이름, 게시글 상세 작성자 → `/users/<id>`.
- 테스트 `test/api/user-profile.test.ts`.

### 4b 로그인 후 원래 화면 복귀

- `src/utils/url.ts`에 `sanitizeReturnPath(value)`: `/`로 시작하고 `//`·`://`·`\`가 없으면 그대로, 아니면 `/`. 단위 테스트 `test/utils`.
- 로그인 페이지가 `searchParams.redirect`를 읽어 `LoginForm`에 넘기고, 폼은 hidden `next`로 보낸다. `signInWithGoogle`이 `formData.get("next")`를 정리해 `redirectTo = <base>/auth/callback?next=<encoded>`를 만든다. 콜백(`src/app/auth/callback/route.ts`)도 `next`를 정리한다.
- 호출처 정리: 상품 상세 액션바(찜·채팅), 게시글 상세 좋아요·댓글 로그인 안내, 게시글 수정 페이지, `src/lib/supabase/middleware.ts`의 `/mypage`·`/chat` 보호 리다이렉트가 모두 `?redirect=<현재 경로>`를 붙인다.

### 4c 작은 수정 묶음

- 상품 상세 액션바: 하트 옆에 찜 수를 글자로 보여 준다.
- 목록 카드: `formatRelativeTime`으로 "3분 전" 표시.
- 하단 탭 라벨을 한국어로: 홈, 마켓, 채팅, 커뮤니티, 마이페이지.
- 채팅 실패 메시지에 "재시도" 버튼(기존 `sendMessage(content, clientId)` 사용). 삭제는 유지.
- `createMetadata`에 `image?: string | null` 옵션 → `openGraph.images`, `twitter.images`. 상품 상세와 게시글 상세가 첫 이미지를 넘긴다.
- 탈퇴 안내 문구를 실제 동작에 맞춘다. `userService`의 탈퇴 로직을 먼저 읽고 "계정 정보는 삭제되고 복구할 수 없다, 글·댓글·판매글·채팅 메시지는 남는다"는 사실을 그대로 적는다.
- 관련 UI 테스트 갱신.

## 운영 반영 (사람이 할 일)

1. `bun run db:migrate:prod` 로 새 마이그레이션 적용.
2. `supabase/enable-rls.sql` 다시 실행(새 테이블에 RLS를 켠다).
3. `prisma/seed-catalog.ts` 명단을 확인한 뒤 `bun run db:seed:catalog`.

## 결정 사항 (검토 요청)

- 거래 완료의 구매자는 그 상품 채팅방 멤버로 제한한다. 엉뚱한 사용자에게 구매 내역이 생기는 것을 막기 위해서다.
- 하단 탭 라벨을 영문 대문자에서 한국어로 바꾼다.
- 마케팅 알림 토글은 뒷받침하는 기능이 생길 때까지 뺀다.
- 시드 카탈로그 명단은 위 목록을 쓰되 운영 반영 전에 확인한다.
