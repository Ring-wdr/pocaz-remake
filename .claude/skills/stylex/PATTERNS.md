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
const styles = stylex.create({
  container: {
    marginTop: spacing.sm,
    color: colors.foreground,
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
| Design token | `color: colors.muted` | StyleX |
| CSS variable | `color: "var(--muted)"` | StyleX with token |
| State variable | `width: \`${width}px\`` | Inline |
| Props | `transform: \`rotate(${angle}deg)\`` | Inline |
| User input | `backgroundColor: userColor` | Inline |

## Using Design Tokens

```typescript
import { colors, spacing } from '@/styles/tokens.stylex';

const styles = stylex.create({
  card: {
    backgroundColor: colors.cardBg,
    borderColor: colors.cardBorder,
    padding: spacing.md,
  },
});
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
