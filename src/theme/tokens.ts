export const colors = {
  background: "#F8FAF5",
  surface: "#FFFFFF",
  surfaceSoft: "#F1F7F1",
  surfaceMint: "#E0F8EC",
  surfaceWarm: "#FFF4DF",
  surfaceBlue: "#EFF7FF",
  primary: "#1D7B55",
  primaryDark: "#0F5238",
  primarySoft: "#B7EED0",
  secondary: "#6D8F7A",
  amber: "#C48A2C",
  amberSoft: "#FCE7B6",
  danger: "#B94A48",
  dangerSoft: "#F9DEDC",
  text: "#14231B",
  textMuted: "#607168",
  textSubtle: "#8A9890",
  border: "#E2ECE4",
  shadow: "#123526",
  white: "#FFFFFF",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const TAB_BAR_HEIGHT = 76;
export const TAB_BAR_BOTTOM_OFFSET = 12;
export const TAB_CONTENT_BOTTOM_INSET =
  TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_OFFSET + spacing.xxxl;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const typography = {
  title: {
    fontSize: 31,
    lineHeight: 39,
    fontWeight: "800",
  },
  heading: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "800",
  },
  subheading: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: "700",
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
} as const;

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.045,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  floating: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
} as const;
