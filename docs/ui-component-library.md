# UI 컴포넌트 라이브러리 구축 진행 상황

> 최종 업데이트: 2025-12-06

## 개요

공통 UI 컴포넌트와 훅을 정리하여 Storybook으로 관리하기 위한 작업 문서입니다.

---

## ✅ 완료된 작업

### Phase 1: 기본 컴포넌트 구현

#### Button (`src/components/ui/button/`)
- **변형**: `primary`, `secondary`, `ghost`, `danger`, `outline`
- **크기**: `sm`, `md`, `lg`
- **옵션**: `fullWidth`, `iconOnly`
- **접근성**: focus-visible, disabled 상태 지원

```tsx
import { Button } from "@/components/ui";

<Button variant="primary" size="md">저장</Button>
<Button variant="danger" size="sm">삭제</Button>
```

#### Input (`src/components/ui/input/`)
- **Props**: `label`, `error`, `helperText`, `leftIcon`, `rightIcon`
- **크기**: `sm`, `md`, `lg`
- **접근성**: aria-invalid, aria-describedby 지원

```tsx
import { Input } from "@/components/ui";

<Input
  label="이메일"
  error="올바른 이메일을 입력하세요"
  leftIcon={<Mail size={18} />}
/>
```

#### Badge (`src/components/ui/badge/`)
- **변형**: `default`, `primary`, `success`, `warning`, `error`, `info`
- **크기**: `sm`, `md`, `lg`
- **옵션**: `outline`, `dot`

```tsx
import { Badge } from "@/components/ui";

<Badge variant="success" dot>온라인</Badge>
<Badge variant="error" outline>품절</Badge>
```

### Phase 2: 기존 컴포넌트 마이그레이션

#### ConfirmModal (`src/components/ui/modal/`)
- 기존 `confirm-modal` → `ui/modal`로 이동
- 새로운 Button, Input 컴포넌트 사용하도록 리팩토링
- `openConfirm()`, `confirmAction()` 유틸 함수 포함
- 기존 경로에서 re-export로 하위 호환성 유지

```tsx
import { openConfirm, confirmAction } from "@/components/ui";

const confirmed = await confirmAction({
  title: "삭제 확인",
  description: "정말 삭제하시겠습니까?",
});
```

#### SearchBar (`src/components/ui/search-bar/`)
- controlled/uncontrolled 모드 지원
- 크기 옵션 추가 (`sm`, `md`, `lg`)
- 포커스 시각적 피드백 추가
- 기존 market SearchBar → 새 컴포넌트 래핑

```tsx
import { SearchBar } from "@/components/ui";

<SearchBar
  placeholder="검색어 입력"
  onChange={(value) => console.log(value)}
  onSearch={(value) => handleSearch(value)}
/>
```

### Phase 3: 훅 추가

#### useDebounce (`src/hooks/use-debounce.ts`)
```tsx
const debouncedValue = useDebounce(searchTerm, 300);
```

#### useDisclosure (`src/hooks/use-disclosure.ts`)
```tsx
const { isOpen, open, close, toggle } = useDisclosure({
  onOpen: () => console.log("opened"),
  onClose: () => console.log("closed"),
});
```

### Phase 4: 추가 컴포넌트

#### Avatar (`src/components/ui/avatar/`)
- **크기**: `sm`, `md`, `lg`, `xl`
- **형태**: `circle`, `rounded`
- **옵션**: `src`, `fallback`, `badge`

```tsx
import { Avatar } from "@/components/ui";

<Avatar src="/profile.jpg" size="md" />
<Avatar fallback="김철수" size="lg" />
<Avatar size="md" badge={<Badge variant="success" dot />} />
```

#### Accordion (`src/components/ui/accordion/`)
- **컴포넌트**: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`
- **크기**: `sm`, `md`, `lg`
- **옵션**: `defaultOpen`, `bordered`

```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui";

<Accordion>
  <AccordionItem>
    <AccordionTrigger>질문</AccordionTrigger>
    <AccordionContent>답변</AccordionContent>
  </AccordionItem>
</Accordion>
```

#### BottomSheet (`src/components/ui/bottom-sheet/`)
- **크기**: `sm`, `md`, `lg`, `full`
- **옵션**: `showHandle`, `showCloseButton`, `noPadding`, `footer`

```tsx
import { BottomSheet } from "@/components/ui";

<BottomSheet
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="메뉴"
  showCloseButton
>
  <p>내용</p>
</BottomSheet>
```

#### Skeleton (`src/components/ui/skeleton/`)
- **변형**: `text`, `circular`, `rectangular`, `rounded`
- **프리셋**: `SkeletonText`, `SkeletonAvatar`, `SkeletonCard`

```tsx
import { Skeleton, SkeletonAvatar, SkeletonText } from "@/components/ui";

<Skeleton variant="text" width={200} height={16} />
<SkeletonAvatar size="md" />
<SkeletonText lines={3} />
```

#### Toast (`sonner`)

### Phase 5: Storybook 설정

- [x] Storybook 설치 및 기본 설정
- [x] StyleX 빌드 연동 (webpack 설정)
- [x] 글로벌 스타일 데코레이터
- [x] 다크모드 지원 (`addon-themes`)
- [x] 접근성 검사 (`addon-a11y`)
- [x] Button.stories.tsx 작성
- [x] Input.stories.tsx 작성
- [x] Badge.stories.tsx 작성
- [x] Avatar.stories.tsx 작성
- [x] Accordion.stories.tsx 작성
- [x] BottomSheet.stories.tsx 작성
- [x] Skeleton.stories.tsx 작성
- [x] SearchBar.stories.tsx 작성
- [x] Modal.stories.tsx 작성

```bash
# Storybook 실행
bun run storybook
```

---

## 📁 현재 파일 구조

```
src/
├── components/
│   ├── ui/                          # ✅ 공통 UI 컴포넌트
│   │   ├── accordion/
│   │   │   ├── accordion.tsx
│   │   │   ├── accordion.stories.tsx
│   │   │   └── index.ts
│   │   ├── avatar/
│   │   │   ├── avatar.tsx
│   │   │   ├── avatar.stories.tsx
│   │   │   └── index.ts
│   │   ├── badge/
│   │   │   ├── badge.tsx
│   │   │   ├── badge.stories.tsx
│   │   │   └── index.ts
│   │   ├── bottom-sheet/
│   │   │   ├── bottom-sheet.tsx
│   │   │   ├── bottom-sheet.stories.tsx
│   │   │   └── index.ts
│   │   ├── button/
│   │   │   ├── button.tsx
│   │   │   ├── button.stories.tsx
│   │   │   └── index.ts
│   │   ├── input/
│   │   │   ├── input.tsx
│   │   │   ├── input.stories.tsx
│   │   │   └── index.ts
│   │   ├── modal/
│   │   │   ├── confirm-modal.tsx
│   │   │   ├── open-confirm.tsx
│   │   │   ├── modal.stories.tsx
│   │   │   └── index.ts
│   │   ├── search-bar/
│   │   │   ├── search-bar.tsx
│   │   │   ├── search-bar.stories.tsx
│   │   │   └── index.ts
│   │   ├── skeleton/
│   │   │   ├── skeleton.tsx
│   │   │   ├── skeleton.stories.tsx
│   │   │   └── index.ts
│   │   └── index.ts                 # Barrel export
│   │
│   ├── confirm-modal/               # 기존 위치 (re-export)
│   ├── chat/
│   ├── market/
│   └── ...
│
├── hooks/
│   ├── use-body-scroll-lock.ts
│   ├── use-debounce.ts
│   ├── use-disclosure.ts
│   ├── use-focus-management.ts
│   ├── use-media-query.ts
│   └── index.ts
│
└── .storybook/
    ├── main.ts                      # StyleX 웹팩 플러그인 설정
    └── preview.ts                   # 글로벌 스타일, 테마 설정
```

---

## 🔜 남은 작업

### Phase 6: 기존 코드 마이그레이션 (선택사항)

#### 영향받는 파일 (ConfirmModal 사용처)
- `src/components/chat/chat-room.tsx`
- `src/app/community/posts/[postId]/comments-client.tsx`
- `src/app/community/posts/[postId]/components.tsx`

> 현재는 re-export로 하위 호환성 유지 중. 추후 직접 import 경로 변경 가능.

---

## 📝 참고사항

### StyleX 주의사항
- shorthand 속성 사용 금지 (예: `border: '1px solid'` ❌)
- keyframes는 파일 내에서 로컬로 정의
- `stylex.props()` 내에서 조건부 스타일 사용 시 `Boolean()` 래핑 필요

```tsx
// ✅ 올바른 사용
{...stylex.props(
  styles.base,
  Boolean(error) && styles.error,
)}

// ❌ 잘못된 사용 (빈 문자열 반환 가능)
{...stylex.props(
  styles.base,
  error && styles.error,
)}
```

### 디자인 토큰
모든 컴포넌트는 `src/app/global-tokens.stylex.ts`의 토큰 사용:
- `colors`: bgPrimary, textPrimary, accentPrimary, statusError 등
- `spacing`: xxxs ~ xxxxl (fluid)
- `fontSize`: xs ~ xxl (fixed px)
- `radius`: xs ~ full
- `fontWeight`: normal ~ black

---

## 🔗 관련 문서

- [StyleX Skill](/.claude/skills/stylex/README.md)
- [Server Skill](/.claude/skills/server/README.md)
- [Utils Skill](/.claude/skills/utils/README.md)
