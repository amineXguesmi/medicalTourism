export const medTourColors = {
  brand: {
    50: '#E8F7F5',
    100: '#C9ECE8',
    200: '#95D9D0',
    300: '#5FC3B7',
    400: '#2FA99D',
    500: '#138C82',
    600: '#0D7069',
    700: '#0A5B56',
    800: '#083F3C',
    900: '#052B29',
  },
  action: {
    50: '#E9F8FF',
    100: '#C7EEFF',
    200: '#91DEFF',
    300: '#58C7F2',
    400: '#25AADB',
    500: '#0E8DBB',
    600: '#087096',
    700: '#075A78',
  },
  attention: {
    50: '#FFF1EC',
    100: '#FFD8CC',
    200: '#FFAB96',
    300: '#F77E65',
    400: '#E95B42',
    500: '#C93D28',
    600: '#9F2D1E',
  },
  warning: {
    50: '#FFF8E6',
    100: '#FFEAB2',
    200: '#FFD66B',
    300: '#F8BA2A',
    400: '#D99811',
    500: '#A97008',
  },
  success: {
    50: '#EAF8EE',
    100: '#C9EED3',
    200: '#8DDDA4',
    300: '#54C879',
    400: '#2AAE59',
    500: '#168A42',
  },
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAFA',
    100: '#EEF3F2',
    200: '#DCE5E4',
    300: '#B8C8C6',
    400: '#879A98',
    500: '#637573',
    600: '#465856',
    700: '#2E3D3B',
    800: '#1C2927',
    900: '#111A19',
  },
} as const;

export const medTourSemanticColors = {
  background: medTourColors.neutral[50],
  surface: medTourColors.neutral[0],
  surfaceMuted: medTourColors.neutral[100],
  textPrimary: medTourColors.neutral[900],
  textSecondary: medTourColors.neutral[600],
  textMuted: medTourColors.neutral[500],
  border: medTourColors.neutral[200],
  primary: medTourColors.brand[600],
  primaryStrong: medTourColors.brand[800],
  action: medTourColors.action[500],
  danger: medTourColors.attention[500],
  warning: medTourColors.warning[400],
  success: medTourColors.success[500],
  focusRing: medTourColors.action[300],
} as const;

export const medTourSpacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const medTourRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  pill: 999,
} as const;

export const medTourTypography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    '2xl': 28,
    '3xl': 34,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.45,
    relaxed: 1.6,
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const medTourMotion = {
  duration: {
    fast: 120,
    normal: 180,
    slow: 260,
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.2, 0, 0, 1.2)',
  },
} as const;

export const medTourTokens = {
  colors: medTourColors,
  semanticColors: medTourSemanticColors,
  spacing: medTourSpacing,
  radius: medTourRadius,
  typography: medTourTypography,
  motion: medTourMotion,
} as const;

export type MedTourTokens = typeof medTourTokens;

