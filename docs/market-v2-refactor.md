# Market Page V2 Refactor (Next.js 16 / React 19)

## 변경 폴더 구조
- `src/components/market/v2/`
  - `data/` — 검색 파라미터 정규화, 목록 조회 쿼리
- `actions/` — 서버 액션 (목록 교체/추가)
- `server/` — 서버 컴포넌트 래퍼 (페이지 콘텐츠, 초기 데이터 로딩)
- `client/` — 클라이언트 상호작용 컴포넌트 (필터, 그리드, 무한 로드 UI)

### 최근 변경 (페이로드 경량화)
- Server Action 기반 더보기 → 클라이언트 fetch + `useTransition`로 전환하여 body 1MB 초과 문제 제거.
- 검색은 Enter 시점(onSearch)만 요청, 입력 중 불필요한 네트워크 호출 제거.

## 파일 역할
- `data/search-params.ts` — URL searchParams를 안전하게 정규화.
- `data/get-market-list.ts` — Eden API 호출로 서버에서 목록 fetch.
- `actions/update-market-list.ts` — (구) useActionState용 서버 액션, append/replace 모드 처리. v2 클라이언트 fetch 전환 후 기본적으로 미사용.
- `server/market-page-content.tsx` — 헤더/푸터 포함 페이지 컨테이너, Suspense 경계 포함.
- `server/market-list-section.tsx` — 서버에서 초기 목록 fetch 후 클라이언트에 초기 상태 전달.
- `client/market-list-client.tsx` — 상태 관리 + 필터/정렬/더보기 상호작용 (클라이언트 fetch + useTransition).
- `client/filter-bar.tsx` + `filter-tabs.tsx` + `sort-select.tsx` — 검색/필터 UI.
- `client/market-grid.tsx` + `market-grid-item.tsx` — 상품 카드 리스트 렌더링.
- `client/empty-state.tsx` — 결과 없음/오류 상태 노출.
- `client/load-more-form.tsx` — 더보기 버튼.

## Suspense 경계
- `/market` 페이지에서 `MarketPageContent` 내 `Suspense`로 목록 영역만 감싸고 `ProductGridSkeleton`을 fallback으로 사용. 헤더/푸터는 즉시 렌더되어 초기 페인트가 빨라지고, 목록 데이터 지연 시에도 사용자 경험이 유지됩니다.

## 원본 문제 → 개선 포인트
| 원본 문제 | 개선 후 |
| --- | --- |
| 페이지 파일에서 파라미터 파싱/상태 로직이 뒤섞여 가독성 낮음 | `data/search-params.ts`, `server/market-page-content.tsx`로 책임 분리 |
| 서버/클라이언트 역할이 모호하고 폴더 구조가 평면적 | `v2` 하위 `data/actions/server/client`로 역할 기반 재조직 |
| 목록 UI가 단일 파일에 과도한 책임 (필터, 리스트, 버튼) | 파일당 1 컴포넌트로 쪼개어 재사용성과 테스트 용이성 확보 |
| 리스트 마크업이 div 기반으로 의미적 구조 부족 | `<ul>/<li>` 리스트 + aria 속성으로 a11y 개선 |
| 빈 상태/에러 시 스크린리더 안내 미흡 | `role="status"`, `aria-live` 적용, 버튼에 `aria-busy` 추가 |

## 사용법
- `/market`는 `normalizeMarketSearchParams` → `MarketPageContent` → `MarketListSection` 순서로 데이터 흐름이 진행됩니다.
- 추가 필터가 필요할 때 `MarketSearchFilters` 타입을 확장하고, `getMarketList`와 `updateMarketList`에 동일하게 전달하십시오.
