---
name: skeleton-layout-stability
description: >
  Guidance for designing and reviewing skeleton loaders so their layout matches
  the final UI (width/height), preventing layout shift/CLS. Use for questions
  about skeleton UIs, placeholders, or aligning skeleton and real text in
  React/Next.js frontends.
---

# Skeleton Layout Stability

Use this skill when designing or reviewing skeleton loaders so that swapping
from “skeleton” to “real UI” does not shift layout, including when web fonts or
variable-length text are involved. Keep answers concise and actionable.

## Quick workflow

1. Identify the text blocks that must stay stable.  
2. Normalize typography (font size, line height, font metrics).  
3. Derive skeleton sizes from the same tokens.  
4. Use percentage widths to absorb text-length variance.  
5. Handle web font loading so line boxes stay fixed.  
6. Validate visually and via CLS/perf tools.

## Core principles

1. Match the typographic box, not pixels from screenshots. Skeleton height must
   come from `font-size × line-height`.  
2. Control line-height explicitly. Prefer numeric values (e.g. `1.4`, `1.5`) on
   both text and skeleton.  
3. Share typography tokens. Derive skeleton CSS from the same tokens (e.g.
   `--font-size-body`, `--line-height-body`, `--line-gap-body`).  
4. Use percentage widths for lines. Favor `95%`, `90%`, `70%` to cover typical
   lengths without shifting when real text differs slightly.  
5. Keep line counts consistent. If real content spans 2–3 lines, skeleton
   should too; extra whitespace is better than shift.

## Typography normalization

1. Normalize text styles (StyleX with explicit metrics):

   ```tsx
   import * as stylex from "@stylexjs/stylex";
   import { fontSize, lineHeight, fontWeight } from "@/app/global-tokens.stylex";

   const textStyles = stylex.create({
   	body: {
   		fontSize: fontSize.md, // or a project token for the block
   		lineHeight: lineHeight.normal,
   		letterSpacing: 0,
   		fontWeight: fontWeight.normal,
   	},
   });
   ```

2. Keep numeric `line-height` on both real text and skeleton style entries to
   reduce font variance.

## Skeleton design patterns

### Single text block (one or two lines)

Goal: skeleton height = `font-size × line-height`.

```tsx
import * as stylex from "@stylexjs/stylex";
import { colors, fontSize, lineHeight, radius } from "@/app/global-tokens.stylex";

const styles = stylex.create({
	textBody: {
		fontSize: fontSize.md,
		lineHeight: lineHeight.normal,
	},
	skeletonLine: {
		height: `calc(${fontSize.md} * ${lineHeight.normal})`,
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.sm,
	},
});
```

Usage (React/JSX):

```tsx
function TextOrSkeleton({
	isLoading,
	children,
}: {
	isLoading: boolean;
	children: React.ReactNode;
}) {
	if (isLoading) {
		return <div aria-hidden="true" {...stylex.props(styles.skeletonLine)} />;
	}
	return <p {...stylex.props(styles.textBody)}>{children}</p>;
}
```

### Multi-line text block (title + body)

Keep consistent line height and use percentage widths:

```tsx
function TextSkeleton({ lines = 3 }: { lines?: number }) {
	return (
		<div aria-hidden="true" {...stylex.props(styles.skeletonGroup)}>
			{Array.from({ length: lines }).map((_, index) => (
				<div
					key={index}
					{...stylex.props(
						styles.skeletonLine,
						index === lines - 1 && styles.skeletonLineShort,
					)}
				/>
			))}
		</div>
	);
}
```

```tsx
import * as stylex from "@stylexjs/stylex";
import { colors, fontSize, lineHeight, spacing, radius } from "@/app/global-tokens.stylex";

const styles = stylex.create({
	textBody: {
		fontSize: fontSize.md,
		lineHeight: lineHeight.normal,
	},
	skeletonGroup: {
		display: "flex",
		flexDirection: "column",
		gap: spacing.xxs,
	},
	skeletonLine: {
		height: `calc(${fontSize.md} * ${lineHeight.normal})`,
		backgroundColor: colors.bgSecondary,
		borderRadius: radius.xs,
		marginBottom: spacing.xxs,
		width: "95%",
	},
	skeletonLineShort: {
		width: "70%",
	},
});
```

## References

- Use alongside [SKILL.md](./SKILL.md) for general StyleX rules and tokens.
- Pair with [PATTERNS.md](./PATTERNS.md) when writing skeleton components in TSX.
- Check [CONSTRAINTS.md](./CONSTRAINTS.md) if you need exceptions or shorthands.

## Validation checklist

- [ ] Skeleton height matches `font-size × line-height` of the target text (no implicit `normal` line-height).
- [ ] Skeleton widths use percentages (e.g., 95/90/70%) that reflect expected text length variance.
- [ ] Line count in the skeleton is greater than or equal to the maximum expected text lines.
- [ ] Typography tokens (font size, line height, spacing) are shared between skeleton and real text.
- [ ] Web font loading handled (metric overrides or numeric line-height) to avoid CLS when fonts swap.
- [ ] Skeleton and content are in the same layout wrapper so swapping does not change container size.
