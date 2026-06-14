export const colors = {
  background: "#F8FAF6",
  surface: "#FFFFFF",
  surfaceSoft: "#F0F8F2",
  surfaceMint: "#DDF8EA",
  surfaceWarm: "#FFF6E6",
  surfaceBlue: "#EEF6FF",
  primary: "#1F7A55",
  primaryDark: "#0F5238",
  primarySoft: "#BDEFD5",
  secondary: "#6D8F7A",
  amber: "#C48A2C",
  amberSoft: "#FDE8B5",
  danger: "#B94A48",
  dangerSoft: "#F9DEDC",
  text: "#14231B",
  textMuted: "#607168",
  textSubtle: "#8A9890",
  border: "#DCE8DF",
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

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const typography = {
  title: {
    fontSize: 30,
    lineHeight: 38,
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
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
} as const;
