/**
 * Design tokens — "the menu card" direction (see change-1 design D5).
 * The ground is broth-tinted, not neutral: saturation lives in the background,
 * ink is roasted brown, feedback colors are food-true (basil correct, chili wrong).
 * No component may hardcode a color: everything routes through these tokens.
 */

import type { TextStyle } from 'react-native'

export const colors = {
  /** Broth-straw paper: the page itself is golden like stock. */
  bg: '#F7ECD2',
  /** Card surface, one step lighter than the ground. */
  surface: '#FCF7EA',
  /** Roasted brown ink, softer than black. */
  ink: '#2B1B10',
  /** Secondary text and labels. */
  inkSoft: '#6F5B44',
  /** Hairline borders, menu-print style. */
  line: '#DECFA4',
  /** Primary action: deep tomato. */
  tomato: '#C6371E',
  tomatoDeep: '#A22A14',
  /** Correct: basil. */
  basil: '#2E7D4F',
  basilDeep: '#256B43',
  /** Wrong: chili. */
  chili: '#8C2312',
  /** Broth gold, sparingly (progress, highlights). */
  gold: '#D99A1B',
  /** Text on filled action buttons. */
  onTomato: '#FFF6E8',
  onBasil: '#F2F9F1',
  onChili: '#FBEDE7',
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  huge: 48,
} as const

export const radius = { sm: 8, md: 14, pill: 999 } as const

/** Fraunces speaks for the menu (soup names, scores); the system font speaks for the UI. */
export const font = {
  display: 'Fraunces_900Black',
  displaySoft: 'Fraunces_600SemiBold',
  body: undefined,
} as const

export const type = {
  display: {
    fontFamily: font.display,
    fontSize: 40,
    lineHeight: 44,
    color: colors.ink,
  },
  menuTitle: {
    fontFamily: font.display,
    fontSize: 30,
    lineHeight: 34,
    color: colors.ink,
  },
  title: { fontSize: 22, fontWeight: '600', color: colors.ink, lineHeight: 28 },
  body: { fontSize: 16, lineHeight: 23, color: colors.ink },
  bodySoft: { fontSize: 16, lineHeight: 23, color: colors.inkSoft },
  caption: { fontSize: 13, lineHeight: 18, color: colors.inkSoft },
} satisfies Record<string, TextStyle>
