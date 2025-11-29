# StyleX Development Skill

Provides StyleX CSS-in-JS patterns for React components. Use when creating or migrating components, handling animations, responsive design, or design tokens.

## Build Configuration

This project uses `@stylexswc/unplugin` (SWC-based) for StyleX compilation with Rsbuild:

```typescript
// rsbuild.config.ts
import stylexPlugin from "@stylexswc/unplugin/rspack";

export default defineConfig(({ env }) => ({
  html: {
    tags: [
      { tag: "link", attrs: { rel: "stylesheet", href: "stylex.css" }, head: true, append: false },
    ],
  },
  tools: {
    rspack: {
      plugins: [
        stylexPlugin({
          rsOptions: {
            dev: env === "development",
            treeshakeCompensation: true,
            aliases: { "@/*": [path.join(__dirname, "src/*")] },
          },
        }),
      ],
    },
  },
}));
```

## Quick Start

```typescript
import * as stylex from '@stylexjs/stylex';
import { colors } from '@/styles/tokens.stylex';

const styles = stylex.create({
  container: {
    backgroundColor: colors.cardBg,
    padding: 16,
  },
});

<div {...stylex.props(styles.container)} />
```

## Critical Rules

1. **No shorthand properties** - Use `borderWidth`, `borderStyle`, `borderColor` instead of `border`
2. **Keyframes are local** - `stylex.keyframes()` cannot be exported across files
3. **Tokens are shareable** - `stylex.defineVars()` can be imported from `tokens.stylex.ts`
4. **No inline styles for static values** - Use StyleX for all static styles, inline only for dynamic runtime values
5. **Always use spread syntax** - `{...stylex.props(styles.x)}` not `style={styles.x}`

## Reference Files

- [PATTERNS.md](./PATTERNS.md) - Common styling patterns and examples
- [CONSTRAINTS.md](./CONSTRAINTS.md) - StyleX limitations and workarounds
- [MIGRATION.md](./MIGRATION.md) - CSS module to StyleX migration guide

## File Conventions

| Type | Location | Naming |
|------|----------|--------|
| Components | `src/components/` | kebab-case (`clock-app.tsx`) |
| Tokens | `src/styles/` | `tokens.stylex.ts` |

## Commands

```bash
bun run dev      # Development server
bun run build    # Production build (validates StyleX)
bun run preview  # Preview production build
```

## External Docs

- [StyleX](https://stylexjs.com/docs/learn/)
- [Rsbuild](https://rsbuild.rs/llms.txt)
