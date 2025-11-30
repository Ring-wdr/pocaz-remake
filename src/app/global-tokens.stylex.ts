import * as stylex from '@stylexjs/stylex';

/**
 * o--o o    o   o o-O-o o-o       o--o  o-o  o   o o-O-o  o-o
 * |    |    |   |   |   |  \      |    o   o |\  |   |   |
 * O-o  |    |   |   |   |   O     O-o  |   | | \ |   |    o-o
 * |    |    |   |   |   |  /      |    o   o |  \|   |       |
 * o    O---o o-o  o-O-o o-o       o     o-o  o   o   o   o--o
 *
 * Reference: https://utopia.fyi/type/calculator
 *
 * The following constants are used to calculate fluid typography.
 * Feel free to change these initial numbers to suit your needs.
 *
 * StyleX can compute all of this at compile time as all the information
 * is statically available in the same file and the only functions used are
 * the Math.pow and Math.round functions.
 *
 * NOTE: Any custom functions will not be able to be computed at compile time.
 */
const MIN_WIDTH = 320;
const MAX_WIDTH = 1240;
const MIN_SCALE = 1.2;
const MAX_SCALE = 1.333;
const MIN_BASE_SIZE = 16;
const MAX_BASE_SIZE = 20;

// Font sizes in `rem` units
const MIN_FONT = {
  xxs: Math.round(MIN_BASE_SIZE / Math.pow(MIN_SCALE, 3) / 0.16) / 100,
  xs: Math.round(MIN_BASE_SIZE / Math.pow(MIN_SCALE, 2) / 0.16) / 100,
  sm: Math.round(MIN_BASE_SIZE / MIN_SCALE / 0.16) / 100,
  p: Math.round(MIN_BASE_SIZE / 4) / 4,
  h5: Math.round((MIN_BASE_SIZE * MIN_SCALE) / 0.16) / 100,
  h4: Math.round((MIN_BASE_SIZE * Math.pow(MIN_SCALE, 2)) / 0.16) / 100,
  h3: Math.round((MIN_BASE_SIZE * Math.pow(MIN_SCALE, 3)) / 0.16) / 100,
  h2: Math.round((MIN_BASE_SIZE * Math.pow(MIN_SCALE, 4)) / 0.16) / 100,
  h1: Math.round((MIN_BASE_SIZE * Math.pow(MIN_SCALE, 5)) / 0.16) / 100,
};
// Font sizes in `rem` units
const MAX_FONT = {
  xxs: Math.round(MAX_BASE_SIZE / Math.pow(MAX_SCALE, 3) / 0.16) / 100,
  xs: Math.round(MAX_BASE_SIZE / Math.pow(MAX_SCALE, 2) / 0.16) / 100,
  sm: Math.round(MAX_BASE_SIZE / MAX_SCALE / 0.16) / 100,
  p: Math.round(MAX_BASE_SIZE / 4) / 4,
  h5: Math.round((MAX_BASE_SIZE * MAX_SCALE) / 0.16) / 100,
  h4: Math.round((MAX_BASE_SIZE * Math.pow(MAX_SCALE, 2)) / 0.16) / 100,
  h3: Math.round((MAX_BASE_SIZE * Math.pow(MAX_SCALE, 3)) / 0.16) / 100,
  h2: Math.round((MAX_BASE_SIZE * Math.pow(MAX_SCALE, 4)) / 0.16) / 100,
  h1: Math.round((MAX_BASE_SIZE * Math.pow(MAX_SCALE, 5)) / 0.16) / 100,
};
const SLOPE = {
  xxs: (16 * (MAX_FONT.xxs - MIN_FONT.xxs)) / (MAX_WIDTH - MIN_WIDTH),
  xs: (16 * (MAX_FONT.xs - MIN_FONT.xs)) / (MAX_WIDTH - MIN_WIDTH),
  sm: (16 * (MAX_FONT.sm - MIN_FONT.sm)) / (MAX_WIDTH - MIN_WIDTH),
  p: (16 * (MAX_FONT.p - MIN_FONT.p)) / (MAX_WIDTH - MIN_WIDTH),
  h5: (16 * (MAX_FONT.h5 - MIN_FONT.h5)) / (MAX_WIDTH - MIN_WIDTH),
  h4: (16 * (MAX_FONT.h4 - MIN_FONT.h4)) / (MAX_WIDTH - MIN_WIDTH),
  h3: (16 * (MAX_FONT.h3 - MIN_FONT.h3)) / (MAX_WIDTH - MIN_WIDTH),
  h2: (16 * (MAX_FONT.h2 - MIN_FONT.h2)) / (MAX_WIDTH - MIN_WIDTH),
  h1: (16 * (MAX_FONT.h1 - MIN_FONT.h1)) / (MAX_WIDTH - MIN_WIDTH),
};
const INTERCEPT = {
  xxs: Math.round(100 * (MIN_FONT.xxs - SLOPE.xxs * (MIN_WIDTH / 16))) / 100,
  xs: Math.round(100 * (MIN_FONT.xs - SLOPE.xs * (MIN_WIDTH / 16))) / 100,
  sm: Math.round(100 * (MIN_FONT.sm - SLOPE.sm * (MIN_WIDTH / 16))) / 100,
  p: Math.round(100 * (MIN_FONT.p - SLOPE.p * (MIN_WIDTH / 16))) / 100,
  h5: Math.round(100 * (MIN_FONT.h5 - SLOPE.h5 * (MIN_WIDTH / 16))) / 100,
  h4: Math.round(100 * (MIN_FONT.h4 - SLOPE.h4 * (MIN_WIDTH / 16))) / 100,
  h3: Math.round(100 * (MIN_FONT.h3 - SLOPE.h3 * (MIN_WIDTH / 16))) / 100,
  h2: Math.round(100 * (MIN_FONT.h2 - SLOPE.h2 * (MIN_WIDTH / 16))) / 100,
  h1: Math.round(100 * (MIN_FONT.h1 - SLOPE.h1 * (MIN_WIDTH / 16))) / 100,
};

// prettier-ignore
export const text = stylex.defineVars({
  xxs: `clamp(${ Math.min(MIN_FONT.xxs) }rem, calc(${ INTERCEPT.xxs }rem + ${ Math.round(10000 * SLOPE.xxs) / 100 }vw), ${ Math.max(MAX_FONT.xxs) }rem)`,
  xs:  `clamp(${ Math.min(MIN_FONT.xs ) }rem, calc(${ INTERCEPT.xs  }rem + ${ Math.round(10000 * SLOPE.xs ) / 100 }vw), ${ Math.max(MAX_FONT.xs ) }rem)`,
  sm:  `clamp(${ Math.min(MIN_FONT.sm ) }rem, calc(${ INTERCEPT.sm  }rem + ${ Math.round(10000 * SLOPE.sm ) / 100 }vw), ${ Math.max(MAX_FONT.sm ) }rem)`,
  p:   `clamp(${ Math.min(MIN_FONT.p  ) }rem, calc(${ INTERCEPT.p   }rem + ${ Math.round(10000 * SLOPE.p  ) / 100 }vw), ${ Math.max(MAX_FONT.p  ) }rem)`,
  h5:  `clamp(${ Math.min(MIN_FONT.h5 ) }rem, calc(${ INTERCEPT.h5  }rem + ${ Math.round(10000 * SLOPE.h5 ) / 100 }vw), ${ Math.max(MAX_FONT.h5 ) }rem)`,
  h4:  `clamp(${ Math.min(MIN_FONT.h4 ) }rem, calc(${ INTERCEPT.h4  }rem + ${ Math.round(10000 * SLOPE.h4 ) / 100 }vw), ${ Math.max(MAX_FONT.h4 ) }rem)`,
  h3:  `clamp(${ Math.min(MIN_FONT.h3 ) }rem, calc(${ INTERCEPT.h3  }rem + ${ Math.round(10000 * SLOPE.h3 ) / 100 }vw), ${ Math.max(MAX_FONT.h3 ) }rem)`,
  h2:  `clamp(${ Math.min(MIN_FONT.h2 ) }rem, calc(${ INTERCEPT.h2  }rem + ${ Math.round(10000 * SLOPE.h2 ) / 100 }vw), ${ Math.max(MAX_FONT.h2 ) }rem)`,
  h1:  `clamp(${ Math.min(MIN_FONT.h1 ) }rem, calc(${ INTERCEPT.h1  }rem + ${ Math.round(10000 * SLOPE.h1 ) / 100 }vw), ${ Math.max(MAX_FONT.h1 ) }rem)`,
});

/**
 * o--o o    o   o o-O-o o-o        o-o  o--o    O    o-o o--o
 * |    |    |   |   |   |  \      |     |   |  / \  /    |
 * O-o  |    |   |   |   |   O      o-o  O--o  o---oO     O-o
 * |    |    |   |   |   |  /          | |     |   | \    |
 * o    O---o o-o  o-O-o o-o       o--o  o     o   o  o-o o--o
 *
 * Reference: https://utopia.fyi/space/calculator
 *
 * Similar to the fluid typography, we can create fluid values for spacing.
 * Using similar formulas and similar scales.
 *
 * NOTE: It is common to have more varied needs for spacing than for font-size.
 * So feel free to add some more values by following the pattern below.
 *
 * EXCEPT: We are using `px` instead of `rem`
 * ------------------------------------------
 * When talking about font-size, it is the best practice to use
 * `rem` so that an end user can change the font-size using the
 * browser's font-size setting.
 *
 * However, when talking about spacing, it is the best practice to
 * use `px` because using `rems` here makes font-size behave like zoom.
 *
 * Users that prefer larger text, don't necessarily want larger spacing as well.
 *
 */

const MULT = {
  xxxs: 0.25,
  xxs: 0.5,
  xs: 0.75,
  sm: 1,
  md: 1.5,
  lg: 2,
  xl: 3,
  xxl: 4,
  xxxl: 6,
  xxxxl: 8,
};
const MIN_SPACE = {
  xxxs: MULT.xxxs * MIN_BASE_SIZE,
  xxs: MULT.xxs * MIN_BASE_SIZE,
  xs: MULT.xs * MIN_BASE_SIZE,
  sm: MULT.sm * MIN_BASE_SIZE,
  md: MULT.md * MIN_BASE_SIZE,
  lg: MULT.lg * MIN_BASE_SIZE,
  xl: MULT.xl * MIN_BASE_SIZE,
  xxl: MULT.xxl * MIN_BASE_SIZE,
  xxxl: MULT.xxxl * MIN_BASE_SIZE,
  xxxxl: MULT.xxxxl * MIN_BASE_SIZE,
};
const MAX_SPACE = {
  xxxs: MULT.xxxs * MAX_BASE_SIZE,
  xxs: MULT.xxs * MAX_BASE_SIZE,
  xs: MULT.xs * MAX_BASE_SIZE,
  sm: MULT.sm * MAX_BASE_SIZE,
  md: MULT.md * MAX_BASE_SIZE,
  lg: MULT.lg * MAX_BASE_SIZE,
  xl: MULT.xl * MAX_BASE_SIZE,
  xxl: MULT.xxl * MAX_BASE_SIZE,
  xxxl: MULT.xxxl * MAX_BASE_SIZE,
  xxxxl: MULT.xxxxl * MAX_BASE_SIZE,
};
const SLOPE_SPACE = {
  xxxs: (MAX_SPACE.xxxs - MIN_SPACE.xxxs) / (MAX_WIDTH - MIN_WIDTH),
  xxs: (MAX_SPACE.xxs - MIN_SPACE.xxs) / (MAX_WIDTH - MIN_WIDTH),
  xs: (MAX_SPACE.xs - MIN_SPACE.xs) / (MAX_WIDTH - MIN_WIDTH),
  sm: (MAX_SPACE.sm - MIN_SPACE.sm) / (MAX_WIDTH - MIN_WIDTH),
  md: (MAX_SPACE.md - MIN_SPACE.md) / (MAX_WIDTH - MIN_WIDTH),
  lg: (MAX_SPACE.lg - MIN_SPACE.lg) / (MAX_WIDTH - MIN_WIDTH),
  xl: (MAX_SPACE.xl - MIN_SPACE.xl) / (MAX_WIDTH - MIN_WIDTH),
  xxl: (MAX_SPACE.xxl - MIN_SPACE.xxl) / (MAX_WIDTH - MIN_WIDTH),
  xxxl: (MAX_SPACE.xxxl - MIN_SPACE.xxxl) / (MAX_WIDTH - MIN_WIDTH),
  xxxxl: (MAX_SPACE.xxxxl - MIN_SPACE.xxxxl) / (MAX_WIDTH - MIN_WIDTH),
};
// rounded to the nearest 0.25px
const INTERCEPT_SPACE = {
  xxxs: Math.round(4 * (MIN_SPACE.xxxs - SLOPE_SPACE.xxxs * MIN_WIDTH)) / 4,
  xxs: Math.round(4 * (MIN_SPACE.xxs - SLOPE_SPACE.xxs * MIN_WIDTH)) / 4,
  xs: Math.round(4 * (MIN_SPACE.xs - SLOPE_SPACE.xs * MIN_WIDTH)) / 4,
  sm: Math.round(4 * (MIN_SPACE.sm - SLOPE_SPACE.sm * MIN_WIDTH)) / 4,
  md: Math.round(4 * (MIN_SPACE.md - SLOPE_SPACE.md * MIN_WIDTH)) / 4,
  lg: Math.round(4 * (MIN_SPACE.lg - SLOPE_SPACE.lg * MIN_WIDTH)) / 4,
  xl: Math.round(4 * (MIN_SPACE.xl - SLOPE_SPACE.xl * MIN_WIDTH)) / 4,
  xxl: Math.round(4 * (MIN_SPACE.xxl - SLOPE_SPACE.xxl * MIN_WIDTH)) / 4,
  xxxl: Math.round(4 * (MIN_SPACE.xxxl - SLOPE_SPACE.xxxl * MIN_WIDTH)) / 4,
  xxxxl: Math.round(4 * (MIN_SPACE.xxxxl - SLOPE_SPACE.xxxxl * MIN_WIDTH)) / 4,
};

// prettier-ignore
export const spacing = stylex.defineVars({
  xxxs:  `clamp(${MIN_SPACE.xxxs  }px, calc(${INTERCEPT_SPACE.xxxs  }px + ${ Math.round(10000 * SLOPE_SPACE.xxxs  ) / 100 }vw), ${MAX_SPACE.xxxs  }px)`,
  xxs:   `clamp(${MIN_SPACE.xxs   }px, calc(${INTERCEPT_SPACE.xxs   }px + ${ Math.round(10000 * SLOPE_SPACE.xxs   ) / 100 }vw), ${MAX_SPACE.xxs   }px)`,
  xs:    `clamp(${MIN_SPACE.xs    }px, calc(${INTERCEPT_SPACE.xs    }px + ${ Math.round(10000 * SLOPE_SPACE.xs    ) / 100 }vw), ${MAX_SPACE.xs    }px)`,
  sm:    `clamp(${MIN_SPACE.sm    }px, calc(${INTERCEPT_SPACE.sm    }px + ${ Math.round(10000 * SLOPE_SPACE.sm    ) / 100 }vw), ${MAX_SPACE.sm    }px)`,
  md:    `clamp(${MIN_SPACE.md    }px, calc(${INTERCEPT_SPACE.md    }px + ${ Math.round(10000 * SLOPE_SPACE.md    ) / 100 }vw), ${MAX_SPACE.md    }px)`,
  lg:    `clamp(${MIN_SPACE.lg    }px, calc(${INTERCEPT_SPACE.lg    }px + ${ Math.round(10000 * SLOPE_SPACE.lg    ) / 100 }vw), ${MAX_SPACE.lg    }px)`,
  xl:    `clamp(${MIN_SPACE.xl    }px, calc(${INTERCEPT_SPACE.xl    }px + ${ Math.round(10000 * SLOPE_SPACE.xl    ) / 100 }vw), ${MAX_SPACE.xl    }px)`,
  xxl:   `clamp(${MIN_SPACE.xxl   }px, calc(${INTERCEPT_SPACE.xxl   }px + ${ Math.round(10000 * SLOPE_SPACE.xxl   ) / 100 }vw), ${MAX_SPACE.xxl   }px)`,
  xxxl:  `clamp(${MIN_SPACE.xxxl  }px, calc(${INTERCEPT_SPACE.xxxl  }px + ${ Math.round(10000 * SLOPE_SPACE.xxxl  ) / 100 }vw), ${MAX_SPACE.xxxl  }px)`,
  xxxxl: `clamp(${MIN_SPACE.xxxxl }px, calc(${INTERCEPT_SPACE.xxxxl }px + ${ Math.round(10000 * SLOPE_SPACE.xxxxl ) / 100 }vw), ${MAX_SPACE.xxxxl }px)`,
});

/**
 * Color Tokens
 * Dark mode ready design tokens
 */
const DARK_MODE = '@media (prefers-color-scheme: dark)';

/**
 * Semantic Color Tokens
 * These tokens are designed to support both light and dark themes.
 */
export const colors = stylex.defineVars({
  // Background colors
  bgPrimary: { default: '#ffffff', [DARK_MODE]: '#0a0a0a' },
  bgSecondary: { default: '#f9fafb', [DARK_MODE]: '#171717' },
  bgTertiary: { default: '#f3f4f6', [DARK_MODE]: '#262626' },
  bgInverse: { default: '#000000', [DARK_MODE]: '#ffffff' },

  // Text colors
  textPrimary: { default: '#000000', [DARK_MODE]: '#ffffff' },
  textSecondary: { default: '#111827', [DARK_MODE]: '#f3f4f6' },
  textTertiary: { default: '#374151', [DARK_MODE]: '#d1d5db' },
  textMuted: { default: '#6b7280', [DARK_MODE]: '#9ca3af' },
  textPlaceholder: { default: '#9ca3af', [DARK_MODE]: '#6b7280' },
  textInverse: { default: '#ffffff', [DARK_MODE]: '#000000' },

  // Border colors
  borderPrimary: { default: '#e5e7eb', [DARK_MODE]: '#374151' },
  borderSecondary: { default: '#f3f4f6', [DARK_MODE]: '#262626' },

  // Interactive colors
  accentPrimary: { default: '#2563eb', [DARK_MODE]: '#3b82f6' },
  accentPrimaryBg: { default: '#dbeafe', [DARK_MODE]: '#1e3a5f' },

  // Status colors - Error/Danger
  statusError: { default: '#dc2626', [DARK_MODE]: '#ef4444' },
  statusErrorLight: { default: '#ef4444', [DARK_MODE]: '#f87171' },
  statusErrorBg: { default: '#fee2e2', [DARK_MODE]: '#450a0a' },
  statusErrorBgLight: { default: '#fef2f2', [DARK_MODE]: '#7f1d1d' },

  // Status colors - Success
  statusSuccess: { default: '#059669', [DARK_MODE]: '#10b981' },
  statusSuccessLight: { default: '#22c55e', [DARK_MODE]: '#34d399' },
  statusSuccessBg: { default: '#d1fae5', [DARK_MODE]: '#064e3b' },

  // Status colors - Warning
  statusWarning: { default: '#d97706', [DARK_MODE]: '#f59e0b' },
  statusWarningBg: { default: '#fef3c7', [DARK_MODE]: '#78350f' },

  // Status colors - Info
  statusInfo: { default: '#2563eb', [DARK_MODE]: '#3b82f6' },
  statusInfoBg: { default: '#dbeafe', [DARK_MODE]: '#1e3a5f' },

  // Special colors
  purple: { default: '#7c3aed', [DARK_MODE]: '#8b5cf6' },

  // Skeleton loading
  skeletonBase: { default: '#f0f0f0', [DARK_MODE]: '#262626' },
  skeletonHighlight: { default: '#e0e0e0', [DARK_MODE]: '#404040' },

  // Footer colors
  footerText: { default: '#71717a', [DARK_MODE]: '#a1a1aa' },
  footerTextMuted: { default: '#52525b', [DARK_MODE]: '#71717a' },

  // Brand colors
  brandPrimary: { default: '#034ac5', [DARK_MODE]: '#3b82f6' },

  // Shadow colors (for rgba values)
  shadowLight: { default: 'rgba(0, 0, 0, 0.1)', [DARK_MODE]: 'rgba(255, 255, 255, 0.05)' },
});

export const globalTokens = stylex.defineVars({
  fontSans: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    '"Noto Sans"',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
    '"Noto Color Emoji"',
  ].join(', '),
});


/**
 * Fixed Size Tokens
 * These tokens provide consistent sizing across the application.
 * Use these for precise pixel-based designs.
 */
export const fontSize = stylex.defineVars({
  // Extra small text (badges, labels)
  xs: '10px',
  // Small text (captions, hints)
  sm: '12px',
  // Medium small text (secondary content)
  md: '14px',
  // Base text (body, inputs)
  base: '16px',
  // Large text (emphasized content)
  lg: '18px',
  // Section titles
  xl: '24px',
  // Logo, hero text
  xxl: '30px',
});

export const fontWeight = stylex.defineVars({
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
});

export const lineHeight = stylex.defineVars({
  tight: '1',
  snug: '1.25',
  normal: '1.5',
  relaxed: '1.6',
  loose: '2',
});

export const radius = stylex.defineVars({
  // Small radius (badges, chips)
  xs: '4px',
  // Medium radius (buttons, inputs)
  sm: '8px',
  // Large radius (cards, modals)
  md: '12px',
  // Extra large radius (pills)
  lg: '20px',
  // Full circle
  full: '50%',
});

export const iconSize = stylex.defineVars({
  xs: '14px',
  sm: '16px',
  md: '18px',
  lg: '24px',
  xl: '28px',
});

export const size = stylex.defineVars({
  // Touch targets, buttons
  touchTarget: '40px',
  // Icon buttons
  iconButton: '24px',
  // Avatar small
  avatarSm: '32px',
  // Avatar medium
  avatarMd: '48px',
  // Avatar large
  avatarLg: '64px',
  // Thumbnail
  thumbnail: '100px',
  // Bottom menu height
  bottomMenuHeight: '56px',
});
