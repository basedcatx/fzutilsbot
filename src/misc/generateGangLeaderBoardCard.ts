import { CARD_CONFIG, loadFonts } from "./helper";
import "konva/skia-backend";
loadFonts();

import Konva from "konva";
const { accentPrimary, accentSecondary, accentTertiary } = CARD_CONFIG.colors;

const CONFIG = {
  width: CARD_CONFIG.dimensions.modalWidth,
  height: 1450, // Just this once
};

// Initialize Stage and Main Layer
export async function generateGangLeaderBoardCard({
  gangs,
}: {
  gangs: {
    name: string;
    msgs: number;
    avatarUrl: string | null;
    rank: number;
  }[];
}) {
  const stage = new Konva.Stage({
    width: CONFIG.width,
    height: CONFIG.height,
  });

  const mainLayer = new Konva.Layer();
  stage.add(mainLayer);

  // 1. Base Dark Card Frame
  mainLayer.add(
    new Konva.Rect({
      width: CONFIG.width,
      height: CONFIG.height,
      fill: CARD_CONFIG.colors.bgApp,
    }),
  );

  // Top-Left Neon Bracket
  mainLayer.add(
    new Konva.Path({
      x: 25,
      y: 25,
      data: "M 0 20 L 0 0 L 20 0",
      stroke: CARD_CONFIG.colors.accentPrimary,
      strokeWidth: 2,
    }),
  );

  // Bottom-Right Neon Bracket
  mainLayer.add(
    new Konva.Path({
      x: CONFIG.width - 25,
      y: CONFIG.height - 25,
      data: "M 0 -20 L 0 0 L -20 0",
      stroke: accentPrimary,
      strokeWidth: 2,
    }),
  );

  const headerGroup = new Konva.Group({ x: 60, y: 70 });

  // Trophy Glow Effect Base
  const trophy = new Konva.Text({
    text: "🏆",
    fontSize: 28,
    shadowColor: accentTertiary,
    shadowBlur: 15,
    shadowOpacity: 1,
  });

  const titleText = new Konva.Text({
    text: "GANG WEEKLY LEADERBOARD",
    x: 55,
    y: 2,
    fontSize: 26,
    fontStyle: "italic bold",
    fill: CARD_CONFIG.colors.textWhite,
    fontFamily: "space",
  });

  // Countdown Clock Widget (Anchored right side)
  const timerGroup = new Konva.Group({ x: CONFIG.width - 245 });
  timerGroup.add(
    new Konva.Text({
      text: "Resets in a week",
      y: 10,
      fontSize: 16,
      fontStyle: "bold",
      fill: accentPrimary,
    }),
  );

  headerGroup.add(trophy, titleText, timerGroup);
  mainLayer.add(headerGroup);

  const listGroup = new Konva.Group({ x: 75, y: 175 });

  async function createLeaderboardRow(
    yPos: number,
    g: {
      name: string;
      msgs: number;
      avatarUrl?: string;
      rank: number;
    },
  ) {
    const row = new Konva.Group({ x: 0, y: yPos });
    const rowWidth = CONFIG.width - 130;
    const rowHeight = 100;
    const accentColor = g.rank === 1 ? accentTertiary : accentPrimary;

    // Base Plate Background
    row.add(
      new Konva.Rect({
        width: rowWidth,
        height: rowHeight,
        fill: g.rank === 1 ? accentTertiary : CARD_CONFIG.colors.bgBadge,
        stroke:
          g.rank === 1 ? "rgba(255, 210, 0, 0.15)" : "rgba(0, 210, 255, 0.03)",
        strokeWidth: 1,
        cornerRadius: 2,
      }),
    );

    // Left-side Identity Status Line
    row.add(
      new Konva.Rect({
        width: 5,
        height: rowHeight,
        fill: accentColor,
      }),
    );

    // Rank String Text
    row.add(
      new Konva.Text({
        text: g.rank.toLocaleString(),
        x: 30,
        y: 36,
        fontSize: 24,
        fontStyle: "italic bold",
        fontFamily: "slab",
        fill: g.rank === 1 ? accentTertiary : accentPrimary,
      }),
    );

    row.add(
      new Konva.Text({
        text: g.name.toUpperCase(),
        x: 185,
        y: 40,
        fontSize: 20,
        fontStyle: "italic bold",
        fill: CARD_CONFIG.colors.textWhite,
        fontFamily: "space",
      }),
    );

    // Avatar Border Wrapper Box

    if (g.avatarUrl) {
      await new Promise<void>((resolve) => {
        Konva.Image.fromURL(
          g.avatarUrl!,
          function (img) {
            const radius = 66;
            const imageGroup = new Konva.Group({
              y: 50,
              x: CARD_CONFIG.dimensions.modalWidth - radius * 2 - 50,
              clipFunc: (c) => {
                c.arc(radius, radius, radius, Math.PI * 2, 0, false);
              },
            });
            img.width(radius * 2);
            img.height(radius * 2);
            imageGroup.add(img);
            row.add(imageGroup);
            resolve();
          },
          () => {
            resolve();
          },
        );
      });
    }

    row.add(
      new Konva.Rect({
        x: 90,
        y: 15,
        width: 70,
        height: 70,
        fill: "#13191E",
        stroke: g.rank === 1 ? accentTertiary : "#1D272F",
        strokeWidth: 1,
        cornerRadius: 2,
      }),
    );

    // Quantitative Metric Value (Right-Aligned)
    row.add(
      new Konva.Text({
        text: g.msgs.toLocaleString(),
        x: rowWidth - 180,
        y: 38,
        width: 150,
        align: "right",
        fontSize: 24,
        fontStyle: "bold",
        fill: accentColor,
        fontFamily: "Arial, Helvetica, sans-serif",
      }),
    );

    return row;
  }

  for (let i = 0; i < Math.min(gangs.length, 10); i++) {
    const it = gangs[i];
    const rowItem = await createLeaderboardRow(i * 118, {
      msgs: it?.msgs!,
      name: it?.name!,
      avatarUrl: it?.avatarUrl ?? undefined,
      rank: it?.rank!,
    });
    listGroup.add(rowItem);
  }
  mainLayer.add(listGroup);

  const footerGroup = new Konva.Group({ x: 60, y: CONFIG.height - 50 });
  footerGroup.add(
    new Konva.Text({
      text: "SERVER_LOAD",
      fontSize: 20,
      y: -20,
      fontStyle: "bold",
      fill: CARD_CONFIG.colors.textMuted,
      tracking: 0.5,
    }),
  );

  const totalServerMessages = gangs.reduce((curr, prev) => {
    return curr + prev.msgs;
  }, 0);

  function calculateFill() {
    if (totalServerMessages >= 9000) return 1;
    if (totalServerMessages >= 10_000) return 2;
    if (totalServerMessages >= 20_000) return 3;
    return 0;
  }

  function createLightGrids() {
    for (let i = 0; i < 4; i++) {
      footerGroup.add(
        new Konva.Rect({
          x: 25 * i,
          y: 10,
          width: 20,
          height: 14,
          fill:
            i <= calculateFill()
              ? CARD_CONFIG.colors.accentPrimary
              : CARD_CONFIG.colors.bgBadge,
        }),
      );
    }
  }

  createLightGrids();
  mainLayer.add(footerGroup);
  mainLayer.draw();

  return stage.toDataURL({
    pixelRatio: 6,
    imageSmoothingEnabled: true,
    quality: 20,
  });
}
