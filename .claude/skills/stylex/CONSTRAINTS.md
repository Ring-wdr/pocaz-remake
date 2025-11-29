# StyleX Constraints

Limitations and required workarounds for StyleX.

## Table of Contents

- [No Shorthand Properties](#no-shorthand-properties)
- [Keyframes Scope](#keyframes-scope)
- [String vs Number Values](#string-vs-number-values)
- [Spread Syntax Required](#spread-syntax-required)
- [No Static Inline Styles](#no-static-inline-styles)
- [Flex Layout Constraints](#flex-layout-constraints)

## No Shorthand Properties

StyleX does not support CSS shorthand. Always use longhand properties.

### Border

```typescript
// WRONG
border: '1px solid #2a2a4e'

// CORRECT
borderWidth: 1,
borderStyle: 'solid',
borderColor: '#2a2a4e',

// Border radius (single value OK)
borderRadius: 8,

// Different radii
borderTopLeftRadius: 8,
borderTopRightRadius: 8,
borderBottomLeftRadius: 0,
borderBottomRightRadius: 0,
```

### Background

```typescript
// WRONG
background: '#1a1a2e'
background: 'linear-gradient(to right, #1a1a2e, #2a2a4e)'

// CORRECT
backgroundColor: '#1a1a2e',

// For gradients
backgroundImage: 'linear-gradient(to right, #1a1a2e, #2a2a4e)',
```

### Margin and Padding

```typescript
// Single value (OK)
margin: 16,
padding: 16,

// WRONG - multiple values
margin: '10px 20px'
padding: '10px 20px 30px 40px'

// CORRECT - explicit properties
marginTop: 10,
marginBottom: 10,
marginLeft: 20,
marginRight: 20,

// Or use marginBlock/marginInline
marginBlock: 10,   // top + bottom
marginInline: 20,  // left + right
```

### Outline

```typescript
// WRONG
outline: '2px solid #6366f1'

// CORRECT
outlineWidth: 2,
outlineStyle: 'solid',
outlineColor: '#6366f1',
outlineOffset: 2,
```

### Flex

```typescript
// WRONG
flex: '1 1 auto'

// CORRECT
flexGrow: 1,
flexShrink: 1,
flexBasis: 'auto',
```

## Keyframes Scope

`stylex.keyframes()` cannot be exported or imported. Must be defined in the same file where used.

```typescript
// tokens.stylex.ts - CANNOT export keyframes
export const fadeIn = stylex.keyframes({...}); // WRONG

// component.tsx - Define locally
const fadeIn = stylex.keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

const styles = stylex.create({
  animated: {
    animationName: fadeIn,
    animationDuration: '0.3s',
  },
});
```

### What CAN Be Shared

```typescript
// tokens.stylex.ts - defineVars works across files
export const colors = stylex.defineVars({
  primary: '#6366f1',
  background: '#0a0a0a',
});

// component.tsx
import { colors } from '@/styles/tokens.stylex';

const styles = stylex.create({
  box: {
    backgroundColor: colors.background,
  },
});
```

## String vs Number Values

```typescript
// Numbers (no unit = pixels)
padding: 16,        // 16px
fontSize: 14,       // 14px
lineHeight: 1.5,    // unitless ratio

// Strings (with units or keywords)
width: '100%',
maxWidth: '800px',
fontWeight: 'bold',
display: 'flex',
```

## Spread Syntax Required

Always use spread syntax with `stylex.props()`. Never assign StyleX styles directly to `style` prop.

```typescript
// WRONG - styles won't apply correctly
<div style={styles.container} />
<CardContent style={styles.content} />

// CORRECT - use spread syntax
<div {...stylex.props(styles.container)} />
<CardContent {...stylex.props(styles.content)} />
```

## No Static Inline Styles

Static values must be in StyleX, not inline styles. Only use inline for dynamic runtime values.

```typescript
// WRONG - static value in inline style
<div style={{ marginTop: 8, color: '#333' }} />

// CORRECT - static values in StyleX
const styles = stylex.create({
  box: { marginTop: 8, color: '#333' },
});
<div {...stylex.props(styles.box)} />

// OK - dynamic runtime value in inline
<div {...stylex.props(styles.box)} style={{ width: `${width}px` }} />
```

## Flex Layout Constraints

### flex: 1 + maxHeight 충돌

`flex: 1`과 `maxHeight`를 동시에 사용하면 `flex: 1`이 무시됨.

```typescript
// 문제 상황
content: {
  flex: 1,           // 무시됨
  maxHeight: 400,    // 이게 우선
},
```

**해결책:** 내부 요소에 maxHeight를 적용하고 wrapper에 flex: 1 적용

```typescript
// Wrapper
contentWrapper: {
  flex: 1,
},

// Inner scrollable area
scrollArea: {
  maxHeight: 400,
  overflowY: 'auto',
},
```

### Grid + Card Equal Height 제약

CSS Grid에서 동일 높이 카드 + 여백 없음은 **불가능**.

```typescript
// Grid 기본값: align-items: stretch
// → 카드들이 같은 높이가 됨
// → 콘텐츠 양이 다르면 여백 필연적

// 선택 1: 높이 다름 허용 (여백 없음)
grid: {
  alignItems: "start",
},

// 선택 2: 높이 동일 (여백은 Content 내부에)
card: { height: "100%" },
content: { flex: 1 },
footer: { marginTop: "auto" },
```

자세한 패턴은 [PATTERNS.md#grid-layout-with-cards](./PATTERNS.md#grid-layout-with-cards) 참조.
