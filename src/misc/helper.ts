import { FontLibrary } from "skia-canvas";
import path from "node:path";

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

export function toPNG(dataURL: string) {
  const base64Data = dataURL.replace(/^data:image\/png;base64,/, "");
  return Buffer.from(base64Data, "base64");
}

export function loadFonts() {
  const fontPath = path.resolve(import.meta.dir, "..", "..", "assets", "fonts");

  FontLibrary.use("slab", [
    path.join(fontPath, "RobotoSlab-Regular.ttf"),
    path.join(fontPath, "RobotoSlab-Bold.ttf"),
    path.join(fontPath, "RobotoSlab-SemiBold.ttf"),
    path.join(fontPath, "RobotoSlab-Medium.ttf"),
  ]);

  FontLibrary.use("space", [
    path.join(fontPath, "SpaceGrotesk-Regular.ttf"),
    path.join(fontPath, "SpaceGrotesk-Bold.ttf"),
    path.join(fontPath, "SpaceGrotesk-SemiBold.ttf"),
    path.join(fontPath, "SpaceGrotesk-Medium.ttf"),
  ]);

  FontLibrary.use("inter", [
    path.join(fontPath, "Inter-Regular.ttf"),
    path.join(fontPath, "Inter-Bold.ttf"),
    path.join(fontPath, "Inter-SemiBold.ttf"),
    path.join(fontPath, "Inter-Medium.ttf"),
  ]);
}
