export function formatNumberWithK(num: number) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

export const CARD_CONFIG = {
  dimensions: {
    cardWidth: 700,
    cardHeight: 750,
    modalWidth: 900,
    modalHeight: 520,
  },

  colors: {
    bgApp: "#080B0D", // Ultra dark canvas background
    bgCard: "#0D1114", // Core panel/card background
    bgCardElevated: "#0F1316", // Slightly lighter panel for depth
    bgBadge: "#151C21", // Dark container for badges/chips

    border: "#1F313A", // Grid boundaries & panel borders
    textMuted: "#5F7582", // Labels, subtitles, and metadata
    textWhite: "#FFFFFF", // Primary crisp readability

    accentPrimary: "#00D2FF", // Neon Cyan: Illuminations, graphs, links
    accentSecondary: "#FF3B47", // Neon Red: Critical warnings, high alerts, Rank #1
    accentTertiary: "#FFD200", // Neon Yellow: Currency, XP, points indicator
  },
} as const;
