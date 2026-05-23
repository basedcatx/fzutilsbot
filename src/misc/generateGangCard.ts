import Konva from "konva";
import "konva/skia-backend";
import { CARD_CONFIG } from "./helper";

export async function generateGangCard({
  name,
  gangs,
  msgs,
  ranking,
  nextInLine,
}: {
  name: string;
  msgs: number[];
  ranking: number[]; // [current, former]
  gangs: { msgs: number; name: string }[];
  nextInLine: { name: string; leader: string };
}) {
  const stage = new Konva.Stage({
    width: CARD_CONFIG.dimensions.modalWidth,
    height: CARD_CONFIG.dimensions.modalHeight,
  });

  const mainLayer = new Konva.Layer();
  stage.add(mainLayer);

  const baseFrame = new Konva.Rect({
    width: CARD_CONFIG.dimensions.modalWidth,
    height: CARD_CONFIG.dimensions.modalHeight,
    fill: CARD_CONFIG.colors.bgApp,
  });

  mainLayer.add(baseFrame);

  const headerGroup = new Konva.Group({ x: 0, y: 0 });

  headerGroup.add(
    new Konva.Rect({
      width: 900,
      height: 110,
      fill: CARD_CONFIG.colors.bgCard,
      stroke: CARD_CONFIG.colors.bgBadge,
      strokeWidth: 1,
    }),
  );

  headerGroup.add(
    new Konva.Text({
      text: "GANG",
      x: 45,
      y: 30,
      fontSize: 11,
      fontStyle: "bold",
      fill: CARD_CONFIG.colors.textMuted,
      tracking: 2,
    }),
  );

  // Main Identity Tag
  headerGroup.add(
    new Konva.Text({
      text: name.toUpperCase(),
      x: 45,
      y: 48,
      fontSize: 36,
      fontStyle: "italic bold",
      fill: CARD_CONFIG.colors.textWhite,
    }),
  );

  mainLayer.add(headerGroup);

  const commGroup = new Konva.Group({ x: 0, y: 110 });

  commGroup.add(
    new Konva.Rect({
      width: 450,
      height: 140,
      fill: CARD_CONFIG.colors.bgCardElevated,
      stroke: CARD_CONFIG.colors.bgBadge,
      strokeWidth: 1,
    }),
  );

  commGroup.add(
    new Konva.Text({
      text: "MSG_VOLUME",
      x: 45,
      y: 28,
      fontSize: 10,
      fontStyle: "bold",
      fill: CARD_CONFIG.colors.textWhite,
      tracking: 1.5,
    }),
  );

  const msgText = new Konva.Text({
    text: (msgs[0] ?? 0).toLocaleString(),
    x: 45,
    y: 52,
    fontSize: 32,
    fontStyle: "bold",
    fill: CARD_CONFIG.colors.textWhite,
  });

  commGroup.add(msgText);

  commGroup.add(
    new Konva.Text({
      text: "MSG",
      x: 50 + msgText.getTextWidth(),
      y: 68,
      fontSize: 12,
      fontStyle: "bold",
      fill: CARD_CONFIG.colors.accentPrimary,
    }),
  );

  // Segmented Status Loading Bar Layout
  // we have to make sure we use their daily message count
  function calculateFill() {
    if ((msgs[0] ?? 0) < 10) return 0;
    if ((msgs[0] ?? 0) < 100) return 1;
    if ((msgs[0] ?? 0) < 1000) return 2;
    if ((msgs[0] ?? 0) < 10_000) return 3;
    return 0;
  }

  for (let i = 0; i < 4; i++) {
    commGroup.add(
      new Konva.Rect({
        x: 45 + i * 88,
        y: 105,
        width: 82,
        height: 5,
        fill:
          i < calculateFill()
            ? calculateFill() >= 3
              ? CARD_CONFIG.colors.accentPrimary
              : CARD_CONFIG.colors.accentSecondary
            : "#142830",
      }),
    );
  }

  mainLayer.add(commGroup);

  const rankGroup = new Konva.Group({ x: 450, y: 110 });
  rankGroup.add(
    new Konva.Rect({
      width: 450,
      height: 140,
      fill: CARD_CONFIG.colors.bgBadge,
      stroke: CARD_CONFIG.colors.bgBadge,
      strokeWidth: 1,
    }),
  );

  rankGroup.add(
    new Konva.Text({
      text: "RANKING",
      x: 45,
      y: 28,
      fontSize: 10,
      fontStyle: "bold",
      fill: CARD_CONFIG.colors.textMuted,
      tracking: 1.5,
    }),
  );

  rankGroup.add(
    new Konva.Text({
      text: (ranking[0] ?? -1).toLocaleString(),
      x: 45,
      y: 48,
      fontSize: 34,
      fontStyle: "bold",
      fill: CARD_CONFIG.colors.accentPrimary,
    }),
  );

  rankGroup.add(
    new Konva.Text({
      text: `/ ${gangs.length}`,
      x: 120,
      y: 64,
      fontSize: 13,
      fontStyle: "bold",
      fill: CARD_CONFIG.colors.accentPrimary,
    }),
  );

  // from the db
  const rankInc = (ranking[1] ?? -1) - (ranking[0] ?? -1);

  rankGroup.add(
    new Konva.Text({
      text:
        rankInc > 0
          ? `+${rankInc} POSITIONS (24H)`
          : `${rankInc} POSITIONS (24H)`,
      x: 45,
      y: 102,
      fontSize: 11,
      fontStyle: "bold",
      fill: rankInc > 0 ? "#1E8449" : CARD_CONFIG.colors.accentSecondary, // Green indicator trend color
    }),
  );

  mainLayer.add(rankGroup);

  const activityGroup = new Konva.Group({ x: 0, y: 250 });
  activityGroup.add(
    new Konva.Rect({
      width: 450,
      height: 140,
      fill: CARD_CONFIG.colors.bgBadge,
      stroke: CARD_CONFIG.colors.bgBadge,
      strokeWidth: 1,
    }),
  );

  activityGroup.add(
    new Konva.Text({
      text: "ACTIVITY (7 Days)",
      x: 45,
      y: 25,
      fontSize: 10,
      fontStyle: "bold",
      fill: CARD_CONFIG.colors.textMuted,
      tracking: 1.5,
    }),
  );

  // Equalizer-Style Data Bar Graph Rendering

  // This function needs a list of 7 data values
  function calculateBarHeight(values: number[]) {
    const res = [];
    const MIN = 0,
      MAX = 1000;

    for (const val of values) {
      const valueMin = Math.max(val, MIN);
      const v = Math.min(valueMin, MAX);
      const out = Math.log1p(v - MIN) / Math.log1p(MAX - MIN);
      res.push(out * 70);
    }

    return res;
  }

  calculateBarHeight(msgs).forEach((val, index) => {
    activityGroup.add(
      new Konva.Rect({
        x: 45 + index * 52,
        y: 115 - val,
        width: 44,
        height: val,
        fill:
          val >= 45
            ? CARD_CONFIG.colors.accentPrimary
            : CARD_CONFIG.colors.accentSecondary,
      }),
    );
  });

  mainLayer.add(activityGroup);

  const allianceGroup = new Konva.Group({ x: 450, y: 250 });
  allianceGroup.add(
    new Konva.Rect({
      width: 450,
      height: 140,
      fill: CARD_CONFIG.colors.bgCardElevated,
      stroke: CARD_CONFIG.colors.bgCard,
      strokeWidth: 1,
    }),
  );

  // Decorative Red Alert Neon Vertical bar separator split
  allianceGroup.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: 4,
      height: 140,
      fill: CARD_CONFIG.colors.accentSecondary,
    }),
  );

  allianceGroup.add(
    new Konva.Text({
      text: "NEXT IN LINE",
      x: 45,
      y: 35,
      fontSize: 10,
      fontStyle: "bold",
      fill: CARD_CONFIG.colors.textMuted,
      tracking: 1.5,
    }),
  );

  // Red Skull Logo Icon Box
  const iconBox = new Konva.Group({ x: 45, y: 55 });
  iconBox.add(
    new Konva.Rect({
      width: 34,
      height: 34,
      fill: "#2A161A",
      cornerRadius: 40,
    }),
  );
  iconBox.add(
    new Konva.Text({
      text: "💀",
      x: 0,
      y: 8,
      width: 34,
      align: "center",
      fontSize: 16,
    }),
  );
  allianceGroup.add(iconBox);

  // Alliance Name Text
  allianceGroup.add(
    new Konva.Text({
      text: nextInLine.name,
      x: 95,
      y: 56,
      fontSize: 18,
      fontStyle: "bold",
      fill: CARD_CONFIG.colors.textWhite,
      tracking: 1,
    }),
  );

  allianceGroup.add(
    new Konva.Text({
      text: nextInLine.leader,
      x: 95,
      y: 78,
      fontSize: 10,
      fontStyle: "bold",
      fill: CARD_CONFIG.colors.accentSecondary,
    }),
  );

  mainLayer.add(allianceGroup);

  function createFooterBlock(
    xPos: number,
    title: string,
    value: string,
    unit: string,
    color: string,
  ) {
    const g = new Konva.Group({ x: xPos, y: 415 });

    // Core container plate
    g.add(
      new Konva.Rect({
        width: 260,
        height: 75,
        fill: CARD_CONFIG.colors.bgCard,
        strokeWidth: 1,
        cornerRadius: 2,
      }),
    );

    // Top label header
    g.add(
      new Konva.Text({
        text: title,
        x: 20,
        y: 18,
        fontSize: 9,
        fontStyle: "bold",
        fill: CARD_CONFIG.colors.textMuted,
        tracking: 1,
      }),
    );

    // Quantifiable metric text value
    const mainVal = new Konva.Text({
      text: value,
      x: 20,
      y: 38,
      fontSize: 20,
      fontStyle: "bold",
      fill: color || CARD_CONFIG.colors.textWhite,
    });
    g.add(mainVal);

    if (unit) {
      g.add(
        new Konva.Text({
          text: unit,
          x: 25 + mainVal.getTextWidth(), // Push text dynamically safely next to value width
          y: 44,
          fontSize: 11,
          fontStyle: "bold",
          fill: color,
        }),
      );
    }

    return g;
  }

  const blockCredits = createFooterBlock(
    25,
    "GANG CREDITS",
    "N/A",
    "(coming soon)",
    CARD_CONFIG.colors.accentTertiary,
  );

  mainLayer.add(blockCredits);
  mainLayer.draw();
  return stage.toDataURL({ quality: 2 });
}
