# StyleX Patterns

Common styling patterns for this project.

## Table of Contents

- [Basic Styles](#basic-styles)
- [Conditional Styles](#conditional-styles)
- [Pseudo-classes](#pseudo-classes)
- [Media Queries](#media-queries)
- [Animations](#animations)
- [Static vs Dynamic Styles](#static-vs-dynamic-styles)
- [Using Design Tokens](#using-design-tokens)
- [Grid Layout with Cards](#grid-layout-with-cards)
- [Sticky Bottom Button](#sticky-bottom-button)

## Basic Styles

```typescript
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: 16,
    gap: 8,
  },
});

<div {...stylex.props(styles.container)} />
```

## Conditional Styles

```typescript
const styles = stylex.create({
  base: { padding: 16 },
  active: { backgroundColor: '#2a2a4e' },
  primary: { color: '#6366f1' },
});

<div {...stylex.props(
  styles.base,
  isActive && styles.active,
  variant === 'primary' && styles.primary
)} />
```

## Pseudo-classes

```typescript
const styles = stylex.create({
  button: {
    backgroundColor: '#1a1a2e',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#2a2a4e',
    },
    ':active': {
      transform: 'scale(0.98)',
    },
    ':focus': {
      outline: '2px solid #6366f1',
      outlineOffset: 2,
    },
  },
});
```

## Media Queries

```typescript
const styles = stylex.create({
  container: {
    padding: 32,
    fontSize: 16,
    '@media (max-width: 768px)': {
      padding: 16,
      fontSize: 14,
    },
    '@media (max-width: 480px)': {
      padding: 8,
      fontSize: 12,
    },
  },
});
```

## Animations

Keyframes must be defined in the same file:

```typescript
const fadeIn = stylex.keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

const spin = stylex.keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

const styles = stylex.create({
  fadeIn: {
    animationName: fadeIn,
    animationDuration: '0.3s',
    animationTimingFunction: 'ease-out',
  },
  spinner: {
    animationName: spin,
    animationDuration: '1s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
});
```

## Static vs Dynamic Styles

### Static Styles (Always use StyleX)

All static values must be defined in StyleX, not inline styles:

```typescript
// WRONG - static values in inline style
<div style={{ marginTop: 8, color: '#333' }} />

// CORRECT - static values in StyleX
import { spacing, globalTokens } from '@/app/global-tokens.stylex';

const styles = stylex.create({
  container: {
    marginTop: spacing.sm,
    fontFamily: globalTokens.fontSans,
  },
});
<div {...stylex.props(styles.container)} />
```

### Dynamic Styles (Use inline)

Only use inline styles for truly runtime-computed values:

```typescript
const styles = stylex.create({
  box: {
    backgroundColor: '#1a1a2e',
    transition: 'all 0.2s ease',
  },
});

// Dynamic width/height from state/props
<div
  {...stylex.props(styles.box)}
  style={{
    width: `${dynamicWidth}px`,
    height: `${dynamicHeight}px`,
  }}
/>

// Dynamic transform from user interaction
<div
  {...stylex.props(styles.box)}
  style={{
    transform: `rotate(${angle}deg) scale(${scale})`,
  }}
/>
```

### Decision Guide

| Value Source | Example | Use |
|--------------|---------|-----|
| Hardcoded number | `marginTop: 8` | StyleX |
| Design token | `padding: spacing.md` | StyleX |
| CSS variable | `color: "var(--muted)"` | StyleX with token |
| State variable | `width: \`${width}px\`` | Inline |
| Props | `transform: \`rotate(${angle}deg)\`` | Inline |
| User input | `backgroundColor: userColor` | Inline |

## Using Design Tokens

```typescript
import {
  spacing, text, colors, globalTokens,
  fontSize, fontWeight, lineHeight, radius, iconSize, size
} from '@/app/global-tokens.stylex';

const styles = stylex.create({
  card: {
    padding: spacing.md,
    fontSize: fontSize.md,        // 고정 14px
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
    borderRadius: radius.sm,
    backgroundColor: colors.bgPrimary,
    color: colors.textPrimary,
  },
  avatar: {
    width: size.avatarMd,         // 48px
    height: size.avatarMd,
    borderRadius: radius.full,
  },
  icon: {
    width: iconSize.md,           // 18px
    height: iconSize.md,
  },
  button: {
    height: size.touchTarget,     // 40px
    paddingInline: spacing.md,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});

// Available tokens:
// text: xxs~h1 (fluid 반응형)
// spacing: xxxs~xxxxl (fluid 반응형)
// colors: bgPrimary, textPrimary, borderPrimary, accentPrimary 등 (다크모드 지원)
// fontSize: xs (10px) ~ xxl (30px) (고정)
// fontWeight: normal (400) ~ black (900)
// lineHeight: tight (1) ~ loose (2)
// radius: xs (4px) ~ full (50%)
// iconSize: xs (14px) ~ xl (28px)
// size: touchTarget, avatarSm/Md/Lg, thumbnail, bottomMenuHeight 등
```

## Grid Layout with Cards

### Problem: Unwanted Whitespace in Equal-Height Cards

CSS Grid의 기본값 `align-items: stretch`로 인해 같은 row의 카드들이 동일한 높이를 가짐.
콘텐츠 양이 다른 카드에서 불필요한 여백이 발생할 수 있음.

**여백 발생 위치:**
- Footer 아래: Card가 grid cell을 채우지 않을 때
- Content와 Footer 사이: `marginTop: auto` 사용 시

### Solution A: 카드 높이 다르게 허용 (권장)

```typescript
const styles = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: spacing.xl,
    alignItems: "start",  // 각 카드가 자신의 콘텐츠에 맞는 높이
  },
});
```

**결과:** 카드 높이 다름, 여백 없음

### Solution B: 동일 높이 + 여백을 Content 내부로

```typescript
// Card component
const styles = stylex.create({
  card: {
    display: "flex",
    flexDirection: "column",
    height: "100%",       // Grid cell 채움
  },
  content: {
    flex: 1,              // 남은 공간 채움
  },
  footer: {
    marginTop: "auto",    // 하단 고정
  },
});
```

**결과:** 카드 높이 동일, 여백이 Content 영역 내부에 위치

### Trade-off Matrix

| 방식 | 카드 높이 | 여백 위치 | 적합한 상황 |
|-----|---------|---------|-----------|
| A (`alignItems: start`) | 다름 | 없음 | 콘텐츠 양 차이가 클 때 |
| B (`flex: 1` + `marginTop: auto`) | 동일 | Content 내부 | 시각적 정렬이 중요할 때 |

### 주의사항

1. **maxHeight와 flex: 1 충돌**: Content에 `maxHeight`가 있으면 `flex: 1`이 무시됨
2. **height: 100% 필수**: Solution B에서 Card가 grid cell을 채우려면 필요
3. **콘텐츠 양이 다르면 여백은 필연적**: 동일 높이 + 여백 없음은 불가능

## Sticky Bottom Button

폼 페이지에서 제출 버튼을 화면 하단에 고정하는 패턴.

### 레이아웃 구조 이해 (필수)

```
mobileWrap (Layout 컴포넌트)
├── Header (공통 앱 헤더)
├── mainContent (flex: 1) ← 페이지가 여기에 렌더링
│   └── YourPage
│       ├── page header
│       ├── content (스크롤 영역)
│       └── bottomButtonContainer ← sticky 버튼
└── BottomMenu (sticky, bottom: 0, height: 56px)
```

### 핵심 규칙

**`bottom` 값은 반드시 `size.bottomMenuHeight`를 사용해야 함.**

BottomMenu가 `position: sticky`, `bottom: 0`으로 항상 하단에 고정되어 있으므로,
하단 버튼의 `bottom` 값을 `0`으로 하면 BottomMenu에 가려짐.

### 구현

```typescript
import { colors, size } from "@/app/global-tokens.stylex";

const styles = stylex.create({
  // 페이지 컨테이너
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: colors.bgPrimary,
  },
  // 스크롤 가능한 콘텐츠 영역
  content: {
    flex: 1,
    paddingTop: "20px",
    paddingBottom: "24px",
    paddingLeft: "14px",
    paddingRight: "14px",
  },
  // 하단 고정 버튼 컨테이너
  bottomButtonContainer: {
    position: "sticky",
    bottom: size.bottomMenuHeight,  // 56px - BottomMenu 위에 위치
    left: 0,
    right: 0,
    paddingTop: "12px",
    paddingBottom: "12px",
    paddingLeft: "14px",
    paddingRight: "14px",
    backgroundColor: colors.bgPrimary,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: colors.borderPrimary,
    zIndex: 10,
  },
  // 버튼 스타일
  bottomButton: {
    width: "100%",
    paddingTop: "16px",
    paddingBottom: "16px",
    fontSize: "16px",
    fontWeight: 600,
    color: colors.textInverse,
    backgroundColor: colors.bgInverse,
    borderWidth: 0,
    borderRadius: "12px",
    cursor: "pointer",
    transition: "opacity 0.2s ease",
  },
  bottomButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
});
```

### JSX 구조

```tsx
export default function FormPage() {
  return (
    <div {...stylex.props(styles.container)}>
      {/* 페이지 헤더 (선택) */}
      <header {...stylex.props(styles.header)}>
        <h1>페이지 제목</h1>
      </header>

      {/* 스크롤 가능한 폼 콘텐츠 */}
      <div {...stylex.props(styles.content)}>
        {/* 폼 필드들 */}
      </div>

      {/* 하단 고정 버튼 - content와 같은 레벨에 배치 */}
      <div {...stylex.props(styles.bottomButtonContainer)}>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isDisabled}
          {...stylex.props(
            styles.bottomButton,
            isDisabled && styles.bottomButtonDisabled,
          )}
        >
          {isPending ? <Loader2 size={20} /> : "등록하기"}
        </button>
      </div>
    </div>
  );
}
```

### 주의사항

1. **`bottom: size.bottomMenuHeight` 필수**: `0`이나 다른 값 사용 시 BottomMenu에 가려짐
2. **`zIndex: 10`**: 스크롤 콘텐츠 위에 표시되도록 설정
3. **`backgroundColor` 필수**: 투명하면 스크롤 시 콘텐츠가 비침
4. **`container`에 `minHeight: 100vh` 사용 금지**: 레이아웃 구조에서 이미 처리됨

### 적용 예시

- `/market/register` - 상품 등록
- `/community/write` - 글 작성
- `/mypage/edit` - 프로필 수정
- 기타 폼 제출이 필요한 페이지
