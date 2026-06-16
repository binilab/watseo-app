import { StyleSheet } from "react-native";

export const colors = {
  // Surfaces
  background: "#FFFFFF",
  backgroundSoft: "#F8FAFD",
  surface: "#FFFFFF",
  surfaceSoft: "#F3F7FF",
  // Brand-soft accent (legacy keys kept, remapped to blue so no green leaks)
  surfaceMint: "#EAF1FF",
  surfaceBlue: "#EAF1FF",
  surfaceWarm: "#FFF4D6",
  surfaceDanger: "#FEECEC",
  // Brand blue
  primary: "#246BFE",
  primaryDark: "#143B8F",
  primarySoft: "#EAF1FF",
  // Status
  success: "#12A66A",
  successSoft: "#E7F8F0",
  warning: "#F59E0B",
  warningSoft: "#FFF4D6",
  danger: "#EF4444",
  dangerSoft: "#FEECEC",
  // Legacy accent keys (kept for compatibility)
  mint: "#E7F8F0",
  secondary: "#5B6B86",
  amber: "#B7791F",
  amberSoft: "#FFF4D6",
  // Text
  text: "#111827",
  textMuted: "#6B7280",
  textSubtle: "#9AA3B2",
  // Lines & misc
  border: "#E5EAF2",
  borderStrong: "#D5DEEC",
  shadow: "#1B2A4A",
  white: "#FFFFFF",
  // Brand-dark (splash / intro)
  ink: "#0F1B2D",
  textOnDark: "#F2F5FA",
  textOnDarkMuted: "#A6B4CA",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const TAB_BAR_HEIGHT = 72;
export const TAB_BAR_BOTTOM_OFFSET = 14;
export const TAB_CONTENT_BOTTOM_INSET =
  TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_OFFSET + spacing.xxl;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 999,
} as const;

export const typography = {
  display: {
    fontSize: 46,
    lineHeight: 52,
    fontWeight: "800",
  },
  title: {
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "800",
  },
  heading: {
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "800",
  },
  subheading: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "700",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  bodyStrong: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  micro: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
} as const;

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  floating: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
} as const;

export const layout = {
  screenPaddingX: spacing.xl,
  screenPaddingTop: spacing.lg,
  sectionGap: spacing.xl,
  cardGap: spacing.md,
  hairline: StyleSheet.hairlineWidth,
  controlHeight: 54,
  inputHeight: 52,
} as const;
