/**
 * Design tokens taken from Matchday.dc.html.
 *
 * Every value here appears in the design file; screens should pull from these
 * rather than repeating hex literals. Names follow the Tailwind-ish scale the
 * design uses so the mapping back to the source stays obvious.
 */

export const colors = {
  // Surfaces
  canvas: "#E8EEEB",
  page: "#F5FAF8",
  paper: "#FFFFFF",
  light: "#F8F8F8",

  // Text
  ink: "#1F2937",
  muted: "#6B7280",

  // Lines
  line: "#E5E7EB",
  lineSoft: "#F1F3F2",

  // Brand green
  green: "#198754",
  greenDeep: "#146C43",
  greenInk: "#08301F",
  mint: "#D1FAE5",
  mintSoft: "#EEF2F1",
  mintBright: "#34D399",

  // Status
  danger: "#DC2626",
  dangerDeep: "#B91C1C",
  dangerTint: "#FEE2E2",
  dangerLine: "#FCA5A5",
  warn: "#F59E0B",
  warnTint: "#FEF3C7",
  warnInk: "#92400E",
  warnDeep: "#B45309",

  // Premium accent
  gold: "#C9A227",
  goldSoft: "#F8F1DF",

  // Neutrals used by charts and disabled states
  grey: "#9CA3AF",
  greyLight: "#C7CDD4",
  greyDisabled: "#B6BCC4",
  greyField: "#F8F9F9",
} as const;

export const fonts = {
  sans: "Inter_400Regular",
  sansMed: "Inter_500Medium",
  sansSemi: "Inter_600SemiBold",
  sansBold: "Inter_700Bold",
  headline: "Oswald_600SemiBold",
  headlineMed: "Oswald_500Medium",
  headlineBold: "Oswald_700Bold",
} as const;

export const radius = {
  sm: 6,
  md: 11,
  lg: 14,
  xl: 20,
  pill: 99,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 26,
} as const;

/** Card elevation from the design: a single soft ink-tinted shadow. */
export const shadows = {
  card: {
    shadowColor: "#1F2937",
    shadowOpacity: 0.06,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  raised: {
    shadowColor: "#1F2937",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
} as const;

/** Header gradient stripes: 26px band, 26px gap, at 5.5% white. */
export const headerStripe = {
  width: 26,
  gap: 26,
  color: "rgba(255,255,255,0.055)",
} as const;
