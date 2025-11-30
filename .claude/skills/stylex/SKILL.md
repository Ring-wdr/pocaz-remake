---
name: stylex
description: StyleX CSS-in-JS 스타일링 스킬. React 컴포넌트 생성, 스타일 마이그레이션, 반응형 디자인, 애니메이션 구현 시 사용. shorthand 제약, keyframes 스코프 등 StyleX 규칙 준수. (project)
---

# StyleX Development Skill

Pocaz 프로젝트의 StyleX CSS-in-JS 스타일링 스킬입니다.

## When to Use

- React 컴포넌트 스타일링
- CSS Module → StyleX 마이그레이션
- 반응형 디자인 구현
- 애니메이션/트랜지션 추가
- 디자인 토큰 활용

## Build Configuration

Next.js 16 + Turbopack + `@stylexswc/nextjs-plugin`:

```typescript
// next.config.ts
import path from "node:path";
import stylexPlugin from "@stylexswc/nextjs-plugin/turbopack";

export default stylexPlugin({
  rsOptions: {
    aliases: {
      "@/*": [path.join(__dirname, "src", "*")],
    },
    runtimeInjection: false,
    treeshakeCompensation: true,
  },
  stylexImports: ["stylex", "@stylexjs/stylex"],
})({
  reactCompiler: true,
  transpilePackages: ["@stylexjs/open-props"],
});
```

## Quick Start

```typescript
import * as stylex from "@stylexjs/stylex";
import { spacing, text, globalTokens } from "@/app/global-tokens.stylex";

const styles = stylex.create({
  container: {
    padding: spacing.md,
    fontSize: text.p,
    fontFamily: globalTokens.fontSans,
  },
});

export function Component() {
  return <div {...stylex.props(styles.container)} />;
}
```

## Critical Rules

1. **No shorthand properties** - `border: '1px solid red'` 사용 불가
   ```typescript
   // WRONG
   border: '1px solid #ccc'

   // CORRECT
   borderWidth: 1,
   borderStyle: 'solid',
   borderColor: '#ccc',
   ```

2. **Keyframes are local** - 파일 간 export 불가, 사용 파일에서 정의
   ```typescript
   const fadeIn = stylex.keyframes({
     '0%': { opacity: 0 },
     '100%': { opacity: 1 },
   });
   ```

3. **Always use spread syntax**
   ```typescript
   // WRONG
   <div style={styles.box} />

   // CORRECT
   <div {...stylex.props(styles.box)} />
   ```

4. **Static values in StyleX, dynamic in inline**
   ```typescript
   // Static → StyleX
   const styles = stylex.create({
     box: { marginTop: 8 },
   });

   // Dynamic → inline
   <div {...stylex.props(styles.box)} style={{ width: `${w}px` }} />
   ```

## Project Tokens

토큰 파일: `src/app/global-tokens.stylex.ts`

```typescript
import { spacing, text, globalTokens, scales } from "@/app/global-tokens.stylex";

// Fluid Typography (clamp 기반)
text.xxs, text.xs, text.sm, text.p, text.h5, text.h4, text.h3, text.h2, text.h1

// Fluid Spacing (clamp 기반)
spacing.xxxs, spacing.xxs, spacing.xs, spacing.sm, spacing.md,
spacing.lg, spacing.xl, spacing.xxl, spacing.xxxl, spacing.xxxxl

// Global Tokens
globalTokens.fontSans, globalTokens.fontMono, globalTokens.maxWidth
globalTokens.bgStartRGB, globalTokens.primaryGlow, globalTokens.secondaryGlow

// Scales
scales.small, scales.medium, scales.large
```

## Reference Files

- [PATTERNS.md](./PATTERNS.md) - 스타일 패턴 및 예시
- [CONSTRAINTS.md](./CONSTRAINTS.md) - StyleX 제약사항 및 우회 방법
- [MIGRATION.md](./MIGRATION.md) - CSS Module 마이그레이션 가이드

## File Conventions

| Type | Location | Example |
|------|----------|---------|
| Components | `src/components/` | `auth-status.tsx` |
| Pages | `src/app/` | `page.tsx` |
| Tokens | `src/app/` | `global-tokens.stylex.ts` |

## Commands

```bash
bun run dev      # 개발 서버 (Turbopack)
bun run build    # 프로덕션 빌드
bun run start    # 프로덕션 서버
```

## External Docs

- [StyleX Documentation](https://stylexjs.com/docs/learn/)
- [StyleX API Reference](https://stylexjs.com/docs/api/)
